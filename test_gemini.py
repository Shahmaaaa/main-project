import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv(".env.local")
key = os.getenv("GEMINI_API_KEY")
if not key:
    print("No key found")
    exit(1)

genai.configure(api_key=key)
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello, are you working?")
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
