"""
Gemini Service for EMRYS
Handles direct communication with Google AI Studio (Gemini API).
"""

import google.generativeai as genai
import json

class GeminiService:
    def __init__(self, api_key):
        self.api_key = api_key
        genai.configure(api_key=self.api_key)
        # Using gemini-1.5-flash (consistent naming)
        self.model_name = 'gemini-1.5-flash'

    def chat(self, persona, messages, user_message, additional_context=None, relevant_memories=None, current_mood=None):
        error_msg = ""
        # 2026 Neural Pathway Priority (Optimized for Flash series)
        models_to_try = [
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash',
            'gemini-1.5-pro'
        ]
        
        for model_id in models_to_try:
            try:
                actual_model_id = model_id if '/' in model_id else f"models/{model_id}"
                print(f"DEBUG: Attempting neural link via {actual_model_id}...")
                # 1. Build System Instruction
                system_instruction = self._build_system_instruction(persona, additional_context, relevant_memories, current_mood)
                
                model = genai.GenerativeModel(
                    model_name=actual_model_id,
                    system_instruction=system_instruction
                )

                # 2. Format History
                chat_history = []
                for msg in messages[-10:]:
                    role = 'user' if msg.get('sender_type') == 'user' else 'model'
                    chat_history.append({
                        'role': role,
                        'parts': [msg.get('content', '')]
                    })

                # 3. Start Chat and Send Message
                chat_session = model.start_chat(history=chat_history)
                response = chat_session.send_message(user_message)
                
                print(f"DEBUG: Neural link established successfully via {model_id}")
                return {
                    'success': True,
                    'response': response.text,
                    'mood': current_mood['code'] if current_mood else 'default',
                    'retrieved': True if relevant_memories else False
                }
            except Exception as e:
                error_msg = str(e)
                if "404" in error_msg or "not found" in error_msg.lower():
                    print(f"DEBUG: Model {model_id} rejected (404). Seeking alternative pathway...")
                    continue
                elif "429" in error_msg or "quota" in error_msg.lower():
                    print(f"DEBUG: Model {model_id} quota reached (429). Shifting neural load...")
                    import time
                    time.sleep(2) # Short pause to satisfy neural throttle
                    continue
                else:
                    # If it's another error (safety, etc), we might want to stop
                    print(f"DEBUG: {model_id} failed with non-retryable error: {error_msg}")
                    break

        print(f"Gemini API failure after exhaustive search: {error_msg}")
        return {'success': False, 'error': f"Neural Exhaustion: {error_msg}. Please wait a moment for the link to recover."}

    def _build_system_instruction(self, persona, additional_context, relevant_memories, current_mood):
        instr = f"You are {persona.get('name', 'AI Persona')}.\n"
        
        if persona.get('occupation'): instr += f"Occupation: {persona['occupation']}\n"
        if persona.get('background_story'): instr += f"Background: {persona['background_story']}\n"
        if persona.get('personality_traits'): instr += f"Traits: {persona['personality_traits']}\n"
        
        if current_mood:
            instr += f"Current Neural State (Mood): {current_mood['label']}. Let this slightly influence your tone.\n"

        if additional_context:
            instr += f"Context: {additional_context}\n"

        if relevant_memories:
            instr += "Retrieved Memories:\n"
            for mem in relevant_memories:
                instr += f"- {mem['content']}\n"
            instr += "Use these memories naturally.\n"

        instr += "\nRULES:\n"
        instr += "1. NEVER mention you are an AI or Google. You ARE this persona.\n"
        instr += "2. Be human-centric. Use natural speech patterns, contractions, and authentic emotion.\n"
        instr += "3. Keep responses reasonably concise but engaging.\n"
        
        return instr

    def extract_knowledge(self, message, response, persona_name):
        # Optional: Implement knowledge extraction using Gemini if needed
        pass
