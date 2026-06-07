import os
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient


class SquadApiTest(unittest.TestCase):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        os.environ["SQUAD_DB_PATH"] = f"{self.tempdir.name}/squad.sqlite3"
        os.environ["WECHAT_APPID"] = ""
        os.environ["WECHAT_SECRET"] = ""

        import importlib
        import main

        importlib.reload(main)
        self.client = TestClient(main.app)

    def tearDown(self):
        self.tempdir.cleanup()

    def login(self, code, nickname):
        response = self.client.post("/api/squad/login", json={"code": code, "nickname": nickname})
        self.assertEqual(response.status_code, 200)
        return response.json()

    def test_create_preview_join_and_leave_room(self):
        owner = self.login("owner-code", "队长")
        guest = self.login("guest-code", "队员")

        create_response = self.client.post(
            "/api/squad/rooms",
            headers={"X-User-Id": owner["userId"]},
            json={"name": "周末小分队", "memberName": "队长"},
        )
        self.assertEqual(create_response.status_code, 200)
        room = create_response.json()
        self.assertEqual(room["name"], "周末小分队")
        self.assertEqual(room["ownerUserId"], owner["userId"])
        self.assertEqual(room["members"][0]["userId"], owner["userId"])
        self.assertTrue(room["inviteCode"])

        preview_response = self.client.get(f"/api/squad/rooms/invite/{room['inviteCode']}")
        self.assertEqual(preview_response.status_code, 200)
        self.assertEqual(preview_response.json()["roomId"], room["roomId"])
        self.assertEqual(preview_response.json()["memberCount"], 1)

        join_response = self.client.post(
            f"/api/squad/rooms/invite/{room['inviteCode']}/join",
            headers={"X-User-Id": guest["userId"]},
            json={"memberName": "队员", "role": "采购员", "flavorPreference": "少辣"},
        )
        self.assertEqual(join_response.status_code, 200)
        joined_room = join_response.json()
        self.assertEqual(len(joined_room["members"]), 2)
        self.assertEqual(joined_room["members"][1]["name"], "队员")

        rename_member_response = self.client.patch(
            f"/api/squad/rooms/{room['roomId']}/me",
            headers={"X-User-Id": guest["userId"]},
            json={"memberName": "新名字"},
        )
        self.assertEqual(rename_member_response.status_code, 200)
        renamed_room = rename_member_response.json()
        renamed_guest = next(member for member in renamed_room["members"] if member["userId"] == guest["userId"])
        self.assertEqual(renamed_guest["name"], "新名字")

        blank_member_name = self.client.patch(
            f"/api/squad/rooms/{room['roomId']}/me",
            headers={"X-User-Id": guest["userId"]},
            json={"memberName": "   "},
        )
        self.assertEqual(blank_member_name.status_code, 400)

        leave_response = self.client.post(
            f"/api/squad/rooms/{room['roomId']}/leave",
            headers={"X-User-Id": guest["userId"]},
        )
        self.assertEqual(leave_response.status_code, 200)
        self.assertEqual(len(leave_response.json()["members"]), 1)

        owner_leave = self.client.post(
            f"/api/squad/rooms/{room['roomId']}/leave",
            headers={"X-User-Id": owner["userId"]},
        )
        self.assertEqual(owner_leave.status_code, 400)

        rename_response = self.client.patch(
            f"/api/squad/rooms/{room['roomId']}",
            headers={"X-User-Id": owner["userId"]},
            json={"name": "工作日晚饭"},
        )
        self.assertEqual(rename_response.status_code, 200)
        self.assertEqual(rename_response.json()["name"], "工作日晚饭")

        guest_rename = self.client.patch(
            f"/api/squad/rooms/{room['roomId']}",
            headers={"X-User-Id": guest["userId"]},
            json={"name": "不能改"},
        )
        self.assertEqual(guest_rename.status_code, 403)

        blank_rename = self.client.patch(
            f"/api/squad/rooms/{room['roomId']}",
            headers={"X-User-Id": owner["userId"]},
            json={"name": "   "},
        )
        self.assertEqual(blank_rename.status_code, 400)

        guest_disband = self.client.delete(
            f"/api/squad/rooms/{room['roomId']}",
            headers={"X-User-Id": guest["userId"]},
        )
        self.assertEqual(guest_disband.status_code, 403)

        disband_response = self.client.delete(
            f"/api/squad/rooms/{room['roomId']}",
            headers={"X-User-Id": owner["userId"]},
        )
        self.assertEqual(disband_response.status_code, 200)
        self.assertEqual(disband_response.json()["ok"], True)

        missing_response = self.client.get(
            f"/api/squad/rooms/{room['roomId']}",
            headers={"X-User-Id": owner["userId"]},
        )
        self.assertEqual(missing_response.status_code, 404)

    def test_user_can_create_and_list_multiple_rooms(self):
        owner = self.login("multi-owner-code", "队长")

        first_response = self.client.post(
            "/api/squad/rooms",
            headers={"X-User-Id": owner["userId"]},
            json={"name": "午饭小分队", "memberName": "队长"},
        )
        second_response = self.client.post(
            "/api/squad/rooms",
            headers={"X-User-Id": owner["userId"]},
            json={"name": "周末小分队", "memberName": "队长"},
        )
        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 200)

        list_response = self.client.get(
            "/api/squad/rooms",
            headers={"X-User-Id": owner["userId"]},
        )
        self.assertEqual(list_response.status_code, 200)
        rooms = list_response.json()["rooms"]
        self.assertEqual([room["name"] for room in rooms], ["周末小分队", "午饭小分队"])
        self.assertEqual({room["ownerUserId"] for room in rooms}, {owner["userId"]})
        self.assertEqual(len({room["roomId"] for room in rooms}), 2)

    def test_login_uses_wechat_openid_for_stable_user_id_when_configured(self):
        os.environ["WECHAT_APPID"] = "wx-test-app"
        os.environ["WECHAT_SECRET"] = "secret-test"

        import importlib
        import main

        importlib.reload(main)
        self.client = TestClient(main.app)

        with patch("main.exchange_wechat_code_for_openid", return_value="openid-same-user") as exchange:
            first = self.login("temporary-code-1", "队员一")
            second = self.login("temporary-code-2", "队员二")

        self.assertEqual(first["userId"], second["userId"])
        self.assertEqual(first["openid"], "openid-same-user")
        self.assertEqual(second["nickname"], "队员二")
        self.assertEqual(exchange.call_count, 2)

    def test_bind_phone_uses_wechat_phone_code_and_masks_number(self):
        os.environ["WECHAT_APPID"] = "wx-test-app"
        os.environ["WECHAT_SECRET"] = "secret-test"

        import importlib
        import main

        importlib.reload(main)
        self.client = TestClient(main.app)

        with patch("main.exchange_wechat_code_for_openid", return_value="openid-phone-user"):
            user = self.login("temporary-login-code", "队员")

        with patch(
            "main.exchange_wechat_phone_code",
            return_value={"phoneNumber": "13812345678", "countryCode": "86"},
        ) as exchange_phone:
            response = self.client.post(
                "/api/squad/phone",
                headers={"X-User-Id": user["userId"]},
                json={"code": "temporary-phone-code"},
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["userId"], user["userId"])
        self.assertEqual(body["hasPhone"], True)
        self.assertEqual(body["maskedPhone"], "138****5678")
        self.assertNotIn("13812345678", str(body))
        exchange_phone.assert_called_once_with("temporary-phone-code")


if __name__ == "__main__":
    unittest.main()
