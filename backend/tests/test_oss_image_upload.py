import base64
import json
import unittest
from datetime import datetime, timezone

from oss_image_upload import build_image_object_key, create_image_upload_policy, load_oss_config


class OssImageUploadTest(unittest.TestCase):
    def test_load_oss_config_normalizes_endpoint_and_prefix(self):
        config = load_oss_config(
            {
                "OSS_ACCESS_KEY_ID": "ak",
                "OSS_ACCESS_KEY_SECRET": "sk",
                "OSS_BUCKET_NAME": "bucket",
                "OSS_ENDPOINT": "oss-cn-guangzhou.aliyuncs.com",
                "OSS_PREFIX": "family-menu-images",
            }
        )

        self.assertEqual(config["endpoint"], "https://oss-cn-guangzhou.aliyuncs.com")
        self.assertEqual(config["prefix"], "family-menu-images/")

    def test_build_image_object_key_uses_safe_extension_and_prefix(self):
        key = build_image_object_key("wxfile://tmp/photo.PNG?x=1", "family-menu-images/", "abc123")

        self.assertEqual(key, "family-menu-images/images/abc123.png")

    def test_create_image_upload_policy_returns_no_secret(self):
        now = datetime(2026, 5, 23, 12, 0, tzinfo=timezone.utc)
        config = load_oss_config(
            {
                "OSS_ACCESS_KEY_ID": "ak",
                "OSS_ACCESS_KEY_SECRET": "sk",
                "OSS_BUCKET_NAME": "bucket",
                "OSS_ENDPOINT": "https://oss-cn-guangzhou.aliyuncs.com",
                "OSS_PREFIX": "family-menu-images/",
                "OSS_SIGNED_URL_EXPIRES": "600",
            }
        )

        result = create_image_upload_policy(
            "dish.jpg",
            "image/jpeg",
            config=config,
            now=now,
            nonce="fixednonce",
        )

        self.assertEqual(result["host"], "https://bucket.oss-cn-guangzhou.aliyuncs.com")
        self.assertEqual(result["key"], "family-menu-images/images/fixednonce.jpg")
        self.assertEqual(result["url"], "https://bucket.oss-cn-guangzhou.aliyuncs.com/family-menu-images/images/fixednonce.jpg")
        self.assertIn("policy", result["formData"])
        self.assertIn("signature", result["formData"])
        self.assertEqual(result["formData"]["OSSAccessKeyId"], "ak")
        self.assertEqual(result["formData"]["key"], result["key"])
        self.assertEqual(result["formData"]["x-oss-object-acl"], "public-read")
        self.assertNotIn("sk", json.dumps(result))

        decoded_policy = json.loads(base64.b64decode(result["formData"]["policy"]).decode("utf-8"))
        self.assertEqual(decoded_policy["expiration"], "2026-05-23T12:10:00.000Z")
        self.assertIn(["eq", "$Content-Type", "image/jpeg"], decoded_policy["conditions"])


if __name__ == "__main__":
    unittest.main()
