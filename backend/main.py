from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request

from fastapi import FastAPI, HTTPException
from fastapi import Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from oss_image_upload import create_image_upload_policy, load_oss_config
from squad_store import (
    bind_user_phone,
    create_room,
    disband_room,
    get_or_create_user,
    get_room,
    get_room_preview,
    join_room,
    leave_room,
    list_user_rooms,
    require_user,
    update_member_name,
    update_room_name,
)


app = FastAPI(title="Squad Menu Picker API")

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


class BindPhoneRequest(BaseModel):
    code: str


class CreateRoomRequest(BaseModel):
    name: str = "光盘小分队"
    memberName: str = "我"


class UpdateRoomRequest(BaseModel):
    name: str


class UpdateMemberRequest(BaseModel):
    memberName: str


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
    clean_code = (code or "").strip()
    if not clean_code:
        raise HTTPException(status_code=400, detail="code is required")
    appid = os.environ.get("WECHAT_APPID", "").strip()
    secret = os.environ.get("WECHAT_SECRET", "").strip()
    if appid and secret:
        return exchange_wechat_code_for_openid(clean_code, appid, secret)
    return f"dev-openid-{clean_code}"


def exchange_wechat_code_for_openid(code: str, appid: str, secret: str) -> str:
    query = urllib.parse.urlencode(
        {
            "appid": appid,
            "secret": secret,
            "js_code": code,
            "grant_type": "authorization_code",
        }
    )
    url = f"https://api.weixin.qq.com/sns/jscode2session?{query}"
    try:
        with urllib.request.urlopen(url, timeout=8) as response:
            data = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=502, detail="WeChat login service unavailable") from exc
    openid = str(data.get("openid") or "").strip()
    if openid:
        return openid
    message = data.get("errmsg") or "WeChat login failed"
    raise HTTPException(status_code=401, detail=message)


def get_wechat_access_token() -> str:
    appid = os.environ.get("WECHAT_APPID", "").strip()
    secret = os.environ.get("WECHAT_SECRET", "").strip()
    if not appid or not secret:
        raise HTTPException(status_code=500, detail="WeChat credentials are missing")
    query = urllib.parse.urlencode(
        {
            "grant_type": "client_credential",
            "appid": appid,
            "secret": secret,
        }
    )
    url = f"https://api.weixin.qq.com/cgi-bin/token?{query}"
    try:
        with urllib.request.urlopen(url, timeout=8) as response:
            data = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=502, detail="WeChat token service unavailable") from exc
    access_token = str(data.get("access_token") or "").strip()
    if access_token:
        return access_token
    message = data.get("errmsg") or "WeChat access token failed"
    raise HTTPException(status_code=502, detail=message)


def exchange_wechat_phone_code(code: str) -> dict:
    clean_code = (code or "").strip()
    if not clean_code:
        raise HTTPException(status_code=400, detail="phone code is required")
    access_token = get_wechat_access_token()
    url = f"https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token={urllib.parse.quote(access_token)}"
    body = json.dumps({"code": clean_code}).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            data = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=502, detail="WeChat phone service unavailable") from exc
    if data.get("errcode") in (0, "0") and data.get("phone_info"):
        return data["phone_info"]
    message = data.get("errmsg") or "WeChat phone binding failed"
    raise HTTPException(status_code=401, detail=message)


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


@app.post("/api/squad/phone")
def squad_bind_phone(payload: BindPhoneRequest, x_user_id: str | None = Header(default=None)):
    user = require_request_user(x_user_id)
    phone_info = exchange_wechat_phone_code(payload.code)
    phone_number = str(phone_info.get("phoneNumber") or phone_info.get("purePhoneNumber") or "").strip()
    country_code = str(phone_info.get("countryCode") or "").strip()
    bound_user = bind_user_phone(user["userId"], phone_number, country_code)
    if not bound_user:
        raise HTTPException(status_code=400, detail="phone number is required")
    return bound_user


@app.post("/api/squad/rooms")
def squad_create_room(payload: CreateRoomRequest, x_user_id: str | None = Header(default=None)):
    user = require_request_user(x_user_id)
    return create_room(user["userId"], payload.name, payload.memberName)


@app.get("/api/squad/rooms")
def squad_list_rooms(x_user_id: str | None = Header(default=None)):
    user = require_request_user(x_user_id)
    return {"rooms": list_user_rooms(user["userId"])}


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


@app.patch("/api/squad/rooms/{room_id}")
def squad_update_room(room_id: str, payload: UpdateRoomRequest, x_user_id: str | None = Header(default=None)):
    user = require_request_user(x_user_id)
    room, error = update_room_name(room_id, user["userId"], payload.name)
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Room not found")
    if error == "not_owner":
        raise HTTPException(status_code=403, detail="Only owner can edit the room")
    if error == "name_required":
        raise HTTPException(status_code=400, detail="Room name is required")
    return room


@app.patch("/api/squad/rooms/{room_id}/me")
def squad_update_my_member(room_id: str, payload: UpdateMemberRequest, x_user_id: str | None = Header(default=None)):
    user = require_request_user(x_user_id)
    room, error = update_member_name(room_id, user["userId"], payload.memberName)
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Room not found")
    if error == "not_member":
        raise HTTPException(status_code=400, detail="User is not a room member")
    if error == "name_required":
        raise HTTPException(status_code=400, detail="Member name is required")
    return room


@app.delete("/api/squad/rooms/{room_id}")
def squad_disband_room(room_id: str, x_user_id: str | None = Header(default=None)):
    user = require_request_user(x_user_id)
    room, error = disband_room(room_id, user["userId"])
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Room not found")
    if error == "not_owner":
        raise HTTPException(status_code=403, detail="Only owner can disband the room")
    return {"ok": True, "room": room}


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
