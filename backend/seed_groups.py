"""One-time script to seed default community groups into Firestore."""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from app.core.firebase_admin import init_firebase, get_firestore_client

GROUPS = [
    {"name": "Anxiety Support", "description": "A safe space to share and manage anxiety together"},
    {"name": "Mindfulness", "description": "Discuss mindfulness practices and meditation techniques"},
    {"name": "Sleep Better", "description": "Tips and support for improving sleep quality"},
    {"name": "Daily Wins", "description": "Celebrate your daily achievements, big or small"},
    {"name": "Stress at Work", "description": "Navigate workplace stress with peer support"},
    {"name": "Casual Talks", "description": "Relax and chat about anything on your mind"},
]

def main():
    init_firebase()
    db = get_firestore_client()

    for group in GROUPS:
        # Check if group already exists by name
        existing = db.collection("community_groups").where("name", "==", group["name"]).get()
        if existing:
            print(f"  Skipped (exists): {group['name']}")
            continue

        doc_ref = db.collection("community_groups").add({
            "name": group["name"],
            "description": group["description"],
            "post_count": 0,
            "created_at": __import__("google.cloud.firestore", fromlist=["SERVER_TIMESTAMP"]).SERVER_TIMESTAMP,
        })
        print(f"  Created: {group['name']} -> {doc_ref[1].id}")

    print("Done seeding community groups.")

if __name__ == "__main__":
    main()
