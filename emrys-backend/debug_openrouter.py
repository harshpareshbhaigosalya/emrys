import requests
import json

def test_backend():
    print("🚀 Testing Backend -> OpenRouter Connection...")
    
    # We'll try to hit the backend directly if possible, 
    # but since it's running in background, we'll just check the logic.
    # Actually, let's just use the service class directly to see if it fails.
    
    import sys
    import os
    sys.path.append(os.getcwd())
    
    from app.services.openrouter_service import OpenRouterService
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv('OPENROUTER_API_KEY')
    service = OpenRouterService(api_key=api_key)
    
    persona = {'name': 'Test Bot'}
    messages = []
    user_message = "Hi"
    
    print(f"📡 Requesting with model: {service.MODELS['fast']}")
    result = service.chat(persona, messages, user_message, model='fast')
    
    if result['success']:
        print("✅ Success!")
        print(f"RAW Response: {result['response']}")
    else:
        print(f"❌ Failed: {result.get('error')}")
        if result.get('safety_blocked'):
            print("Safety Blocked!")

if __name__ == "__main__":
    test_backend()
