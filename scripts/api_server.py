#!/usr/bin/env python3
import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler

DATA_DIR = "/var/www/brazil-travels/data"
PHOTOS_FILE = os.path.join(DATA_DIR, "photos.json")
UNLOCKED_FILE = os.path.join(DATA_DIR, "unlocked.json")

os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(PHOTOS_FILE):
    with open(PHOTOS_FILE, "w") as f:
        json.dump([], f)
if not os.path.exists(UNLOCKED_FILE):
    with open(UNLOCKED_FILE, "w") as f:
        json.dump([], f)

class ApiHandler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0].rstrip("/")
        if path == "/photos" or path == "/api/photos":
            try:
                with open(PHOTOS_FILE, "r") as f:
                    photos = json.load(f)
                self._send_json(200, photos)
            except Exception as e:
                self._send_json(500, {"error": str(e)})
        elif path == "/unlocked" or path == "/api/unlocked":
            try:
                with open(UNLOCKED_FILE, "r") as f:
                    unlocked = json.load(f)
                self._send_json(200, unlocked)
            except Exception as e:
                self._send_json(500, {"error": str(e)})
        else:
            self._send_json(404, {"error": "Not Found"})

    def do_POST(self):
        path = self.path.split("?")[0].rstrip("/")
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)
        try:
            body = json.loads(post_data.decode("utf-8"))
        except Exception:
            self._send_json(400, {"error": "Invalid JSON"})
            return

        if path == "/photos" or path == "/api/photos":
            try:
                with open(PHOTOS_FILE, "r") as f:
                    photos = json.load(f)
                photo = body.get("photo", body)
                photo_id = photo.get("id")
                photos = [p for p in photos if p.get("id") != photo_id]
                photos.insert(0, photo)
                with open(PHOTOS_FILE, "w") as f:
                    json.dump(photos, f, ensure_ascii=False)
                self._send_json(200, {"status": "ok", "photosCount": len(photos)})
            except Exception as e:
                self._send_json(500, {"error": str(e)})
        elif path == "/unlocked" or path == "/api/unlocked":
            try:
                with open(UNLOCKED_FILE, "r") as f:
                    unlocked = json.load(f)
                ids = body.get("ids", [body.get("destinationId")]) if isinstance(body, dict) else body
                if not isinstance(ids, list):
                    ids = [ids]
                s = set(unlocked)
                for i in ids:
                    if i: s.add(str(i))
                merged = list(s)
                with open(UNLOCKED_FILE, "w") as f:
                    json.dump(merged, f, ensure_ascii=False)
                self._send_json(200, {"status": "ok", "unlocked": merged})
            except Exception as e:
                self._send_json(500, {"error": str(e)})
        else:
            self._send_json(404, {"error": "Not Found"})

if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", 5000), ApiHandler)
    server.serve_forever()
