import json
import os
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel

from org_info import ORG_INFO, ALFRED_PERSONALITY

load_dotenv()

app = FastAPI()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FEEDBACK_FILE = "feedbacks.json"


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


class FeedbackRequest(BaseModel):
    name: str
    email: str = ""
    rating: int
    message: str


@app.post("/chat")
def chat(req: ChatRequest):
    system_content = f"{ORG_INFO}\n{ALFRED_PERSONALITY}"
    all_messages = [{"role": "system", "content": system_content}]

    for m in req.messages:
        all_messages.append({"role": m.role, "content": m.content})

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=all_messages,
            temperature=0.2,
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        print(f"ERROR: {e}") 
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@app.post("/feedback")
def submit_feedback(req: FeedbackRequest):
    feedbacks = []

    if os.path.exists(FEEDBACK_FILE):
        try:
            with open(FEEDBACK_FILE, "r") as f:
                feedbacks = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            raise HTTPException(status_code=500, detail=f"Failed to read feedback file: {str(e)}")

    feedbacks.append({
        "name": req.name,
        "email": req.email,
        "rating": req.rating,
        "message": req.message,
        "submitted_at": datetime.now().isoformat(),
    })

    try:
        with open(FEEDBACK_FILE, "w") as f:
            json.dump(feedbacks, f, indent=2)
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Failed to save feedback: {str(e)}")

    return {"status": "ok"}


@app.get("/feedbacks")
def get_feedbacks():
    if not os.path.exists(FEEDBACK_FILE):
        return []

    try:
        with open(FEEDBACK_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        raise HTTPException(status_code=500, detail=f"Failed to read feedbacks: {str(e)}")