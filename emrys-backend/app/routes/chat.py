"""
Chat routes for EMRYS
Handles chat interactions with AI personas, including RAG and Sentiment analysis.
"""

from flask import Blueprint, request, jsonify, current_app
from app.services.openrouter_service import OpenRouterService
from app.services.gemini_service import GeminiService
from app.services.knowledge_service import KnowledgeService
from app.services.sentiment_service import SentimentService
from supabase import create_client

bp = Blueprint('chat', __name__, url_prefix='/api/chat')

def get_supabase():
    return create_client(
        current_app.config['SUPABASE_URL'],
        current_app.config['SUPABASE_KEY']
    )

@bp.route('/send', methods=['POST'])
def send_message():
    try:
        data = request.json
        user_id = data.get('user_id')
        persona_id = data.get('persona_id')
        message = data.get('message')
        api_key = data.get('api_key')
        
        if not all([user_id, persona_id, message, api_key]):
            return jsonify({'error': 'Missing fields for neural synchronization'}), 400
        
        supabase = get_supabase()
        
        # 1. Fetch Persona
        persona_res = supabase.table('personas').select('*').eq('id', persona_id).single().execute()
        persona = persona_res.data
        if not persona:
            return jsonify({'error': 'Target persona consciousness not found in the Nexus'}), 404
        
        # 2. Get/Create Conversation
        conv_res = supabase.table('conversations').select('*').eq('user_id', user_id).eq('persona_id', persona_id).execute()
        
        if conv_res.data:
            conversation = conv_res.data[0]
        else:
            insert_res = supabase.table('conversations').insert({'user_id': user_id, 'persona_id': persona_id}).execute()
            if not insert_res.data:
                return jsonify({'error': 'Failed to initialize neural link conversation'}), 500
            conversation = insert_res.data[0]
        
        # 3. Get History
        history_res = supabase.table('messages').select('*').eq('conversation_id', conversation['id']).order('created_at').execute()
        history = history_res.data or []
        
        # 4. NEURAL PROCESSING (Sentiment & RAG)
        current_mood = SentimentService.analyze_mood(history, message)
        relevant_memories = KnowledgeService.get_relevant_context(persona, message)
        
        # 5. Save User Message
        supabase.table('messages').insert({
            'conversation_id': conversation['id'],
            'sender_type': 'user',
            'content': message
        }).execute()
        
        # 6. Request AI Response
        
        # Determine service based on key prefix
        if api_key.startswith('AIzaSy'):
            ai_service = GeminiService(api_key=api_key)
            ai_result = ai_service.chat(
                persona=persona,
                messages=history,
                user_message=message,
                relevant_memories=relevant_memories,
                current_mood=current_mood
            )
        else:
            openrouter = OpenRouterService(api_key=api_key)
            ai_result = openrouter.chat(
                persona=persona,
                messages=history,
                user_message=message,
                model='fast',
                relevant_memories=relevant_memories,
                current_mood=current_mood
            )
        
        if not ai_result['success']:
            return jsonify({'error': ai_result.get('error', 'The AI entity failed to respond.')}), 500
            
        ai_response = ai_result['response']
        
        # 7. Save AI Response (Include persona_id)
        supabase.table('messages').insert({
            'conversation_id': conversation['id'],
            'sender_type': 'persona',
            'persona_id': persona_id,
            'content': ai_response
        }).execute()
        
        # 8. Background Knowledge Extraction (Silent)
        try:
            if not api_key.startswith('AIzaSy'):
                openrouter = OpenRouterService(api_key=api_key)
                openrouter.extract_knowledge(message, ai_response, persona['name'])
        except: pass
        
        return jsonify({
            'response': ai_response,
            'mood': ai_result.get('mood'),
            'retrieved': ai_result.get('retrieved')
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc() 
        return jsonify({'error': f"Neural Link Error: {str(e)}"}), 500

@bp.route('/group/send', methods=['POST'])
def group_send_message():
    try:
        data = request.json
        user_id = data.get('user_id')
        group_id = data.get('group_id')
        message = data.get('message')
        api_key = data.get('api_key')
        
        supabase = get_supabase()
        
        # 1. Get Group & Members with specific join syntax
        group_res = supabase.table('groups').select('*, group_members(persona_id, personas(*))').eq('id', group_id).single().execute()
        group = group_res.data
        if not group:
            return jsonify({'error': 'Group not found or inaccessible'}), 404
            
        group_members = group.get('group_members', [])
        personas = []
        for m in group_members:
            if isinstance(m, dict) and m.get('personas'):
                # Ensure the persona object has the id from the member record if missing
                p = m['personas']
                if not p.get('id'): p['id'] = m.get('persona_id')
                personas.append(p)
        
        if not personas:
            return jsonify({'error': 'This Hub has no active neural patterns linked.'}), 400

        # 2. Conversation Check
        conv_res = supabase.table('conversations').select('*').eq('user_id', user_id).eq('group_id', group_id).execute()
        if not conv_res.data:
            conversation = supabase.table('conversations').insert({'user_id': user_id, 'group_id': group_id}).execute().data[0]
        else:
            conversation = conv_res.data[0]
        
        # 3. Save User Message
        supabase.table('messages').insert({
            'conversation_id': conversation['id'], 
            'sender_type': 'user', 
            'content': message
        }).execute()
        
        # 4. Decider Logic: Who should respond?
        responders = []
        clean_msg = message.lower().replace(' ', '')
        
        for p in personas:
            name = p.get('name', '').lower()
            if not name: continue
            
            clean_name = name.replace(' ', '')
            first_name = name.split()[0] if name.split() else ""
            
            # Match @FullName or @FirstName
            if f"@{clean_name}" in clean_msg or (first_name and len(first_name) > 2 and f"@{first_name}" in clean_msg):
                if p not in responders:
                    responders.append(p)
        
        # Fallback to collective response if no one is mentioned
        if not responders: 
            responders = personas[:3] # Limit to 3 for faster initial response
        
        # 5. Get Combined History
        history_res = supabase.table('messages').select('*').eq('conversation_id', conversation['id']).order('created_at', desc=True).limit(15).execute()
        history = history_res.data[::-1] if history_res.data else []
        
        # Determine service based on key prefix
        is_gemini = api_key.startswith('AIzaSy')
        ai_engine = GeminiService(api_key=api_key) if is_gemini else OpenRouterService(api_key=api_key)
        final_responses = []
        
        for p in responders:
            try:
                mood = SentimentService.analyze_mood(history, message)
                memories = KnowledgeService.get_relevant_context(p, message)
                
                other_names = [o['name'] for o in personas if o.get('id') != p.get('id')]
                group_ctx = f"You are in a group chat called '{group['name']}'. Other members present: {', '.join(other_names)}."
                
                if is_gemini:
                    ai_res = ai_engine.chat(
                        persona=p,
                        messages=history,
                        user_message=message,
                        additional_context=group_ctx,
                        relevant_memories=memories,
                        current_mood=mood
                    )
                else:
                    ai_res = ai_engine.chat(
                        persona=p,
                        messages=history,
                        user_message=message,
                        model='fast',
                        additional_context=group_ctx,
                        relevant_memories=memories,
                        current_mood=current_mood # This was a bug in previous version? sent mood instead of current_mood object
                    )
                
                if ai_res['success']:
                    resp_content = ai_res['response']
                    
                    # Save to DB - We don't save persona_id if it causes schema errors, 
                    # but we'll try a safe approach
                    msg_obj = {
                        'conversation_id': conversation['id'], 
                        'sender_type': 'persona', 
                        'content': resp_content
                    }
                    # Try to include persona_id if possible
                    if p.get('id'): msg_obj['persona_id'] = p['id']
                    
                    supabase.table('messages').insert(msg_obj).execute()
                    
                    final_responses.append({
                        'persona_id': p.get('id'),
                        'persona_name': p.get('name'),
                        'response': resp_content,
                        'mood': ai_res.get('mood')
                    })
                    
                    # Update internal history for next persona in loop
                    history.append({'sender_type': 'persona', 'content': resp_content})
            except Exception as loop_e:
                print(f"Error in responder loop for {p.get('name')}: {str(loop_e)}")
                continue
        
        if not final_responses:
            return jsonify({'error': 'The collective is currently unresponsive. Neural link saturated.'}), 503
            
        return jsonify({'responses': final_responses}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/history/<conversation_id>', methods=['GET'])
def get_history(conversation_id):
    try:
        supabase = get_supabase()
        msgs = supabase.table('messages').select('*').eq('conversation_id', conversation_id).order('created_at').execute().data
        return jsonify({'messages': msgs or []}), 200
    except: return jsonify({'error': 'Error'}), 500
