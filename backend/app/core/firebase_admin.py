import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv

load_dotenv()

_app = None

def init_firebase():
    global _app
    if _app:
        return

    # Try JSON env var first (for Vercel/production), then file path
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    service_account_path = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_PATH",
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "neeva-ai-4b521-firebase-adminsdk-fbsvc-828e7aec21.json"),
    )

    if service_account_json:
        cred = credentials.Certificate(json.loads(service_account_json, strict=False))
    elif os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
    else:
        print(
            "WARNING: Firebase service account not found. "
            "Set FIREBASE_SERVICE_ACCOUNT_JSON env var or place firebase-service-account.json in backend/. "
            "Chat endpoint will not work until configured."
        )
        return

    _app = firebase_admin.initialize_app(cred)

def get_firestore_client():
    return firestore.client()

def verify_firebase_token(id_token: str) -> dict:
    """Verify a Firebase ID token and return the decoded claims."""
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded
    except Exception as e:
        raise ValueError(f"Invalid Firebase token: {e}")
