import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Try to get API key from .env or from user input directly if needed
api_key = os.getenv('OPENROUTER_API_KEY')
if not api_key:
    # Just for discovery, let's try to find it in the backend's .env if it exists
    print("OPENROUTER_API_KEY not found in environment. Please ensure it's set.")
else:
    genai.configure(api_key=api_key)
    print(f"Using API Key: {api_key[:10]}...")
    
    try:
        print("Available models with 'generateContent' support:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")
