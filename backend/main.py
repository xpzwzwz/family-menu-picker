from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi import Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from oss_image_upload import create_image_upload_policy, load_oss_config
from squad_store import create_room, get_or_create_user, get_room, get_room_preview, join_room, leave_room, require_user


app = FastAPI(title="Family Menu Picker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ImageUploadPolicyRequest(BaseModel):
    fileName: str
    contentType: str = "image/jpeg"


class SquadLoginRequest(BaseModel):
    code: str
    nickname: str = "光盘队员"


class CreateRoomRequest(BaseModel):
    name: str = "光盘小分队"
    memberName: str = "我"


class JoinRoomRequest(BaseModel):
    memberName: str = "光盘队员"
    role: str = "成员"
    flavorPreference: str = ""


def require_request_user(x_user_id: str | None) -> dict:
    user = require_user(x_user_id or "")
    if not user:
        raise HTTPException(status_code=401, detail="User is not logged in")
    return user


def get_openid_from_code(code: str) -> str:
    # Production can replace this with WeChat code2Session when WECHAT_APPID/WECHAT_SECRET are configured.
    # For local development and tests, code is treated as a stable login token.
    clean_code = (code or "").strip()
    if not clean_code:
        raise HTTPException(status_code=400, detail="code is required")
    return f"dev-openid-{clean_code}"


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/oss/image-upload-policy")
def image_upload_policy(payload: ImageUploadPolicyRequest):
    config = load_oss_config()
    if not config:
        raise HTTPException(status_code=500, detail="OSS config is missing")
    return create_image_upload_policy(payload.fileName, payload.contentType, config=config)


@app.post("/api/squad/login")
def squad_login(payload: SquadLoginRequest):
    return get_or_create_user(get_openid_from_code(payload.code), payload.nickname)


@app.post("/api/squad/rooms")
def squad_create_room(payload: CreateRoomRequest, x_user_id: str | None = Header(default=None)):
    user = require_request_user(x_user_id)
    return create_room(user["userId"], payload.name, payload.memberName)


@app.get("/api/squad/rooms/{room_id}")
def squad_get_room(room_id: str, x_user_id: str | None = Header(default=None)):
    require_request_user(x_user_id)
    room = get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@app.get("/api/squad/rooms/invite/{invite_code}")
def squad_preview_invite(invite_code: str):
    preview = get_room_preview(invite_code)
    if not preview:
        raise HTTPException(status_code=404, detail="Room not found")
    return preview


@app.post("/api/squad/rooms/invite/{invite_code}/join")
def squad_join_room(invite_code: str, payload: JoinRoomRequest, x_user_id: str | None = Header(default=None)):
    user = require_request_user(x_user_id)
    room = join_room(invite_code, user["userId"], payload.memberName, payload.role, payload.flavorPreference)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@app.post("/api/squad/rooms/{room_id}/leave")
def squad_leave_room(room_id: str, x_user_id: str | None = Header(default=None)):
    user = require_request_user(x_user_id)
    room, error = leave_room(room_id, user["userId"])
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Room not found")
    if error == "owner_cannot_leave":
        raise HTTPException(status_code=400, detail="Owner cannot leave the room")
    if error == "not_member":
        raise HTTPException(status_code=400, detail="User is not a room member")
    return room
