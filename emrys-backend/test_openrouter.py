"""
Test script to verify OpenRouter API key works
"""
import os
from dotenv import load_dotenv
import requests

load_dotenv()

api_key = os.getenv('OPENROUTER_API_KEY')

print(f"\n🔑 Testing OpenRouter API Key...")
print(f"Key (first 20 chars): {api_key[:20] if api_key else 'NOT SET'}...")

if not api_key or api_key == 'your-openrouter-api-key':
    print("❌ API key not set or is placeholder!")
    print("Please set OPENROUTER_API_KEY in .env file")
    exit(1)

# Test API call
try:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "openai/gpt-3.5-turbo",
        "messages": [
            {"role": "user", "content": "Say 'Hello, EMRYS is working!'"}
        ]
    }
    
    print("\n📡 Sending test request to OpenRouter...")
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=30
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        message = data['choices'][0]['message']['content']
        print(f"\n✅ SUCCESS! API is working!")
        print(f"Response: {message}\n")
    else:
        print(f"\n❌ ERROR: {response.status_code}")
        print(f"Response: {response.text}\n")
        
except Exception as e:
    print(f"\n❌ Exception: {str(e)}\n")
