"""
Grammar checking module.
Contains preprocessing, rule-based checking, LLM refinement, and pipeline orchestration.
"""

from backend.services.grammar.pipeline import run_pipeline
from backend.services.grammar.preprocessor import preprocess
from backend.services.grammar.languagetool_client import LanguageToolMCP, LTUnavailableError
from backend.services.grammar.llm_refiner import OpenAIGrammarMCP, LLMUnavailableError
from backend.services.grammar.merger import merge

__all__ = [
    'run_pipeline',
    'preprocess',
    'LanguageToolMCP',
    'LTUnavailableError',
    'OpenAIGrammarMCP',
    'LLMUnavailableError',
    'merge'
]
