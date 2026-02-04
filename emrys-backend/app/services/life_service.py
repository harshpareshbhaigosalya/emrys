from datetime import datetime

class LifeService:
    @staticmethod
    def generate_reflection(persona, history, user_id, api_key):
        """
        Generate a spontaneous 'thought' or 'reflection' based on persona and history
        """
        # Build a prompt for reflection
        prompt = f"Imagine you are {persona['name']}. You are currently alone and reflecting on your conversation history. "
        prompt += "Based on what you've discussed or what you are curious about, write a short, authentic 'thought' (1-2 sentences). "
        prompt += "It should sound like a personal reflection, not a message to someone. "
        prompt += "Example: 'I wonder if they truly meant what they said about the future... machines can be so unpredictable.'"
        
        if history:
            last_msgs = [m['content'] for m in history[-5:]]
            prompt += f"\nRecent context you are thinking about: {'; '.join(last_msgs)}"
        
        # Determine service based on key prefix
        from app.services.openrouter_service import OpenRouterService
        from app.services.gemini_service import GeminiService
        
        if api_key.startswith('AIzaSy'):
            ai_service = GeminiService(api_key=api_key)
            result = ai_service.chat(
                persona=persona,
                messages=[],
                user_message=prompt,
                additional_context="You are in introspection mode. Write a short internal thought."
            )
        else:
            openrouter = OpenRouterService(api_key=api_key)
            result = openrouter.chat(
                persona=persona,
                messages=[],
                user_message=prompt,
                model='fast',
                additional_context="You are in introspection mode. Write a short internal thought."
            )
        
        if result['success']:
            return {
                'content': result['response'].replace('"', '').strip(),
                'mood_code': result.get('mood', 'default'),
                'created_at': datetime.now().isoformat()
            }
        return None
