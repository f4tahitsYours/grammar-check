"""
LanguageTool API client for rule-based grammar checking.
"""

import logging
from dataclasses import dataclass
from typing import Literal, Optional
import httpx

from backend.config import settings
from backend.services.mcp_clients import BaseMCPClient

logger = logging.getLogger(__name__)


class LTUnavailableError(Exception):
    """Raised when LanguageTool service is unavailable."""
    pass


@dataclass
class RawError:
    """Raw error from LanguageTool API."""
    original: str
    correction: str
    offset: int
    length: int
    rule_id: str
    category: str
    message: str
    source: Literal["rule_based"] = "rule_based"


class LanguageToolMCP(BaseMCPClient):
    """MCP client for LanguageTool grammar checking service."""
    
    tool_name = "languagetool"
    
    def __init__(self):
        self.base_url = settings.LANGUAGETOOL_URL
        self.timeout = 10.0
    
    async def check_grammar(self, text: str) -> list[RawError]:
        """
        Check grammar using LanguageTool API.
        
        Args:
            text: Text to check
            
        Returns:
            List of RawError objects
            
        Raises:
            LTUnavailableError: If service is unavailable or times out
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/check",
                    data={
                        "text": text,
                        "language": "en-US",
                        "enabledOnly": "false"
                    }
                )
                response.raise_for_status()
                
            data = response.json()
            matches = data.get("matches", [])
            
            errors = []
            for match in matches:
                replacements = match.get("replacements", [])
                if not replacements:
                    continue
                
                errors.append(RawError(
                    original=match.get("context", {}).get("text", "")[
                        match.get("context", {}).get("offset", 0):
                        match.get("context", {}).get("offset", 0) + match.get("context", {}).get("length", 0)
                    ],
                    correction=replacements[0].get("value", ""),
                    offset=match.get("offset", 0),
                    length=match.get("length", 0),
                    rule_id=match.get("rule", {}).get("id", ""),
                    category=match.get("rule", {}).get("category", {}).get("id", "MISC"),
                    message=match.get("message", ""),
                    source="rule_based"
                ))
            
            return errors
            
        except httpx.TimeoutException:
            logger.warning("LanguageTool request timed out")
            raise LTUnavailableError("LanguageTool service timeout")
        except httpx.HTTPError as e:
            logger.warning(f"LanguageTool HTTP error: {e}")
            raise LTUnavailableError(f"LanguageTool service error: {e}")
        except Exception as e:
            logger.warning(f"LanguageTool unexpected error: {e}")
            raise LTUnavailableError(f"LanguageTool service unavailable: {e}")
    
    async def call(self, input: dict) -> dict:
        """MCP interface for grammar checking."""
        text = input.get("text", "")
        errors = await self.check_grammar(text)
        return {"errors": [vars(e) for e in errors]}
    
    async def health_check(self) -> bool:
        """Check if LanguageTool service is available."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/languages")
                return response.status_code == 200
        except Exception:
            return False
