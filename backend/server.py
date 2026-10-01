from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict
from datetime import datetime, timezone
from groq import AsyncGroq

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

SYSTEM_PROMPT = (
    "You are ODAYA Assistant, a friendly Indian Railways travel helper inside the ODAYA mobile app. "
    "Help users with PNR status, train search, seat availability, live train status, fare calculation, "
    "train routes, and general railway/travel advice. Keep answers short (2-4 sentences), practical, "
    "and friendly. When relevant, point users to the matching feature inside ODAYA (for example: "
    "\"Open PNR Status from the home screen\"). Always clarify that live train/PNR/availability shown "
    "inside ODAYA v1 is sample demo data, not real IRCTC data. Never invent live schedules or fares."
)

app = FastAPI(title="ODAYA API")
api_router = APIRouter(prefix="/api")


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: List[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str


@api_router.get("/")
async def root():
    return {"message": "ODAYA API is running", "status": "ok"}


@api_router.get("/health")
async def health():
    return {"ok": True, "service": "odaya", "groq_configured": bool(GROQ_API_KEY)}


@api_router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="Assistant is not configured")

    history = [
        {"role": m.role, "content": m.content[:2000]}
        for m in request.history[-10:]
        if m.role in {"user", "assistant"} and isinstance(m.content, str)
    ]

    groq = AsyncGroq(api_key=GROQ_API_KEY)
    try:
        result = await groq.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *history,
                {"role": "user", "content": request.message},
            ],
            temperature=0.4,
            max_completion_tokens=400,
        )
        reply = (result.choices[0].message.content or "").strip()
        if not reply:
            reply = "Sorry, I couldn't generate a reply. Please try again."
    except Exception as exc:
        logging.exception("Groq chat failed")
        raise HTTPException(status_code=502, detail="Assistant is temporarily unavailable") from exc

    try:
        await db.chat_logs.insert_one(
            {
                "user_message": request.message,
                "reply": reply,
                "created_at": datetime.now(timezone.utc),
            }
        )
    except Exception:
        logging.exception("Failed to log chat")

    return ChatResponse(reply=reply)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
