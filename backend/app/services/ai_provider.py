"""AI Provider adapter supporting Gemini and OpenAI with deterministic fallback."""
import json
import logging
from typing import Any, Dict, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("internship_tracker.ai")


class AIProviderService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.timeout = settings.AI_PROVIDER_TIMEOUT_SECONDS

    @property
    def is_live_configured(self) -> bool:
        return bool(self.gemini_key or self.openai_key)

    async def generate_json(self, prompt: str, system_prompt: str = "") -> Optional[Dict[str, Any]]:
        """
        Attempt to call configured LLM provider for structured JSON output.
        Returns parsed dict if successful, None otherwise (triggering fallback).
        """
        # Try Gemini first if key exists
        if self.gemini_key:
            res = await self._call_gemini(prompt, system_prompt)
            if res is not None:
                return res

        # Try OpenAI if key exists
        if self.openai_key:
            res = await self._call_openai(prompt, system_prompt)
            if res is not None:
                return res

        return None

    async def _call_gemini(self, prompt: str, system_prompt: str) -> Optional[Dict[str, Any]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        payload = {
            "contents": [{"parts": [{"text": f"{system_prompt}\n\nTask:\n{prompt}"}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2
            }
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        return json.loads(text)
                else:
                    logger.warning(f"Gemini API returned status {response.status_code}")
        except Exception as e:
            logger.warning(f"Gemini API call failed: {type(e).__name__}")
        return None

    async def _call_openai(self, prompt: str, system_prompt: str) -> Optional[Dict[str, Any]]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": f"{system_prompt}\nYou MUST output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    return json.loads(content)
                else:
                    logger.warning(f"OpenAI API returned status {response.status_code}")
        except Exception as e:
            logger.warning(f"OpenAI API call failed: {type(e).__name__}")
        return None


ai_provider = AIProviderService()
