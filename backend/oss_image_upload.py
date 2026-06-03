from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


DEFAULT_OSS_PREFIX = "family-menu-images/"
MAX_IMAGE_SIZE = 5 * 1024 * 1024


@dataclass(frozen=True)
class OssConfig:
    access_key_id: str
    access_key_secret: str
    bucket_name: str
    endpoint: str
    region: str
    prefix: str
    signed_url_expires: int


def load_oss_config(env: dict[str, str] | None = None) -> dict[str, Any] | None:
    env = env or os.environ
    access_key_id = env.get("OSS_ACCESS_KEY_ID", "").strip()
    access_key_secret = env.get("OSS_ACCESS_KEY_SECRET", "").strip()
    bucket_name = env.get("OSS_BUCKET_NAME", "").strip()
    endpoint = env.get("OSS_ENDPOINT", "").strip()
    region = env.get("OSS_REGION", "").strip()
    if not access_key_id or not access_key_secret or not bucket_name or not endpoint:
        return None
    if not endpoint.startswith(("http://", "https://")):
        endpoint = f"https://{endpoint}"
    prefix = env.get("OSS_PREFIX", DEFAULT_OSS_PREFIX).strip().lstrip("/")
    if prefix and not prefix.endswith("/"):
        prefix = f"{prefix}/"
    try:
        signed_url_expires = int(env.get("OSS_SIGNED_URL_EXPIRES", "600"))
    except ValueError:
        signed_url_expires = 600
    return {
        "access_key_id": access_key_id,
        "access_key_secret": access_key_secret,
        "bucket_name": bucket_name,
        "endpoint": endpoint,
        "region": region or "cn-guangzhou",
        "prefix": prefix or DEFAULT_OSS_PREFIX,
        "signed_url_expires": max(60, min(86400, signed_url_expires)),
    }


def _normalize_endpoint(endpoint: str) -> str:
    parsed = urlparse(endpoint)
    host = parsed.netloc or parsed.path
    return f"https://{host}"


def _bucket_host(bucket_name: str, endpoint: str) -> str:
    parsed = urlparse(endpoint)
    host = parsed.netloc or parsed.path
    if host.startswith("oss-"):
        return f"{parsed.scheme or 'https'}://{bucket_name}.{host}"
    return f"{parsed.scheme or 'https'}://{bucket_name}.{host}"


def _extension_from_name(file_name: str, content_type: str) -> str:
    clean_file_name = (file_name or "").split("?", 1)[0]
    name = Path(clean_file_name).name
    suffix = Path(name).suffix.lower().lstrip(".")
    if suffix in {"jpg", "jpeg", "png", "webp", "gif"}:
      return "jpg" if suffix == "jpeg" else suffix
    if content_type:
        content_type = content_type.lower()
        if "png" in content_type:
            return "png"
        if "webp" in content_type:
            return "webp"
        if "gif" in content_type:
            return "gif"
    return "jpg"


def build_image_object_key(file_name: str, prefix: str = DEFAULT_OSS_PREFIX, nonce: str | None = None) -> str:
    clean_prefix = prefix.strip().lstrip("/")
    if clean_prefix and not clean_prefix.endswith("/"):
        clean_prefix = f"{clean_prefix}/"
    ext = _extension_from_name(file_name, "")
    token = nonce or uuid.uuid4().hex
    return f"{clean_prefix}images/{token}.{ext}"


def _sign_policy(policy_base64: str, access_key_secret: str) -> str:
    digest = hmac.new(access_key_secret.encode("utf-8"), policy_base64.encode("utf-8"), hashlib.sha1).digest()
    return base64.b64encode(digest).decode("utf-8")


def create_image_upload_policy(
    file_name: str,
    content_type: str,
    *,
    config: dict[str, Any] | None = None,
    now: datetime | None = None,
    nonce: str | None = None,
) -> dict[str, Any]:
    config = config or load_oss_config()
    if not config:
        raise ValueError("Missing OSS config")

    now = now or datetime.now(timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    expires = now + timedelta(seconds=int(config.get("signed_url_expires", 600)))
    bucket_host = _bucket_host(config["bucket_name"], config["endpoint"])
    key = build_image_object_key(file_name, config["prefix"], nonce=nonce)
    policy = {
        "expiration": expires.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "conditions": [
            ["content-length-range", 1, MAX_IMAGE_SIZE],
            ["eq", "$key", key],
            ["eq", "$Content-Type", content_type or "image/jpeg"],
            ["eq", "$success_action_status", "200"],
            ["eq", "$x-oss-object-acl", "public-read"],
        ],
    }
    policy_base64 = base64.b64encode(json.dumps(policy, separators=(",", ":")).encode("utf-8")).decode("utf-8")
    signature = _sign_policy(policy_base64, config["access_key_secret"])

    return {
        "host": bucket_host,
        "url": f"{bucket_host}/{key}",
        "key": key,
        "formData": {
            "key": key,
            "policy": policy_base64,
            "OSSAccessKeyId": config["access_key_id"],
            "signature": signature,
            "success_action_status": "200",
            "x-oss-object-acl": "public-read",
            "Content-Type": content_type or "image/jpeg",
        },
    }
