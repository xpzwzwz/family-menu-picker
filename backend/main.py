from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from oss_image_upload import create_image_upload_policy, load_oss_config


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


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/oss/image-upload-policy")
def image_upload_policy(payload: ImageUploadPolicyRequest):
    config = load_oss_config()
    if not config:
        raise HTTPException(status_code=500, detail="OSS config is missing")
    return create_image_upload_policy(payload.fileName, payload.contentType, config=config)
