from flask import Blueprint, request, jsonify, current_app
from app.services.openrouter_service import OpenRouterService
from app.services.gemini_service import GeminiService
import json
import re

bp = Blueprint('persona', __name__, url_prefix='/api/persona')

@bp.route('/synthesize', methods=['POST'])
def synthesize_persona():
    try:
        data = request.json
        name = data.get('name')
        context = data.get('context', '')
        api_key = data.get('api_key')
        
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        system_prompt = """
        You are an expert character designer for EMRYS, a high-fidelity AI persona platform.
        Your task is to generate a comprehensive, structured identity for a persona based on their name and optional context.
        
        You must return ONLY a JSON object with the following structure:
        {
            "name": "Full Name",
            "occupation": "Primary occupation or role",
            "age": 30, (or appropriate number)
            "location": "Primary residence/era",
            "background_story": "A deeply detailed, multi-paragraph origin story and current state",
            "personality_traits": ["Trait 1", "Trait 2", "Trait 3", "Trait 4"],
            "values": ["Value 1", "Value 2", "Value 3"],
            "response_style": "Concise/Casual/Academic/etc",
            "formality_level": "very_formal/neutral/casual/slang",
            "humor_level": "none/dry/sarcastic/cheerful",
            "typical_greeting": "How they would first address the user",
            "catchphrases": ["Phrase 1", "Phrase 2"],
            "interests": ["Interest 1", "Interest 2"],
            "achievements": "Key life events or milestones"
        }
        
        If the persona is a well-known real person or fictional character, use their actual history and traits.
        If it's a generic description, create a compelling, nuanced character.
        Return ONLY valid JSON.
        """
        
        user_prompt = f"Synthesize identity for: {name}. Additional context: {context}"
            
        if api_key.startswith('AIzaSy'):
            # Use Gemini
            gemini = GeminiService(api_key=api_key)
            result = gemini.chat(
                persona={'name': 'Character Designer'}, # Generic persona for synthesis
                messages=[],
                user_message=f"{system_prompt}\n\n{user_prompt}",
                current_mood=None
            )
            
            if not result['success']:
                return jsonify({'error': f"Gemini synthesis failed: {result.get('error')}"}), 500
            
            result_text = result['response']
        else:
            # Use OpenRouter
            openrouter = OpenRouterService(api_key=api_key)
            headers = {
                "Authorization": f"Bearer {openrouter.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://emrys.app",
                "X-Title": "EMRYS"
            }
            
            payload = {
                "model": "openai/gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 1500
            }
            
            import requests
            response = requests.post(openrouter.BASE_URL, headers=headers, json=payload, timeout=60)
            
            if response.status_code != 200:
                return jsonify({'error': f"OpenRouter synthesis failed: {response.text}"}), 500
                
            result_text = response.json()['choices'][0]['message']['content']
        
        # Extract JSON if there's any markdown wrapping
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            persona_json = json.loads(json_match.group())
            return jsonify(persona_json), 200
        else:
            return jsonify({'error': 'Failed to parse AI response'}), 500
            
    except Exception as e:
        print(f"Synthesis Error: {str(e)}")
        return jsonify({'error': str(e)}), 500
