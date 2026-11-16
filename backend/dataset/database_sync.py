"""
Database synchronization module for Hugging Face Jobs.
Safely syncs preprocessed dataset rows into the `jobs` table,
preventing duplicate entries and preserving existing user/application data.
"""
import logging
from typing import Dict, Any, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Job
from dataset.loader import load_raw_dataset
from dataset.preprocessing import preprocess_dataset

logger = logging.getLogger("internship_tracker.dataset.database_sync")

async def sync_dataset_to_db(
    session: AsyncSession,
    split: str = "original",
    max_records: Optional[int] = None
) -> Dict[str, Any]:
    """
    Load split from Hugging Face dataset, preprocess, and sync to database.
    - 'original' is marked with is_synthetic=False
    - 'augmented' is marked with is_synthetic=True
    """
    logger.info(f"Starting dataset database sync for split='{split}'...")

    is_synthetic = (split == "augmented")
    raw_data = load_raw_dataset(split=split)
    total_loaded = len(raw_data)

    if max_records and max_records > 0:
        raw_data = raw_data[:max_records]

    cleaned_records, duplicates_in_batch = preprocess_dataset(raw_data, is_synthetic=is_synthetic)

    # Fetch existing jobs from database to avoid duplicate insertions
    existing_query = select(Job.job_title, Job.company, Job.description)
    result = await session.execute(existing_query)
    existing_set = {
        (
            (row.job_title or "").lower().strip(),
            (row.company or "").lower().strip(),
            (row.description or "").lower().strip()[:150]
        )
        for row in result.all()
    }

    inserted_count = 0
    skipped_count = 0

    for item in cleaned_records:
        key = (
            item["job_title"].lower().strip(),
            item["company"].lower().strip(),
            (item["description"] or "").lower().strip()[:150]
        )

        if key in existing_set:
            skipped_count += 1
            continue

        job = Job(
            job_title=item["job_title"],
            company=item["company"],
            job_type=item["job_type"],
            description=item["description"],
            qualifications=item["qualifications"],
            duties=item["duties"],
            pay=item["pay"],
            source=item["source"],
            is_synthetic=item["is_synthetic"]
        )
        session.add(job)
        existing_set.add(key)
        inserted_count += 1

    await session.commit()

    # Get total jobs count in database
    count_query = select(func.count(Job.id))
    total_in_db = (await session.execute(count_query)).scalar() or 0

    logger.info(
        f"Sync completed for {split}: {inserted_count} inserted, {skipped_count} skipped/existing, "
        f"{duplicates_in_batch} batch duplicates removed. Total jobs in DB: {total_in_db}"
    )

    return {
        "status": "success",
        "split": split,
        "total_loaded": total_loaded,
        "duplicates_removed": duplicates_in_batch,
        "records_inserted": inserted_count,
        "records_updated": skipped_count,
        "total_jobs_in_db": total_in_db
    }
