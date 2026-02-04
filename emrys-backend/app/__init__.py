from flask import Flask
from flask_cors import CORS
from app.config import config
import os

def create_app(config_name=None):
    """Application factory pattern"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Enable CORS - Allow all origins in development
    if config_name == 'development':
        CORS(app, resources={
            r"/*": {
                "origins": "*",
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True
            }
        })
        print("🌐 CORS enabled for all origins (development mode)")
    else:
        CORS(app, origins=app.config['CORS_ORIGINS'])
        print(f"🌐 CORS enabled for: {app.config['CORS_ORIGINS']}")
    
    # Register blueprints
    from app.routes import chat, life, persona
    app.register_blueprint(chat.bp)
    app.register_blueprint(life.bp)
    app.register_blueprint(persona.bp)
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'EMRYS Backend'}, 200
    
    return app
