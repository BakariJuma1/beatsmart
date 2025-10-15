import os
import json
import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv

load_dotenv()


firebase_env = os.getenv("FIREBASE_SERVICE_ACCOUNT")

if firebase_env:
    # env
    try:
        service_account_info = json.loads(firebase_env)
        cred = credentials.Certificate(service_account_info)
        firebase_admin.initialize_app(cred)
        print("Firebase initialized using environment variable.")
    except Exception as e:
        print("Failed to initialize Firebase from env:", e)
else:
    # local development using JSON file
    cred_path = os.path.join(os.path.dirname(__file__), "..", "serviceAccountKey.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("Firebase initialized using local serviceAccountKey.json.")
    else:
        print("No Firebase credentials found! Check setup.")
