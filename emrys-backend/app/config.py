import os
from dotenv import load_dotenv

load_dotenv()

# Debug: Print loaded values
print("\n🔧 Loading Configuration...")
print(f"SUPABASE_URL: {os.getenv('SUPABASE_URL', 'NOT SET')}")
print(f"SUPABASE_KEY: {os.getenv('SUPABASE_KEY', 'NOT SET')[:20]}..." if os.getenv('SUPABASE_KEY') else "SUPABASE_KEY: NOT SET")
print(f"OPENROUTER_API_KEY: {os.getenv('OPENROUTER_API_KEY', 'NOT SET')[:20]}..." if os.getenv('OPENROUTER_API_KEY') else "OPENROUTER_API_KEY: NOT SET")
print(f"CORS_ORIGINS: {os.getenv('CORS_ORIGINS', 'NOT SET')}\n")

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
    
class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
