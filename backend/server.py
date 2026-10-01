from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime, timezone
from groq import AsyncGroq

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-20b")
RAILKIT_SERVICE_URL = os.environ.get("RAILKIT_SERVICE_URL", "http://127.0.0.1:7001")

SYSTEM_PROMPT = (
    "You are ODAYA Assistant, a friendly Indian Railways travel helper inside the ODAYA mobile app. "
    "Help users with PNR status, train search, seat availability, live train status, fare calculation, "
    "train routes, and general railway/travel advice. Keep answers short (2-4 sentences), practical, "
    "and friendly. When relevant, point users to the matching feature inside ODAYA (for example: "
    "\"Open PNR Status from the home screen\"). ODAYA now uses live Indian Railways data from RailKit. "
    "Never invent live schedules or fares, if you don't know ask the user to check the matching ODAYA screen."
)

app = FastAPI(title="ODAYA API")
api_router = APIRouter(prefix="/api")

_http_client: httpx.AsyncClient | None = None


def http() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(base_url=RAILKIT_SERVICE_URL, timeout=25.0)
    return _http_client


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
    rk_ok = False
    try:
        r = await http().get("/health", timeout=5.0)
        rk_ok = r.status_code == 200 and r.json().get("ok", False)
    except Exception:
        rk_ok = False
    return {
        "ok": True,
        "service": "odaya",
        "groq_configured": bool(GROQ_API_KEY),
        "railkit_ready": rk_ok,
    }


async def _railkit_get(path: str, params: dict | None = None):
    try:
        r = await http().get(path, params=params)
    except httpx.HTTPError as exc:
        logging.exception("RailKit service unreachable")
        raise HTTPException(status_code=502, detail="Railway service unavailable") from exc
    try:
        payload = r.json()
    except Exception:
        payload = {"success": False, "error": "Invalid upstream response"}
    status = 200 if payload.get("success") else (r.status_code if r.status_code >= 400 else 400)
    return JSONResponse(status_code=status, content=payload)


# --- RailKit proxy routes --------------------------------------------------


@api_router.get("/railkit/pnr/{pnr}")
async def pnr_status(pnr: str):
    return await _railkit_get(f"/pnr/{pnr}")


@api_router.get("/railkit/trains/between/{from_code}/{to_code}")
async def trains_between(from_code: str, to_code: str):
    return await _railkit_get(f"/trains/between/{from_code.upper()}/{to_code.upper()}")


@api_router.get("/railkit/trains/{number}/info")
async def train_info(number: str):
    return await _railkit_get(f"/trains/{number}/info")


@api_router.get("/railkit/trains/{number}/live")
async def train_live(number: str, date: str = "today"):
    return await _railkit_get(f"/trains/{number}/live", params={"date": date})


@api_router.get("/railkit/trains/{number}/history")
async def train_history(number: str, date: str):
    return await _railkit_get(f"/trains/{number}/history", params={"date": date})


@api_router.get("/railkit/seats/{train_no}/{from_code}/{to_code}/{date}/{coach}/{quota}")
async def seat_availability(
    train_no: str,
    from_code: str,
    to_code: str,
    date: str,
    coach: str,
    quota: str,
):
    return await _railkit_get(
        f"/seats/{train_no}/{from_code.upper()}/{to_code.upper()}/{date}/{coach.upper()}/{quota.upper()}"
    )


@api_router.get("/railkit/stations/search")
async def stations_search(name: str):
    return await _railkit_get("/stations/search", params={"name": name})


@api_router.get("/railkit/stations/{code}")
async def station_by_code(code: str):
    return await _railkit_get(f"/stations/{code.upper()}")


# --- Chat (unchanged) ------------------------------------------------------


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
    global _http_client
    if _http_client is not None:
        await _http_client.aclose()
