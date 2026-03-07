from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.core.firebase_admin import get_firestore_client
from app.services.ai import get_chat_response
from google.cloud.firestore import SERVER_TIMESTAMP
import traceback

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    role: str
    content: str
    created_at: Any = None

@router.post("/", response_model=ChatResponse)
def chat_with_neeva(
    chat_request: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        uid = current_user["uid"]
        fdb = get_firestore_client()

        # 1. Save user message
        user_msg_ref = fdb.collection("users").document(uid).collection("chat_messages").add({
            "role": "user",
            "content": chat_request.message,
            "created_at": SERVER_TIMESTAMP,
        })

        # 2. Get last 10 messages for context
        msgs_query = (
            fdb.collection("users").document(uid).collection("chat_messages")
            .order_by("created_at", direction="DESCENDING")
            .limit(10)
        )
        msgs = list(msgs_query.stream())
        msgs.reverse()
        formatted_history = [{"role": m.to_dict()["role"], "content": m.to_dict()["content"]} for m in msgs]

        # 3. Get onboarding data for personalization
        user_doc = fdb.collection("users").document(uid).get()
        user_context = {}
        if user_doc.exists:
            user_data = user_doc.to_dict()
            user_context = user_data.get("onboarding_data") or {}

        # 4. Generate AI response
        ai_response_text = get_chat_response(formatted_history, user_context)

        # 5. Save AI response
        fdb.collection("users").document(uid).collection("chat_messages").add({
            "role": "assistant",
            "content": ai_response_text,
            "created_at": SERVER_TIMESTAMP,
        })

        return ChatResponse(role="assistant", content=ai_response_text)

    except Exception as e:
        print(f"Chat endpoint error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_chat_history(
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    uid = current_user["uid"]
    fdb = get_firestore_client()

    msgs_query = (
        fdb.collection("users").document(uid).collection("chat_messages")
        .order_by("created_at", direction="DESCENDING")
        .limit(limit)
    )
    msgs = list(msgs_query.stream())
    msgs.reverse()

    return [
        {
            "id": m.id,
            "role": m.to_dict()["role"],
            "content": m.to_dict()["content"],
            "created_at": m.to_dict().get("created_at"),
        }
        for m in msgs
    ]
