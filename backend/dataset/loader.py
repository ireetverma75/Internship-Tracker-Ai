"""
Hugging Face Dataset Loader with disk & in-memory caching.
Loads 'priyaagarwal19/Jobs-tabular-dataset' (original: 391 listings, augmented: 1,600 listings).
"""
import os
import json
import logging
from typing import Dict, Any, List, Optional
import pandas as pd
from datasets import load_dataset, DatasetDict

logger = logging.getLogger("internship_tracker.dataset.loader")

DATASET_NAME = "priyaagarwal19/Jobs-tabular-dataset"
CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "cache")

# In-memory split cache
_MEMORY_CACHE: Dict[str, List[Dict[str, Any]]] = {}

def get_cache_file_path(split: str) -> str:
    os.makedirs(CACHE_DIR, exist_ok=True)
    return os.path.join(CACHE_DIR, f"{split}_jobs_cache.json")

def load_raw_dataset(split: str = "original", force_refresh: bool = False) -> List[Dict[str, Any]]:
    """
    Load dataset split ('original' or 'augmented') from Hugging Face or local cache.
    Caches results to disk & in-memory for instant subsequent access.
    """
    global _MEMORY_CACHE

    if split not in ["original", "augmented", "all"]:
        raise ValueError(f"Unknown split '{split}'. Must be 'original', 'augmented', or 'all'.")

    # In-memory check
    if not force_refresh and split in _MEMORY_CACHE:
        logger.info(f"Returning {split} dataset from in-memory cache ({len(_MEMORY_CACHE[split])} records).")
        return _MEMORY_CACHE[split]

    cache_path = get_cache_file_path(split)

    # Local disk cache check
    if not force_refresh and os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _MEMORY_CACHE[split] = data
                logger.info(f"Loaded {split} dataset from local file cache ({len(data)} records).")
                return data
        except Exception as e:
            logger.warning(f"Error reading disk cache at {cache_path}: {e}. Reloading from Hugging Face.")

    logger.info(f"Fetching dataset '{DATASET_NAME}' split='{split}' via Hugging Face datasets library...")
    try:
        if split == "all":
            ds_dict = load_dataset(DATASET_NAME)
            orig_list = [dict(row) for row in ds_dict["original"]]
            aug_list = [dict(row) for row in ds_dict["augmented"]]
            combined = orig_list + aug_list
            _save_to_cache(split, combined)
            _MEMORY_CACHE[split] = combined
            return combined
        else:
            ds = load_dataset(DATASET_NAME, split=split)
            data_list = [dict(row) for row in ds]
            _save_to_cache(split, data_list)
            _MEMORY_CACHE[split] = data_list
            logger.info(f"Successfully loaded split '{split}' with {len(data_list)} records from Hugging Face.")
            return data_list

    except Exception as e:
        logger.error(f"Failed to load dataset from Hugging Face: {e}")
        # If cache exists on failure, fallback
        if os.path.exists(cache_path):
            with open(cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _MEMORY_CACHE[split] = data
                logger.info(f"Fell back to cached data ({len(data)} records).")
                return data
        raise RuntimeError(f"Could not load Hugging Face dataset '{DATASET_NAME}' [{split}]: {str(e)}") from e

def _save_to_cache(split: str, data: List[Dict[str, Any]]) -> None:
    cache_path = get_cache_file_path(split)
    try:
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"Cached {len(data)} records to {cache_path}")
    except Exception as e:
        logger.warning(f"Failed to write disk cache to {cache_path}: {e}")

def inspect_dataset_splits() -> Dict[str, Any]:
    """Inspect summary metadata for both splits."""
    orig = load_raw_dataset("original")
    aug = load_raw_dataset("augmented")
    return {
        "dataset_name": DATASET_NAME,
        "splits": {
            "original": {
                "count": len(orig),
                "is_synthetic": False,
                "columns": list(orig[0].keys()) if orig else []
            },
            "augmented": {
                "count": len(aug),
                "is_synthetic": True,
                "columns": list(aug[0].keys()) if aug else []
            }
        }
    }
