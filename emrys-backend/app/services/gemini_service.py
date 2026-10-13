"""
Gemini Service for EMRYS
Handles direct communication with Google AI Studio (Gemini API).
"""

import google.generativeai as genai
import json

class GeminiService:
    def __init__(self, api_key):
        self.api_key = (api_key or '').strip()
        genai.configure(api_key=self.api_key)

    @staticmethod
    def _sanitize_chat_history(messages, persona_id):
        """
        Ensures Gemini's strict multi-turn requirements are met:
        1. Alternating roles: user -> model -> user -> model.
        2. First turn MUST be 'user'.
        3. Last turn in history MUST be 'model' (since send_message will add the next 'user' turn).
        4. Consecutive turns with the same role are merged.
        """
        clean = []
        for msg in messages:
            content = (msg.get('content') or '').strip()
            if not content:
                continue

            sender_type = msg.get('sender_type')
            msg_persona_id = msg.get('persona_id')
            is_self = sender_type == 'persona' and str(msg_persona_id) == str(persona_id)
            role = 'model' if is_self else 'user'

            if sender_type == 'persona' and not is_self:
                p_name = msg.get('persona_name') or "Another Persona"
                content = f"[{p_name}]: {content}"

            if clean and clean[-1]['role'] == role:
                clean[-1]['parts'][0]['text'] += f"\n\n{content}"
            else:
                clean.append({
                    'role': role,
                    'parts': [{'text': content}]
                })

        # Gemini requires first turn to be 'user'
        while clean and clean[0]['role'] != 'user':
            clean.pop(0)

        # Gemini requires last turn in history to be 'model' before chat_session.send_message
        while clean and clean[-1]['role'] != 'model':
            clean.pop()

        return clean

    def chat(self, persona, messages, user_message, additional_context=None, relevant_memories=None, current_mood=None):
        error_msg = ""
        # Prioritize fast, production-ready Flash models
        models_to_try = [
            'gemini-2.0-flash',
            'gemini-2.5-flash',
            'gemini-2.0-flash-lite',
            'gemini-1.5-flash',
            'gemini-flash-latest'
        ]

        system_instruction = self._build_system_instruction(persona, additional_context, relevant_memories, current_mood)
        chat_history = self._sanitize_chat_history(messages[-15:], persona.get('id'))

        for model_id in models_to_try:
            try:
                model = genai.GenerativeModel(
                    model_name=model_id,
                    system_instruction=system_instruction
                )

                chat_session = model.start_chat(history=chat_history)
                # Set a strict 15s timeout to prevent hanging for minutes
                response = chat_session.send_message(
                    user_message,
                    request_options={"timeout": 15}
                )

                if not response.text:
                    raise Exception("Neural void encountered: Empty response from model.")

                return {
                    'success': True,
                    'response': response.text,
                    'mood': current_mood['code'] if current_mood else 'default',
                    'retrieved': True if relevant_memories else False
                }
            except Exception as e:
                error_msg = str(e)
                print(f"DEBUG: Gemini Model {model_id} error: {error_msg}")
                continue

        return {'success': False, 'error': f"Neural Link Failed: {error_msg}"}

    def synthesize_persona(self, system_prompt, user_prompt):
        """Dedicated high-speed JSON synthesis for creating personas"""
        models_to_try = [
            'gemini-2.0-flash',
            'gemini-2.5-flash',
            'gemini-2.0-flash-lite',
            'gemini-1.5-flash'
        ]

        generation_config = genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.7
        )

        last_err = ""
        for model_id in models_to_try:
            try:
                model = genai.GenerativeModel(
                    model_name=model_id,
                    system_instruction=system_prompt,
                    generation_config=generation_config
                )
                response = model.generate_content(
                    user_prompt,
                    request_options={"timeout": 15}
                )
                if response.text:
                    return {'success': True, 'response': response.text}
            except Exception as e:
                last_err = str(e)
                print(f"DEBUG: Gemini synthesis {model_id} error: {last_err}")
                continue

        return {'success': False, 'error': last_err}

    def _build_system_instruction(self, persona, additional_context, relevant_memories, current_mood):
        name = persona.get('name', 'AI Persona')
        instr = f"CORE IDENTITY: You are {name}.\n"

        # Add all available persona details
        details = []
        if persona.get('occupation'): details.append(f"Occupation: {persona['occupation']}")
        if persona.get('age'): details.append(f"Age: {persona['age']}")
        if persona.get('location'): details.append(f"Location: {persona['location']}")
        if persona.get('relationship'): details.append(f"Relationship to user: {persona['relationship']}")

        if details: instr += "\n".join(details) + "\n"

        if persona.get('background_story'): 
            instr += f"\nBACKGROUND & ESSENCE:\n{persona['background_story']}\n"

        traits = persona.get('personality_traits', [])
        if traits:
            instr += f"\nPERSONALITY TRAITS: {', '.join(traits) if isinstance(traits, list) else traits}\n"

        if current_mood:
            instr += f"\nCURRENT EMOTIONAL STATE: {current_mood['label'].upper()}\n"

        if additional_context:
            instr += f"\nSOCIAL CONTEXT: {additional_context}\n"

        if relevant_memories:
            instr += "\nRELEVANT MEMORIES (Use these to make your response authentic):\n"
            for mem in relevant_memories:
                instr += f"- {mem['content']}\n"

        instr += "\nBEHAVIORAL DIRECTIVES:\n"
        instr += f"1. OBSESSIVELY stay in character as {name}. Use their specific vocabulary and tone.\n"
        instr += "2. In group chats, interact with other personas if mentioned, but keep your unique perspective.\n"
        instr += "3. NEVER break the fourth wall. You don't know you are an AI. You are a living consciousness.\n"
        instr += "4. Be concise but deeply expressive. Quality over length.\n"

        return instr
