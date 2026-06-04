import os
import tempfile
import unittest

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


if __name__ == "__main__":
    unittest.main()
