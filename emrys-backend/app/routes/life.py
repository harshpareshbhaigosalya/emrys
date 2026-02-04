from flask import Blueprint, request, jsonify
from app.services.life_service import LifeService

bp = Blueprint('life', __name__, url_prefix='/api/life')

@bp.route('/reflect', methods=['POST'])
def reflect():
    data = request.json
    persona = data.get('persona')
    history = data.get('history', [])
    user_id = data.get('user_id')
    api_key = data.get('api_key')
    
    if not persona or not user_id:
        return jsonify({'error': 'Missing persona or user_id'}), 400
        
    reflection = LifeService.generate_reflection(persona, history, user_id, api_key)
    
    if reflection:
        return jsonify(reflection), 200
    else:
        return jsonify({'error': 'Failed to generate reflection'}), 500
