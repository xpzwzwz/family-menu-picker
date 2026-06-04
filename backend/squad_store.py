from __future__ import annotations

import os
import secrets
import sqlite3
import time
from pathlib import Path


def get_db_path() -> str:
    return os.environ.get("SQUAD_DB_PATH") or str(Path(__file__).with_name("squad.sqlite3"))


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    init_db(conn)
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
          user_id TEXT PRIMARY KEY,
          openid TEXT NOT NULL UNIQUE,
          nickname TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS rooms (
          room_id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          owner_user_id TEXT NOT NULL,
          invite_code TEXT NOT NULL UNIQUE,
          created_at INTEGER NOT NULL,
          FOREIGN KEY(owner_user_id) REFERENCES users(user_id)
        );

        CREATE TABLE IF NOT EXISTS room_members (
          room_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          flavor_preference TEXT NOT NULL,
          joined_at INTEGER NOT NULL,
          PRIMARY KEY(room_id, user_id),
          FOREIGN KEY(room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
          FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );
        """
    )
    conn.commit()


def now_ms() -> int:
    return int(time.time() * 1000)


def make_id(prefix: str) -> str:
    return f"{prefix}_{secrets.token_urlsafe(8).replace('-', '').replace('_', '')}"


def make_invite_code() -> str:
    return secrets.token_urlsafe(6).replace("-", "").replace("_", "")[:8].upper()


def row_to_user(row: sqlite3.Row) -> dict:
    return {
        "userId": row["user_id"],
        "openid": row["openid"],
        "nickname": row["nickname"],
        "createdAt": row["created_at"],
    }


def row_to_member(row: sqlite3.Row) -> dict:
    return {
        "roomId": row["room_id"],
        "userId": row["user_id"],
        "name": row["name"],
        "role": row["role"],
        "flavorPreference": row["flavor_preference"],
        "joinedAt": row["joined_at"],
    }


def get_or_create_user(openid: str, nickname: str) -> dict:
    clean_nickname = (nickname or "").strip() or "光盘队员"
    with connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE openid = ?", (openid,)).fetchone()
        if row:
            conn.execute("UPDATE users SET nickname = ? WHERE user_id = ?", (clean_nickname, row["user_id"]))
            conn.commit()
            row = conn.execute("SELECT * FROM users WHERE openid = ?", (openid,)).fetchone()
            return row_to_user(row)

        user_id = make_id("user")
        conn.execute(
            "INSERT INTO users (user_id, openid, nickname, created_at) VALUES (?, ?, ?, ?)",
            (user_id, openid, clean_nickname, now_ms()),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
        return row_to_user(row)


def require_user(user_id: str) -> dict | None:
    if not user_id:
        return None
    with connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
        return row_to_user(row) if row else None


def list_members(conn: sqlite3.Connection, room_id: str) -> list[dict]:
    rows = conn.execute(
        "SELECT * FROM room_members WHERE room_id = ? ORDER BY joined_at ASC",
        (room_id,),
    ).fetchall()
    return [row_to_member(row) for row in rows]


def row_to_room(conn: sqlite3.Connection, row: sqlite3.Row) -> dict:
    return {
        "roomId": row["room_id"],
        "name": row["name"],
        "ownerUserId": row["owner_user_id"],
        "inviteCode": row["invite_code"],
        "createdAt": row["created_at"],
        "members": list_members(conn, row["room_id"]),
    }


def create_room(owner_user_id: str, name: str, member_name: str) -> dict:
    with connect() as conn:
        room_id = make_id("room")
        invite_code = make_invite_code()
        created_at = now_ms()
        conn.execute(
            "INSERT INTO rooms (room_id, name, owner_user_id, invite_code, created_at) VALUES (?, ?, ?, ?, ?)",
            (room_id, (name or "").strip() or "光盘小分队", owner_user_id, invite_code, created_at),
        )
        conn.execute(
            """
            INSERT INTO room_members (room_id, user_id, name, role, flavor_preference, joined_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (room_id, owner_user_id, (member_name or "").strip() or "我", "房主", "", created_at),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        return row_to_room(conn, row)


def get_room(room_id: str) -> dict | None:
    with connect() as conn:
        row = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        return row_to_room(conn, row) if row else None


def get_room_preview(invite_code: str) -> dict | None:
    with connect() as conn:
        row = conn.execute("SELECT * FROM rooms WHERE invite_code = ?", ((invite_code or "").strip().upper(),)).fetchone()
        if not row:
            return None
        count = conn.execute("SELECT COUNT(*) AS count FROM room_members WHERE room_id = ?", (row["room_id"],)).fetchone()
        return {
            "roomId": row["room_id"],
            "name": row["name"],
            "ownerUserId": row["owner_user_id"],
            "inviteCode": row["invite_code"],
            "memberCount": count["count"],
        }


def join_room(invite_code: str, user_id: str, member_name: str, role: str, flavor_preference: str) -> dict | None:
    with connect() as conn:
        room = conn.execute("SELECT * FROM rooms WHERE invite_code = ?", ((invite_code or "").strip().upper(),)).fetchone()
        if not room:
            return None
        joined_at = now_ms()
        conn.execute(
            """
            INSERT INTO room_members (room_id, user_id, name, role, flavor_preference, joined_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(room_id, user_id) DO UPDATE SET
              name = excluded.name,
              role = excluded.role,
              flavor_preference = excluded.flavor_preference
            """,
            (
                room["room_id"],
                user_id,
                (member_name or "").strip() or "光盘队员",
                (role or "").strip() or "成员",
                (flavor_preference or "").strip(),
                joined_at,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room["room_id"],)).fetchone()
        return row_to_room(conn, row)


def leave_room(room_id: str, user_id: str) -> tuple[dict | None, str | None]:
    with connect() as conn:
        room = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        if not room:
            return None, "not_found"
        if room["owner_user_id"] == user_id:
            return None, "owner_cannot_leave"
        member = conn.execute(
            "SELECT * FROM room_members WHERE room_id = ? AND user_id = ?",
            (room_id, user_id),
        ).fetchone()
        if not member:
            return None, "not_member"
        conn.execute("DELETE FROM room_members WHERE room_id = ? AND user_id = ?", (room_id, user_id))
        conn.commit()
        row = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        return row_to_room(conn, row), None
