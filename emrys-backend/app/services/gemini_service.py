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
            'models/gemini-2.0-flash',
            'models/gemini-2.0-flash-lite',
            'models/gemini-2.5-flash',
            'models/gemini-flash-latest'
        ]
        
        for model_id in models_to_try:
            try:
                print(f"DEBUG: Attempting neural link via {model_id}...")
                
                # 1. Build System Instruction
                system_instruction = self._build_system_instruction(persona, additional_context, relevant_memories, current_mood)
                
                model = genai.GenerativeModel(
                    model_name=model_id,
                    system_instruction=system_instruction
                )

                # 2. Format History
                chat_history = []
                for msg in messages[-10:]:
                    role = 'user' if msg.get('sender_type') == 'user' else 'model'
                    content = msg.get('content', '')
                    if content:
                        # Re-formatting to the most robust structure
                        chat_history.append({
                            'role': role,
                            'parts': [{'text': content}]
                        })

                # 3. Start Chat and Send Message
                chat_session = model.start_chat(history=chat_history)
                response = chat_session.send_message(user_message)
                
                if not response.text:
                    raise Exception("Neural void encountered: Empty response from entity.")

                print(f"DEBUG: Neural link established successfully via {model_id}")
                return {
                    'success': True,
                    'response': response.text,
                    'mood': current_mood['code'] if current_mood else 'default',
                    'retrieved': True if relevant_memories else False
                }
            except Exception as e:
                error_msg = str(e)
                print(f"DEBUG: Model {model_id} failed: {error_msg}")
                if "404" in error_msg or "not found" in error_msg.lower():
                    continue
                elif "429" in error_msg or "quota" in error_msg.lower():
                    import time
                    time.sleep(1)
                    continue
                else:
                    # If it's another error (safety, etc), we might want to try next or stop
                    continue

        return {'success': False, 'error': f"Neural Link Failed. Last error: {error_msg}"}

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
