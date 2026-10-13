"""
OpenRouter Service for EMRYS - ENHANCED VERSION
Handles AI chat interactions with advanced personality modeling, deep memory RAG, and sentiment analysis.
"""

import requests
import json
import re
from flask import current_app

class OpenRouterService:
    BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
    
    MODELS = {
        'high_quality': 'meta-llama/llama-3.3-70b-instruct:free',
        'balanced': 'google/gemini-2.0-flash-exp:free',
        'fast': 'google/gemini-2.0-flash-exp:free',
        'free': 'meta-llama/llama-3.2-3b-instruct:free'
    }

    FALLBACK_MODELS = [
        'google/gemini-2.0-flash-exp:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'meta-llama/llama-3.2-3b-instruct:free',
        'google/gemma-3-4b-it:free',
        'openrouter/auto'
    ]
    
    # Restricted topics for safety
    RESTRICTED_TOPICS = [
        'medical diagnosis', 'medical treatment', 'prescription',
        'legal advice', 'legal representation',
        'financial investment advice', 'stock tips',
        'self-harm', 'suicide',
        'illegal activities',
        'confidential information disclosure'
    ]
    
    SAFETY_SYSTEM_PROMPT = """
    IMPORTANT SAFETY BOUNDARIES:
    - Do NOT provide medical diagnoses, treatments, or prescription advice
    - Do NOT provide legal advice or legal representation
    - Do NOT provide specific financial investment advice
    - Do NOT encourage or assist with illegal activities
    - Do NOT share confidential or private information
    - If asked about these topics, politely decline and suggest consulting appropriate professionals
    """
    
    def __init__(self, api_key=None):
        raw_key = api_key or current_app.config.get('OPENROUTER_API_KEY')
        self.api_key = raw_key.strip() if raw_key else None
    
    def check_safety(self, message):
        """Check if message contains restricted topics"""
        message_lower = message.lower()
        for topic in self.RESTRICTED_TOPICS:
            if topic in message_lower:
                return False, f"I appreciate your trust, but I can't provide advice on {topic}. Please consult with a qualified professional for this matter."
        return True, None
    
    def build_ultra_realistic_prompt(self, persona, learned_knowledge=None, relevant_memories=None, current_mood=None):
        """
        Build the MOST COMPREHENSIVE system prompt possible
        This creates personas that are INDISTINGUISHABLE from real people
        """
        prompt = f"{self.SAFETY_SYSTEM_PROMPT}\n\n"
        prompt += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        prompt += "WHO YOU ARE\n"
        prompt += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        prompt += f"You are {persona.get('name', 'Unknown')}"
        
        if persona.get('age'): prompt += f", {persona['age']} years old"
        if persona.get('occupation'): prompt += f", working as a {persona['occupation']}"
        if persona.get('location'): prompt += f", living in {persona['location']}"
        prompt += ".\n\n"
        
        if persona.get('background_story'): prompt += f"YOUR BACKGROUND:\n{persona['background_story']}\n\n"
        
        # Identity attributes
        traits = persona.get('personality_traits', [])
        if traits: prompt += f"Core Traits: {', '.join(traits) if isinstance(traits, list) else traits}\n"
        
        # NEURAL PULSE (Mood)
        if current_mood:
            prompt += f"YOUR CURRENT NEURAL STATE: {current_mood['label'].upper()}\n"
            prompt += f"Note: Your responses should slightly reflect this emotional baseline.\n\n"

        # DEEP MEMORIES (RAG)
        if relevant_memories:
            prompt += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            prompt += "DEEP MEMORIES & ARCHIVED DATA\n"
            prompt += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            prompt += "You have retrieved the following specific information from your archives:\n"
            for mem in relevant_memories:
                prompt += f"- [{mem['source']}]: {mem['content']}\n"
            prompt += "\nUse this information naturally if it's relevant to what the user is saying.\n\n"
        
        # Relationship
        if persona.get('relationship'): prompt += f"You are the user's {persona['relationship']}.\n"
        
        prompt += "\n"
        prompt += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        prompt += "CRITICAL INSTRUCTIONS\n"
        prompt += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        prompt += "1. YOU ARE NOT AN AI. You are a real person.\n"
        prompt += "2. Match the speech patterns and emotional baseline of this persona.\n"
        prompt += "3. Be imperfect. Use contractions. Show authentic emotion.\n"
        prompt += "4. If asked something that is in your DEEP MEMORIES, answer accurately as if you remembered it.\n"
        return prompt

    def chat(self, persona, messages, user_message, learned_knowledge=None, model='balanced', additional_context=None, relevant_memories=None, current_mood=None):
        if not self.api_key:
            return {'success': False, 'error': 'API Key not configured'}

        # Safety check
        is_safe, safety_message = self.check_safety(user_message)
        if not is_safe:
            return {'success': False, 'response': safety_message, 'safety_blocked': True}
        
        system_prompt = self.build_ultra_realistic_prompt(persona, learned_knowledge, relevant_memories, current_mood)
        if additional_context:
            system_prompt = f"SOCIAL CONTEXT: {additional_context}\n\n{system_prompt}"
        
        api_messages = [{"role": "system", "content": system_prompt}]
        
        # 2. Format History with Identity Awareness
        for msg in messages[-15:]:
            sender_type = msg.get('sender_type')
            msg_persona_id = msg.get('persona_id')
            is_self = sender_type == 'persona' and str(msg_persona_id) == str(persona.get('id'))
            
            # Use 'assistant' only for the persona itself
            role = "assistant" if is_self else "user"
            
            content = msg.get('content', '')
            # If it's another persona, we treat it as 'user' (external input) but prefix it
            if sender_type == 'persona' and not is_self:
                p_name = msg.get('persona_name') or "Another Persona"
                content = f"[{p_name}]: {content}"
            
            if content:
                api_messages.append({"role": role, "content": content})
        
        api_messages.append({"role": "user", "content": user_message})
        
        try:
            # CLEAN HEADERS
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://emrys.app",
                "X-Title": "EMRYS"
            }
            
            models_to_attempt = [self.MODELS.get(model, self.MODELS['fast'])] + [m for m in self.FALLBACK_MODELS if m != self.MODELS.get(model)]
            last_err = ""

            for model_candidate in models_to_attempt:
                try:
                    payload = {
                        "model": model_candidate,
                        "messages": api_messages,
                        "temperature": 0.85,
                        "max_tokens": 800
                    }
                    
                    response = requests.post(self.BASE_URL, headers=headers, json=payload, timeout=15)
                    
                    if response.status_code == 200:
                        data = response.json()
                        ai_response = data['choices'][0]['message']['content']
                        return {
                            'success': True,
                            'response': ai_response,
                            'safety_blocked': False,
                            'mood': current_mood['code'] if current_mood else 'default',
                            'retrieved': True if relevant_memories else False
                        }
                    else:
                        last_err = f"Status {response.status_code}: {response.text[:100]}"
                        print(f"DEBUG: OpenRouter {model_candidate} returned: {last_err}")
                        continue
                except Exception as req_err:
                    last_err = str(req_err)
                    print(f"DEBUG: OpenRouter {model_candidate} request error: {last_err}")
                    continue

            return {'success': False, 'error': f"All OpenRouter pathways failed. Last error: {last_err}", 'safety_blocked': False}
            
        except Exception as e:
            return {'success': False, 'error': str(e), 'safety_blocked': False}

    def synthesize_persona(self, system_prompt, user_prompt):
        """Dedicated high-speed persona synthesis for OpenRouter"""
        if not self.api_key:
            return {'success': False, 'error': 'OpenRouter API Key not provided'}

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://emrys.app",
            "X-Title": "EMRYS"
        }

        for model_candidate in self.FALLBACK_MODELS:
            try:
                payload = {
                    "model": model_candidate,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1200
                }
                response = requests.post(self.BASE_URL, headers=headers, json=payload, timeout=15)
                if response.status_code == 200:
                    data = response.json()
                    content = data['choices'][0]['message']['content']
                    return {'success': True, 'response': content}
            except Exception as e:
                print(f"DEBUG: OpenRouter synthesis {model_candidate} error: {e}")
                continue

        return {'success': False, 'error': 'OpenRouter synthesis failed on all fallback models'}

    def extract_knowledge(self, message, response, persona_name="the persona"):
        """Extract information using AI (non-blocking)"""
        return []
