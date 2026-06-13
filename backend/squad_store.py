from __future__ import annotations

import os
import secrets
import sqlite3
import time
import json
from datetime import date, timedelta
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
          phone_number TEXT NOT NULL DEFAULT '',
          phone_country_code TEXT NOT NULL DEFAULT '',
          phone_bound_at INTEGER NOT NULL DEFAULT 0,
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

        CREATE TABLE IF NOT EXISTS room_menus (
          room_id TEXT PRIMARY KEY,
          items_json TEXT NOT NULL,
          updated_by_user_id TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY(room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
          FOREIGN KEY(updated_by_user_id) REFERENCES users(user_id)
        );

        CREATE TABLE IF NOT EXISTS clean_plate_checkins (
          checkin_id TEXT PRIMARY KEY,
          room_id TEXT NOT NULL,
          meal_date TEXT NOT NULL,
          created_by_user_id TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          photo_url TEXT NOT NULL DEFAULT '',
          created_at INTEGER NOT NULL,
          FOREIGN KEY(room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
          FOREIGN KEY(created_by_user_id) REFERENCES users(user_id)
        );

        CREATE INDEX IF NOT EXISTS idx_checkins_room_date
          ON clean_plate_checkins (room_id, meal_date);
        """
    )
    ensure_user_phone_columns(conn)
    conn.commit()


def ensure_user_phone_columns(conn: sqlite3.Connection) -> None:
    columns = {row["name"] for row in conn.execute("PRAGMA table_info(users)").fetchall()}
    if "phone_number" not in columns:
        conn.execute("ALTER TABLE users ADD COLUMN phone_number TEXT NOT NULL DEFAULT ''")
    if "phone_country_code" not in columns:
        conn.execute("ALTER TABLE users ADD COLUMN phone_country_code TEXT NOT NULL DEFAULT ''")
    if "phone_bound_at" not in columns:
        conn.execute("ALTER TABLE users ADD COLUMN phone_bound_at INTEGER NOT NULL DEFAULT 0")
    if "avatar_url" not in columns:
        conn.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT NOT NULL DEFAULT ''")


def now_ms() -> int:
    return int(time.time() * 1000)


def make_id(prefix: str) -> str:
    return f"{prefix}_{secrets.token_urlsafe(8).replace('-', '').replace('_', '')}"


# 口令字母表:去掉易混的 I L O 0 1，全大写(查找时输入也会转大写)。31^8 ≈ 8.5e11 种
INVITE_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def make_invite_code() -> str:
    return "".join(secrets.choice(INVITE_CODE_ALPHABET) for _ in range(8))


def row_to_user(row: sqlite3.Row) -> dict:
    phone_number = row["phone_number"] if "phone_number" in row.keys() else ""
    avatar_url = row["avatar_url"] if "avatar_url" in row.keys() else ""
    return {
        "userId": row["user_id"],
        "openid": row["openid"],
        "nickname": row["nickname"],
        "avatarUrl": avatar_url or "",
        "hasPhone": bool(phone_number),
        "maskedPhone": mask_phone(phone_number),
        "createdAt": row["created_at"],
    }


def mask_phone(phone_number: str) -> str:
    clean_phone = (phone_number or "").strip()
    if len(clean_phone) < 7:
        return ""
    return f"{clean_phone[:3]}****{clean_phone[-4:]}"


def row_to_member(row: sqlite3.Row) -> dict:
    avatar_url = row["avatar_url"] if "avatar_url" in row.keys() else ""
    return {
        "roomId": row["room_id"],
        "userId": row["user_id"],
        "name": row["name"],
        "role": row["role"],
        "flavorPreference": row["flavor_preference"],
        "avatarUrl": avatar_url or "",
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


def bind_user_phone(user_id: str, phone_number: str, country_code: str = "") -> dict | None:
    clean_phone = (phone_number or "").strip()
    if not user_id or not clean_phone:
        return None
    with connect() as conn:
        conn.execute(
            """
            UPDATE users
            SET phone_number = ?, phone_country_code = ?, phone_bound_at = ?
            WHERE user_id = ?
            """,
            (clean_phone, (country_code or "").strip(), now_ms(), user_id),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
        return row_to_user(row) if row else None


def update_user_avatar(user_id: str, avatar_url: str) -> dict | None:
    if not user_id:
        return None
    with connect() as conn:
        conn.execute(
            "UPDATE users SET avatar_url = ? WHERE user_id = ?",
            ((avatar_url or "").strip(), user_id),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
        return row_to_user(row) if row else None


def list_members(conn: sqlite3.Connection, room_id: str) -> list[dict]:
    rows = conn.execute(
        """
        SELECT room_members.*, users.avatar_url AS avatar_url
        FROM room_members
        LEFT JOIN users ON users.user_id = room_members.user_id
        WHERE room_members.room_id = ?
        ORDER BY room_members.joined_at ASC
        """,
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


def is_room_member(conn: sqlite3.Connection, room_id: str, user_id: str) -> bool:
    member = conn.execute(
        "SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?",
        (room_id, user_id),
    ).fetchone()
    return bool(member)


def create_room(owner_user_id: str, name: str, member_name: str) -> dict:
    clean_name = (name or "").strip() or "光盘小分队"
    with connect() as conn:
        room_id = make_id("room")
        created_at = now_ms()
        # 口令撞了(唯一约束)就换一个重试，避免极小概率的重复导致建房 500
        invite_code = None
        for _ in range(12):
            candidate = make_invite_code()
            try:
                conn.execute(
                    "INSERT INTO rooms (room_id, name, owner_user_id, invite_code, created_at) VALUES (?, ?, ?, ?, ?)",
                    (room_id, clean_name, owner_user_id, candidate, created_at),
                )
            except sqlite3.IntegrityError:
                continue
            invite_code = candidate
            break
        if invite_code is None:
            raise RuntimeError("could not allocate a unique invite code")
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


def get_room_menu(room_id: str, user_id: str) -> tuple[dict | None, str | None]:
    with connect() as conn:
        room = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        if not room:
            return None, "not_found"
        if not is_room_member(conn, room_id, user_id):
            return None, "not_member"
        row = conn.execute("SELECT * FROM room_menus WHERE room_id = ?", (room_id,)).fetchone()
        if not row:
            return {"roomId": room_id, "items": [], "updatedAt": 0, "updatedByUserId": ""}, None
        try:
            items = json.loads(row["items_json"])
        except json.JSONDecodeError:
            items = []
        return {
            "roomId": room_id,
            "items": items if isinstance(items, list) else [],
            "updatedAt": row["updated_at"],
            "updatedByUserId": row["updated_by_user_id"],
        }, None


def save_room_menu(room_id: str, user_id: str, items: list) -> tuple[dict | None, str | None]:
    if not isinstance(items, list):
        return None, "invalid_menu"
    with connect() as conn:
        room = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        if not room:
            return None, "not_found"
        if not is_room_member(conn, room_id, user_id):
            return None, "not_member"
        updated_at = now_ms()
        items_json = json.dumps(items, ensure_ascii=False, separators=(",", ":"))
        conn.execute(
            """
            INSERT INTO room_menus (room_id, items_json, updated_by_user_id, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(room_id) DO UPDATE SET
              items_json = excluded.items_json,
              updated_by_user_id = excluded.updated_by_user_id,
              updated_at = excluded.updated_at
            """,
            (room_id, items_json, user_id, updated_at),
        )
        conn.commit()
        return {
            "roomId": room_id,
            "items": items,
            "updatedAt": updated_at,
            "updatedByUserId": user_id,
        }, None


def _read_menu_items(conn: sqlite3.Connection, room_id: str) -> list:
    row = conn.execute("SELECT items_json FROM room_menus WHERE room_id = ?", (room_id,)).fetchone()
    if not row:
        return []
    try:
        items = json.loads(row["items_json"])
    except json.JSONDecodeError:
        return []
    return items if isinstance(items, list) else []


def _write_menu_items(conn: sqlite3.Connection, room_id: str, user_id: str, items: list) -> dict:
    updated_at = now_ms()
    items_json = json.dumps(items, ensure_ascii=False, separators=(",", ":"))
    conn.execute(
        """
        INSERT INTO room_menus (room_id, items_json, updated_by_user_id, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(room_id) DO UPDATE SET
          items_json = excluded.items_json,
          updated_by_user_id = excluded.updated_by_user_id,
          updated_at = excluded.updated_at
        """,
        (room_id, items_json, user_id, updated_at),
    )
    return {"roomId": room_id, "items": items, "updatedAt": updated_at, "updatedByUserId": user_id}


def _mutate_room_menu(room_id: str, user_id: str, mutate) -> tuple[dict | None, str | None]:
    """对房间菜单做「读-改-写」，整个过程用 BEGIN IMMEDIATE 串行化，
    保证并发的单道菜增删改不会互相覆盖(服务端原子合并)。"""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.isolation_level = None  # 手动管理事务
    try:
        conn.execute("PRAGMA foreign_keys = ON")
        init_db(conn)
        conn.execute("BEGIN IMMEDIATE")
        room = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        if not room:
            conn.execute("ROLLBACK")
            return None, "not_found"
        if not is_room_member(conn, room_id, user_id):
            conn.execute("ROLLBACK")
            return None, "not_member"
        next_items = mutate(_read_menu_items(conn, room_id))
        result = _write_menu_items(conn, room_id, user_id, next_items)
        conn.execute("COMMIT")
        return result, None
    except Exception:
        conn.execute("ROLLBACK")
        raise
    finally:
        conn.close()


def add_room_menu_items(
    room_id: str, user_id: str, new_items: list, increment_existing: bool = True
) -> tuple[dict | None, str | None]:
    if not isinstance(new_items, list):
        return None, "invalid_menu"

    def mutate(items: list) -> list:
        merged = [dict(item) for item in items if isinstance(item, dict)]
        index = {(it.get("spuId"), it.get("skuId")): it for it in merged}
        for goods in new_items:
            if not isinstance(goods, dict):
                continue
            key = (goods.get("spuId"), goods.get("skuId"))
            existing = index.get(key)
            if existing:
                if increment_existing:
                    existing["quantity"] = (existing.get("quantity") or 1) + (goods.get("quantity") or 1)
                existing["isSelected"] = 1
                if goods.get("selectedBy"):
                    existing["selectedBy"] = goods["selectedBy"]
                if goods.get("selectedByName"):
                    existing["selectedByName"] = goods["selectedByName"]
            else:
                item = dict(goods)
                item["quantity"] = goods.get("quantity") or 1
                item["isSelected"] = 1
                merged.append(item)
                index[key] = item
        return merged

    return _mutate_room_menu(room_id, user_id, mutate)


def update_room_menu_item(
    room_id: str, user_id: str, spu_id: str, sku_id: str, patch: dict
) -> tuple[dict | None, str | None]:
    allowed = {key: patch[key] for key in ("quantity", "isSelected") if key in patch}

    def mutate(items: list) -> list:
        return [
            {**item, **allowed}
            if isinstance(item, dict) and item.get("spuId") == spu_id and item.get("skuId") == sku_id
            else item
            for item in items
        ]

    return _mutate_room_menu(room_id, user_id, mutate)


def remove_room_menu_item(
    room_id: str, user_id: str, spu_id: str, sku_id: str
) -> tuple[dict | None, str | None]:
    def mutate(items: list) -> list:
        return [
            item
            for item in items
            if not (isinstance(item, dict) and item.get("spuId") == spu_id and item.get("skuId") == sku_id)
        ]

    return _mutate_room_menu(room_id, user_id, mutate)


def set_room_menu_all_selected(
    room_id: str, user_id: str, is_selected: bool
) -> tuple[dict | None, str | None]:
    value = 1 if is_selected else 0

    def mutate(items: list) -> list:
        return [{**item, "isSelected": value} if isinstance(item, dict) else item for item in items]

    return _mutate_room_menu(room_id, user_id, mutate)


def list_user_rooms(user_id: str) -> list[dict]:
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT rooms.*
            FROM rooms
            INNER JOIN room_members ON room_members.room_id = rooms.room_id
            WHERE room_members.user_id = ?
            ORDER BY room_members.joined_at DESC, rooms.created_at DESC
            """,
            (user_id,),
        ).fetchall()
        return [row_to_room(conn, row) for row in rows]


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


def update_room_name(room_id: str, user_id: str, name: str) -> tuple[dict | None, str | None]:
    clean_name = (name or "").strip()
    if not clean_name:
        return None, "name_required"
    with connect() as conn:
        room = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        if not room:
            return None, "not_found"
        if room["owner_user_id"] != user_id:
            return None, "not_owner"
        conn.execute("UPDATE rooms SET name = ? WHERE room_id = ?", (clean_name, room_id))
        conn.commit()
        row = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        return row_to_room(conn, row), None


def update_member_name(room_id: str, user_id: str, member_name: str) -> tuple[dict | None, str | None]:
    clean_name = (member_name or "").strip()
    if not clean_name:
        return None, "name_required"
    with connect() as conn:
        room = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        if not room:
            return None, "not_found"
        member = conn.execute(
            "SELECT * FROM room_members WHERE room_id = ? AND user_id = ?",
            (room_id, user_id),
        ).fetchone()
        if not member:
            return None, "not_member"
        conn.execute(
            "UPDATE room_members SET name = ? WHERE room_id = ? AND user_id = ?",
            (clean_name, room_id, user_id),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        return row_to_room(conn, row), None


def disband_room(room_id: str, user_id: str) -> tuple[dict | None, str | None]:
    with connect() as conn:
        room = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        if not room:
            return None, "not_found"
        if room["owner_user_id"] != user_id:
            return None, "not_owner"
        room_data = row_to_room(conn, room)
        conn.execute("DELETE FROM rooms WHERE room_id = ?", (room_id,))
        conn.commit()
        return room_data, None


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


# ---------- 光盘打卡(团队视角:一顿一次，连续天数是整个小分队的) ----------

def _checkin_summary(conn: sqlite3.Connection, room_id: str, today_str: str) -> dict:
    rows = conn.execute(
        "SELECT DISTINCT meal_date FROM clean_plate_checkins WHERE room_id = ?",
        (room_id,),
    ).fetchall()
    date_set = {row["meal_date"] for row in rows}
    total = conn.execute(
        "SELECT COUNT(*) AS c FROM clean_plate_checkins WHERE room_id = ?",
        (room_id,),
    ).fetchone()["c"]

    # 团队连续光盘天数:从今天(若今天没打则从昨天)往回数连续有打卡的天
    streak = 0
    try:
        cursor = date.fromisoformat(today_str)
    except ValueError:
        cursor = None
    if cursor is not None:
        if today_str not in date_set:
            cursor = cursor - timedelta(days=1)
        while cursor.isoformat() in date_set:
            streak += 1
            cursor = cursor - timedelta(days=1)

    month_prefix = today_str[:7]
    month_days = len([d for d in date_set if d.startswith(month_prefix)])
    return {
        "roomId": room_id,
        "streakDays": streak,
        "totalCount": total,
        "monthDays": month_days,
        "todayDone": today_str in date_set,
        "today": today_str,
    }


def add_clean_plate_checkin(
    room_id: str, user_id: str, meal_date: str, note: str = "", photo_url: str = ""
) -> tuple[dict | None, str | None]:
    clean_date = (meal_date or "").strip()
    try:
        date.fromisoformat(clean_date)
    except ValueError:
        return None, "invalid_date"
    with connect() as conn:
        room = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        if not room:
            return None, "not_found"
        if not is_room_member(conn, room_id, user_id):
            return None, "not_member"
        conn.execute(
            """
            INSERT INTO clean_plate_checkins
              (checkin_id, room_id, meal_date, created_by_user_id, note, photo_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (make_id("checkin"), room_id, clean_date, user_id, (note or "").strip(), (photo_url or "").strip(), now_ms()),
        )
        conn.commit()
        return _checkin_summary(conn, room_id, clean_date), None


def get_clean_plate_summary(room_id: str, user_id: str, today: str) -> tuple[dict | None, str | None]:
    clean_today = (today or "").strip()
    try:
        date.fromisoformat(clean_today)
    except ValueError:
        return None, "invalid_date"
    with connect() as conn:
        room = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        if not room:
            return None, "not_found"
        if not is_room_member(conn, room_id, user_id):
            return None, "not_member"
        return _checkin_summary(conn, room_id, clean_today), None


def get_clean_plate_calendar(room_id: str, user_id: str, month: str) -> tuple[dict | None, str | None]:
    clean_month = (month or "").strip()
    if len(clean_month) != 7:
        return None, "invalid_month"
    with connect() as conn:
        room = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        if not room:
            return None, "not_found"
        if not is_room_member(conn, room_id, user_id):
            return None, "not_member"
        rows = conn.execute(
            """
            SELECT meal_date, COUNT(*) AS count, MAX(photo_url) AS photo_url
            FROM clean_plate_checkins
            WHERE room_id = ? AND meal_date LIKE ?
            GROUP BY meal_date
            ORDER BY meal_date ASC
            """,
            (room_id, f"{clean_month}-%"),
        ).fetchall()
        days = [{"date": r["meal_date"], "count": r["count"], "photoUrl": r["photo_url"] or ""} for r in rows]
        return {"roomId": room_id, "month": clean_month, "days": days}, None


def remove_clean_plate_checkin(room_id: str, user_id: str, meal_date: str) -> tuple[dict | None, str | None]:
    """撤销某一天的光盘打卡(误点时用),删掉该小分队当天的打卡记录。"""
    clean_date = (meal_date or "").strip()
    try:
        date.fromisoformat(clean_date)
    except ValueError:
        return None, "invalid_date"
    with connect() as conn:
        room = conn.execute("SELECT * FROM rooms WHERE room_id = ?", (room_id,)).fetchone()
        if not room:
            return None, "not_found"
        if not is_room_member(conn, room_id, user_id):
            return None, "not_member"
        conn.execute(
            "DELETE FROM clean_plate_checkins WHERE room_id = ? AND meal_date = ?",
            (room_id, clean_date),
        )
        conn.commit()
        return _checkin_summary(conn, room_id, clean_date), None
