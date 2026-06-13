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

    def test_room_menu_is_shared_between_members(self):
        owner = self.login("menu-owner-code", "队长")
        guest = self.login("menu-guest-code", "队员")

        create_response = self.client.post(
            "/api/squad/rooms",
            headers={"X-User-Id": owner["userId"]},
            json={"name": "晚饭小分队", "memberName": "队长"},
        )
        self.assertEqual(create_response.status_code, 200)
        room = create_response.json()

        join_response = self.client.post(
            f"/api/squad/rooms/invite/{room['inviteCode']}/join",
            headers={"X-User-Id": guest["userId"]},
            json={"memberName": "队员"},
        )
        self.assertEqual(join_response.status_code, 200)

        save_response = self.client.put(
            f"/api/squad/rooms/{room['roomId']}/menu",
            headers={"X-User-Id": owner["userId"]},
            json={
                "items": [
                    {
                        "spuId": "tomato-egg",
                        "skuId": "tomato-egg",
                        "title": "番茄炒蛋",
                        "quantity": 1,
                        "isSelected": 1,
                        "selectedBy": owner["userId"],
                        "selectedByName": "队长",
                    }
                ]
            },
        )
        self.assertEqual(save_response.status_code, 200)

        guest_menu_response = self.client.get(
            f"/api/squad/rooms/{room['roomId']}/menu",
            headers={"X-User-Id": guest["userId"]},
        )
        self.assertEqual(guest_menu_response.status_code, 200)
        self.assertEqual(guest_menu_response.json()["items"][0]["title"], "番茄炒蛋")

    def _make_shared_room(self):
        owner = self.login("merge-owner", "队长")
        guest = self.login("merge-guest", "队员")
        room = self.client.post(
            "/api/squad/rooms",
            headers={"X-User-Id": owner["userId"]},
            json={"name": "晚饭小分队", "memberName": "队长"},
        ).json()
        self.client.post(
            f"/api/squad/rooms/invite/{room['inviteCode']}/join",
            headers={"X-User-Id": guest["userId"]},
            json={"memberName": "队员"},
        )
        return owner, guest, room["roomId"]

    def test_per_dish_endpoints_merge_without_clobbering_teammates(self):
        owner, guest, room_id = self._make_shared_room()
        h_owner = {"X-User-Id": owner["userId"]}
        h_guest = {"X-User-Id": guest["userId"]}

        # 队长加 A，队员加 B —— 服务端合并，B 不能冲掉 A
        self.client.post(f"/api/squad/rooms/{room_id}/menu/add", headers=h_owner, json={"items": [{"spuId": "A", "skuId": "", "quantity": 1}]})
        after_b = self.client.post(
            f"/api/squad/rooms/{room_id}/menu/add", headers=h_guest, json={"items": [{"spuId": "B", "skuId": "", "quantity": 2}]}
        ).json()
        self.assertEqual([i["spuId"] for i in after_b["items"]], ["A", "B"])

        # 队员改 A 的数量，基于云端最新，保留 B
        after_update = self.client.post(
            f"/api/squad/rooms/{room_id}/menu/update", headers=h_guest, json={"spuId": "A", "skuId": "", "quantity": 5}
        ).json()
        item_a = next(i for i in after_update["items"] if i["spuId"] == "A")
        self.assertEqual(item_a["quantity"], 5)
        self.assertEqual({i["spuId"] for i in after_update["items"]}, {"A", "B"})

        # 全选作用于全部菜品
        after_select = self.client.post(
            f"/api/squad/rooms/{room_id}/menu/select-all", headers=h_owner, json={"isSelected": True}
        ).json()
        self.assertTrue(all(i["isSelected"] == 1 for i in after_select["items"]))

        # 删除 A，只删这一道
        after_remove = self.client.post(
            f"/api/squad/rooms/{room_id}/menu/remove", headers=h_owner, json={"spuId": "A", "skuId": ""}
        ).json()
        self.assertEqual([i["spuId"] for i in after_remove["items"]], ["B"])

        # 队员 GET 看到的也是合并后的结果
        guest_view = self.client.get(f"/api/squad/rooms/{room_id}/menu", headers=h_guest).json()
        self.assertEqual([i["spuId"] for i in guest_view["items"]], ["B"])

    def test_menu_items_record_who_added_them(self):
        owner, guest, room_id = self._make_shared_room()  # 队长 / 队员
        h_owner = {"X-User-Id": owner["userId"]}
        h_guest = {"X-User-Id": guest["userId"]}

        self.client.post(f"/api/squad/rooms/{room_id}/menu/add", headers=h_owner, json={"items": [{"spuId": "A", "skuId": ""}]})
        after_b = self.client.post(
            f"/api/squad/rooms/{room_id}/menu/add", headers=h_guest, json={"items": [{"spuId": "B", "skuId": ""}]}
        ).json()
        by_id = {i["spuId"]: i for i in after_b["items"]}
        # 每道菜记下「谁加的」=添加者昵称,且服务端权威写入 user_id
        self.assertEqual(by_id["A"]["addedByName"], "队长")
        self.assertEqual(by_id["A"]["addedBy"], owner["userId"])
        self.assertEqual(by_id["B"]["addedByName"], "队员")
        self.assertEqual(by_id["B"]["addedBy"], guest["userId"])

        # 别人再加同一道菜,归属保留最初的添加者,不被顶替
        after_readd = self.client.post(
            f"/api/squad/rooms/{room_id}/menu/add", headers=h_guest, json={"items": [{"spuId": "A", "skuId": ""}]}
        ).json()
        item_a = next(i for i in after_readd["items"] if i["spuId"] == "A")
        self.assertEqual(item_a["addedByName"], "队长", "已存在的菜应保留最初添加者")

    def test_update_avatar_and_member_carries_it(self):
        user = self.login("avatar-user", "甲")
        headers = {"X-User-Id": user["userId"]}
        self.assertEqual(user.get("avatarUrl"), "")

        updated = self.client.post(
            "/api/squad/avatar", headers=headers, json={"avatarUrl": "https://oss/a.jpg"}
        ).json()
        self.assertEqual(updated["avatarUrl"], "https://oss/a.jpg")

        # 建房后成员列表应带上该用户头像
        room = self.client.post(
            "/api/squad/rooms", headers=headers, json={"name": "队", "memberName": "甲"}
        ).json()
        self.assertEqual(room["members"][0]["avatarUrl"], "https://oss/a.jpg")

        # 未登录不能改头像
        self.assertEqual(self.client.post("/api/squad/avatar", json={"avatarUrl": "x"}).status_code, 401)

    def test_create_room_retries_on_invite_code_collision(self):
        import squad_store

        owner = self.login("collision-owner", "甲")
        guest = self.login("collision-guest", "乙")
        # 第二个房先生成与第一个相同的口令(撞唯一约束),应自动换一个重试
        codes = iter(["DUPCODE1", "DUPCODE1", "FRESHCD2"])
        with patch.object(squad_store, "make_invite_code", lambda: next(codes)):
            r1 = self.client.post(
                "/api/squad/rooms",
                headers={"X-User-Id": owner["userId"]},
                json={"name": "甲队", "memberName": "甲"},
            ).json()
            r2 = self.client.post(
                "/api/squad/rooms",
                headers={"X-User-Id": guest["userId"]},
                json={"name": "乙队", "memberName": "乙"},
            ).json()
        self.assertEqual(r1["inviteCode"], "DUPCODE1")
        self.assertEqual(r2["inviteCode"], "FRESHCD2", "口令撞了应自动换新的，而不是建房失败")

    def test_clean_plate_checkin_team_streak(self):
        owner, guest, room_id = self._make_shared_room()
        h_owner = {"X-User-Id": owner["userId"]}
        h_guest = {"X-User-Id": guest["userId"]}

        # 团队视角:不同成员在不同天打卡，算同一条小分队连续天数
        self.client.post(f"/api/squad/rooms/{room_id}/checkins", headers=h_owner, json={"mealDate": "2026-06-11"})
        self.client.post(f"/api/squad/rooms/{room_id}/checkins", headers=h_guest, json={"mealDate": "2026-06-12"})
        summary = self.client.post(
            f"/api/squad/rooms/{room_id}/checkins", headers=h_owner, json={"mealDate": "2026-06-13"}
        ).json()
        self.assertEqual(summary["streakDays"], 3)
        self.assertEqual(summary["totalCount"], 3)
        self.assertTrue(summary["todayDone"])

        # 今天还没打卡(隔天)→ streak 仍按昨天连续计，todayDone=False
        pending = self.client.get(
            f"/api/squad/rooms/{room_id}/checkins/summary", headers=h_guest, params={"today": "2026-06-14"}
        ).json()
        self.assertEqual(pending["streakDays"], 3)
        self.assertFalse(pending["todayDone"])

        # 断签一天 → streak 归零
        broken = self.client.get(
            f"/api/squad/rooms/{room_id}/checkins/summary", headers=h_guest, params={"today": "2026-06-15"}
        ).json()
        self.assertEqual(broken["streakDays"], 0)

        # 同一天多顿 → 天数不重复，累计顿数增加
        self.client.post(f"/api/squad/rooms/{room_id}/checkins", headers=h_owner, json={"mealDate": "2026-06-13"})
        multi = self.client.get(
            f"/api/squad/rooms/{room_id}/checkins/summary", headers=h_owner, params={"today": "2026-06-13"}
        ).json()
        self.assertEqual(multi["monthDays"], 3)
        self.assertEqual(multi["totalCount"], 4)

        # 日历按天聚合
        calendar = self.client.get(
            f"/api/squad/rooms/{room_id}/checkins/calendar", headers=h_owner, params={"month": "2026-06"}
        ).json()
        self.assertEqual(len(calendar["days"]), 3)

        # 撤销当天
        undone = self.client.delete(
            f"/api/squad/rooms/{room_id}/checkins", headers=h_owner, params={"mealDate": "2026-06-13"}
        ).json()
        self.assertEqual(undone["totalCount"], 2)

    def test_clean_plate_checkin_rejects_non_member(self):
        _, _, room_id = self._make_shared_room()
        outsider = self.login("checkin-outsider", "路人")
        response = self.client.post(
            f"/api/squad/rooms/{room_id}/checkins",
            headers={"X-User-Id": outsider["userId"]},
            json={"mealDate": "2026-06-13"},
        )
        self.assertEqual(response.status_code, 403)

    def test_per_dish_endpoints_reject_non_member(self):
        _, _, room_id = self._make_shared_room()
        outsider = self.login("outsider-code", "路人")
        response = self.client.post(
            f"/api/squad/rooms/{room_id}/menu/add",
            headers={"X-User-Id": outsider["userId"]},
            json={"items": [{"spuId": "A", "skuId": ""}]},
        )
        self.assertEqual(response.status_code, 403)

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
