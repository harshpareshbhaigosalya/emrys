import os
import json
import re
from flask import Blueprint, request, jsonify, current_app
from app.services.openrouter_service import OpenRouterService
from app.services.gemini_service import GeminiService

bp = Blueprint('persona', __name__, url_prefix='/api/persona')

def clean_and_parse_json(text):
    """Safely extracts and parses JSON even if wrapped in markdown blocks"""
    text = (text or '').strip()
    # Strip markdown ```json ... ``` blocks
    clean_text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    clean_text = re.sub(r'```\s*$', '', clean_text, flags=re.MULTILINE).strip()

    try:
        return json.loads(clean_text)
    except Exception:
        # Fallback to greedy regex match for {...}
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError("Could not parse JSON from model output")

@bp.route('/synthesize', methods=['POST'])
def synthesize_persona():
    try:
        data = request.json or {}
        name = (data.get('name') or '').strip()
        context = (data.get('context') or '').strip()
        raw_key = data.get('api_key') or current_app.config.get('OPENROUTER_API_KEY') or os.getenv('GEMINI_API_KEY')
        api_key = (raw_key or '').strip()

        if not name:
            return jsonify({'error': 'Name is required to synthesize an identity.'}), 400

        if not api_key:
            return jsonify({'error': 'No API key provided. Please save your Gemini or OpenRouter key in Settings/Profile.'}), 400

        system_prompt = """You are an expert character designer for EMRYS, a high-fidelity AI persona platform.
Your task is to generate a comprehensive, structured identity for a persona based on their name and optional context.

You must return ONLY a JSON object with this exact structure:
{
    "name": "Full Name",
    "occupation": "Primary occupation or role",
    "age": 30,
    "location": "Primary residence/era",
    "background_story": "A deeply detailed, multi-paragraph origin story and current state",
    "personality_traits": ["Trait 1", "Trait 2", "Trait 3", "Trait 4"],
    "values": ["Value 1", "Value 2", "Value 3"],
    "response_style": "Concise/Casual/Academic/etc",
    "formality_level": "casual",
    "humor_level": "cheerful",
    "typical_greeting": "How they would first address the user",
    "catchphrases": ["Phrase 1", "Phrase 2"],
    "interests": ["Interest 1", "Interest 2"],
    "achievements": "Key life events or milestones"
}

If the persona is a well-known real person or fictional character, use their actual history and traits.
If it is generic, invent a compelling, nuanced character.
Return ONLY valid JSON without markdown wrapping."""

        user_prompt = f"Synthesize identity for: {name}. Additional context: {context}"

        is_gemini = api_key.startswith('AIza')

        if is_gemini:
            gemini = GeminiService(api_key=api_key)
            result = gemini.synthesize_persona(system_prompt=system_prompt, user_prompt=user_prompt)
        else:
            openrouter = OpenRouterService(api_key=api_key)
            result = openrouter.synthesize_persona(system_prompt=system_prompt, user_prompt=user_prompt)

        if not result.get('success'):
            return jsonify({'error': f"Synthesis failed: {result.get('error', 'AI service error')}"}), 500

        result_text = result.get('response', '')
        persona_json = clean_and_parse_json(result_text)
        return jsonify(persona_json), 200

    except Exception as e:
        print(f"Synthesis Error: {str(e)}")
        return jsonify({'error': f"AI synthesis error: {str(e)}"}), 500
