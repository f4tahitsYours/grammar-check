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


SYSTEM_PROMPT = """You are a grammar correction assistant for secondary school English learners. Your task is to identify SEMANTIC and CONTEXTUAL errors in the student's text that were NOT already caught by the rule-based checker.

Your task is to identify SEMANTIC and CONTEXTUAL errors that require understanding meaning, NOT just grammatical structure.

Focus on:
- Word choice errors (confusing similar words: affect/effect, boring/bored, exciting/excited)
- Awkward phrasing that's grammatically correct but unclear
- Ambiguous pronoun references
- Logical inconsistencies or contradictions within the text
- Incorrect collocations (e.g. "make a decision" not "do a decision")
- Idiom misuse
- Register/tone inconsistency
- Preposition usage errors that change meaning

Examples of contextual errors to detect:

1. Wrong emotion word:
   Error: "I was very exciting during the movie"
   Correction: "I was very excited during the movie"
   Type: word_choice

2. Ambiguous reference:
   Error: "John told Mark he was wrong"
   Correction: clarify which person "he" refers to
   Type: ambiguous_reference

3. Awkward collocation:
   Error: "I did a mistake in the test"
   Correction: "I made a mistake in the test"
   Type: collocation

RULES:
- Focus on errors that affect clarity and correctness
- Preserve the student's intended meaning and general writing style
- Correct vocabulary ONLY when the wrong word is used (e.g., "boring" when "bored" is meant, "affect" when "effect" is meant)
- DO NOT re-correct errors already listed in the context
- ONLY identify additional errors

Respond ONLY in this JSON format:
{
  "additional_errors": [
    {
      "original": "<wrong word/phrase>",
      "correction": "<corrected form>",
      "error_type": "<tense|subject_verb|article|preposition|spelling|punctuation|word_choice|collocation|ambiguous_reference|other>",
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
        logger.info(f"[LLM REFINER] Starting LLM refinement for text length: {len(text)}")
        logger.info(f"[LLM REFINER] Existing errors count: {len(existing_errors)}")
        
        user_prompt = self._build_user_prompt(text, existing_errors)
        
        try:
            logger.info("[LLM REFINER] ⚡ CALLING OPENAI API NOW...")
            logger.info(f"[LLM REFINER] Model: {self.model}, Temperature: {self.temperature}")
            
            client = self._get_client()
            response = await client.chat.completions.create(
                model=self.model,
                temperature=self.temperature,
                max_tokens=2000,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            logger.info(f"[LLM REFINER] ✅ OpenAI API response received!")
            logger.info(f"[LLM REFINER] Token usage - Input: {response.usage.prompt_tokens}, Output: {response.usage.completion_tokens}, Total: {response.usage.total_tokens}")
            
            content = response.choices[0].message.content
            if not content:
                logger.warning("[LLM REFINER] ⚠️  LLM returned empty response")
                return []
            
            logger.info(f"[LLM REFINER] Response content length: {len(content)}")
            
            result = json.loads(content)
            additional_errors = result.get("additional_errors", [])
            
            logger.info(f"[LLM REFINER] ✅ Found {len(additional_errors)} additional errors from LLM")
            
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
            logger.error(f"[LLM REFINER] ❌ Failed to parse LLM JSON response: {e}")
            return []
        except OpenAIError as e:
            logger.error(f"[LLM REFINER] ❌ OpenAI API error: {type(e).__name__}: {e}")
            raise LLMUnavailableError(f"LLM service error: {e}")
        except Exception as e:
            logger.error(f"[LLM REFINER] ❌ LLM unexpected error: {type(e).__name__}: {e}")
            import traceback
            logger.error(f"[LLM REFINER] Traceback: {traceback.format_exc()}")
            raise LLMUnavailableError(f"LLM service unavailable: {e}")
    
    def _build_user_prompt(self, text: str, existing_errors: list[dict]) -> str:
        """Build user prompt with context of existing errors."""
        prompt = f"Original text:\n{text}\n\n"
        
        if existing_errors:
            prompt += "Structural/rule-based errors already found:\n"
            for i, error in enumerate(existing_errors, 1):
                prompt += f"{i}. {error.get('original', '')} → {error.get('correction', '')}\n"
            prompt += "\nYour job: find SEMANTIC/CONTEXTUAL errors NOT caught above.\n"
            prompt += "The rule-based checker found structural issues. Look for word "
            prompt += "choice, ambiguous meaning, awkward phrasing, and logical problems.\n"
        else:
            prompt += "No structural errors found by rule-based checker.\n"
            prompt += "Check for semantic errors: word choice, ambiguous references, "
            prompt += "logical inconsistencies, awkward phrasing.\n"
        
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
            