import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('OPENROUTER_API_KEY') 

genai.configure(api_key=api_key)

print(f"Testing API key: {api_key[:10]}...")

try:
    for m in genai.list_models():
        print(f"ID: {m.name} | Methods: {m.supported_generation_methods}")
except Exception as e:
    print(f"Error: {e}")
