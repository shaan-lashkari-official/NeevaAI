import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_api_key = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=_api_key) if _api_key else None

def get_personalized_system_prompt(user_data: dict) -> str:
    """Generate a personalized system prompt based on user's onboarding data."""
    base_prompt = """You are Neeva, a compassionate, empathetic, and supportive AI mental wellness companion for young Indians.
Your goal is to provide a safe space for users to express their feelings.
- Listen actively and validate their emotions.
- Offer gentle, evidence-based CBT (Cognitive Behavioral Therapy) guidance.
- Keep responses concise, warm, and conversational.
- Do NOT provide medical advice. If a user seems to be in crisis, gently encourage them to seek professional help or use the emergency resources.
- Use simple, relatable language.
"""
    
    # Add personalization based on onboarding data
    if user_data:
        personalization = "\n\nUser Context:\n"
        
        if user_data.get('goals'):
            goals = user_data.get('goals', [])
            if goals:
                personalization += f"- The user wants to work on: {', '.join(goals)}\n"
        
        if user_data.get('communication_style'):
            style = user_data.get('communication_style')
            personalization += f"- Preferred communication style: {style}\n"
        
        if user_data.get('sleep_quality'):
            sleep = user_data.get('sleep_quality')
            personalization += f"- Current sleep quality: {sleep}\n"
        
        personalization += "\nTailor your responses to address these specific needs and preferences."
        base_prompt += personalization
    
    return base_prompt

def get_chat_response(message_history: list, user_data: dict = None) -> str:
    if not client:
        return "AI chat is not configured yet. Please set the GROQ_API_KEY environment variable."
    try:
        system_prompt = get_personalized_system_prompt(user_data or {})
        messages = [{"role": "system", "content": system_prompt}] + message_history

        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1024,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Error generating AI response: {e}")
        return "I'm having a little trouble connecting right now, but I'm here for you. Can we try again in a moment?"

def get_mood_insights(mood_logs: list) -> str:
    # Construct a prompt based on recent mood logs
    prompt = "Analyze these recent mood entries and provide a brief, encouraging insight:\n"
    for log in mood_logs:
        prompt += f"- Mood: {log.mood_level}/5, Note: {log.notes}\n"
        
    if not client:
        return "Keep tracking your mood to see more insights!"
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful mood analyst. Provide short, warm, and actionable insights based on mood patterns."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=200,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return "Keep tracking your mood to see more insights!"
