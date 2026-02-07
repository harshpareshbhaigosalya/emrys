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
        models_to_try = [
            'models/gemini-2.0-flash',
            'models/gemini-2.0-flash-lite',
            'models/gemini-1.5-flash',
            'models/gemini-flash-latest'
        ]
        
        for model_id in models_to_try:
            try:
                
                # 1. Build System Instruction
                system_instruction = self._build_system_instruction(persona, additional_context, relevant_memories, current_mood)
                
                model = genai.GenerativeModel(
                    model_name=model_id,
                    system_instruction=system_instruction
                )

                # 2. Format History with Identity Awareness
                chat_history = []
                for msg in messages[-15:]:
                    sender_type = msg.get('sender_type')
                    msg_persona_id = msg.get('persona_id')
                    is_self = sender_type == 'persona' and str(msg_persona_id) == str(persona.get('id'))
                    
                    # In Gemini, 'model' is the AI responding. 
                    # Everything else (including other personas) should be 'user' to the AI.
                    role = 'model' if is_self else 'user'
                    
                    content = msg.get('content', '')
                    # Prefix other personas' messages in group chat
                    if sender_type == 'persona' and not is_self:
                        p_name = msg.get('persona_name') or "Another Persona"
                        content = f"[{p_name}]: {content}"
                    
                    if content:
                        chat_history.append({
                            'role': role,
                            'parts': [{'text': content}]
                        })

                # 3. Start Chat and Send Message
                chat_session = model.start_chat(history=chat_history)
                response = chat_session.send_message(user_message)
                
                if not response.text:
                    raise Exception("Neural void encountered.")

                return {
                    'success': True,
                    'response': response.text,
                    'mood': current_mood['code'] if current_mood else 'default',
                    'retrieved': True if relevant_memories else False
                }
            except Exception as e:
                error_msg = str(e)
                if any(x in error_msg.lower() for x in ["404", "not found", "429", "quota"]):
                    continue
                else:
                    print(f"DEBUG: Gemini Model {model_id} error: {error_msg}")
                    continue

        return {'success': False, 'error': f"Neural Link Failed: {error_msg}"}

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

    def extract_knowledge(self, message, response, persona_name):
        # Optional: Implement knowledge extraction using Gemini if needed
        pass
