"""
LLM-based grammar refinement using OpenAI GPT-4o-mini.
Identifies additional grammar errors not caught by rule-based checker.
"""

import json
import logging
from typing import Optional
from openai import AsyncOpenAI, OpenAIError

from backend.config import settings
from backend.services.mcp_clients import BaseMCPClient
from backend.models.response import NormalizedError

logger = logging.getLogger(__name__)


class LLMUnavailableError(Exception):
    """Raised when LLM service is unavailable."""
    pass


SYSTEM_PROMPT = """You are a grammar correction assistant for secondary school English learners. Your task is to identify grammar errors in the student's text that were NOT already caught by the rule-based checker.

RULES:
- DO NOT change vocabulary, writing style, or sentence meaning
- DO NOT re-correct errors already listed in the context
- ONLY identify additional grammar errors
- Focus on: tense consistency, preposition usage, contextual agreement

Respond ONLY in this JSON format:
{
  "corrected_text": "<full corrected text>",
  "additional_errors": [
    {
      "original": "<wrong word/phrase>",
      "correction": "<corrected form>",
      "error_type": "<tense|subject_verb|article|preposition|spelling|punctuation|other>",
      "explanation": "<one sentence in simple English>",
      "source": "llm",
      "offset": null
    }
  ]
}"""


class OpenAIGrammarMCP(BaseMCPClient):
    """MCP client for OpenAI grammar refinement."""
    
    tool_name = "openai_grammar"
    
    def __init__(self):
        self._client: AsyncOpenAI | None = None
        self.model = "gpt-4o-mini"
        self.temperature = 0
    
    def _get_client(self) -> AsyncOpenAI:
        """Lazy initialization of OpenAI client."""
        if self._client is None:
            self._client = AsyncOpenAI(api_key=settings.openai_api_key)
        return self._client
    
    async def refine_grammar(
        self, 
        text: str, 
        existing_errors: list[dict]
    ) -> list[NormalizedError]:
        """
        Refine grammar using LLM to find additional errors.
        
        Args:
            text: Original text to check
            existing_errors: Errors already found by rule-based checker
            
        Returns:
            List of additional NormalizedError objects
            
        Raises:
            LLMUnavailableError: If LLM service is unavailable
        """
        user_prompt = self._build_user_prompt(text, existing_errors)
        
        try:
            client = self._get_client()
            response = await client.chat.completions.create(
                model=self.model,
                temperature=self.temperature,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            content = response.choices[0].message.content
            if not content:
                logger.warning("LLM returned empty response")
                return []
            
            result = json.loads(content)
            additional_errors = result.get("additional_errors", [])
            
            normalized = []
            for error in additional_errors:
                normalized.append(NormalizedError(
                    original=error.get("original", ""),
                    correction=error.get("correction", ""),
                    error_type=error.get("error_type", "other"),
                    explanation=error.get("explanation", ""),
                    source="llm",
                    offset=error.get("offset")
                ))
            
            return normalized
            
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse LLM JSON response: {e}")
            return []
        except OpenAIError as e:
            logger.warning(f"OpenAI API error: {e}")
            raise LLMUnavailableError(f"LLM service error: {e}")
        except Exception as e:
            logger.warning(f"LLM unexpected error: {e}")
            raise LLMUnavailableError(f"LLM service unavailable: {e}")
    
    def _build_user_prompt(self, text: str, existing_errors: list[dict]) -> str:
        """Build user prompt with context of existing errors."""
        prompt = f"Original text:\n{text}\n\n"
        
        if existing_errors:
            prompt += "Errors already found by rule-based checker:\n"
            for i, error in enumerate(existing_errors, 1):
                prompt += f"{i}. {error.get('original', '')} → {error.get('correction', '')}\n"
            prompt += "\nFind ADDITIONAL grammar errors not in the list above.\n"
        else:
            prompt += "No errors found by rule-based checker. Find all grammar errors.\n"
        
        return prompt
    
    async def call(self, input: dict) -> dict:
        """MCP interface for grammar refinement."""
        text = input.get("text", "")
        existing_errors = input.get("existing_errors", [])
        errors = await self.refine_grammar(text, existing_errors)
        return {"additional_errors": [vars(e) for e in errors]}
    
    async def health_check(self) -> bool:
        """Check if OpenAI service is available."""
        try:
            client = self._get_client()
            await client.models.list()
            return True
        except Exception:
            return False
