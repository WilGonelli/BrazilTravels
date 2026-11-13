#!/usr/bin/env python3
import base64
import json
import mimetypes
import os
import re
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler

# Determine environment: Raspberry Pi production (/var/www/brazil-travels) or local development
BASE_DIR = "/var/www/brazil-travels" if os.path.exists("/var/www/brazil-travels") else os.path.abspath("./local_server_data")
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
PHOTOS_FILE = os.path.join(DATA_DIR, "photos.json")
UNLOCKED_FILE = os.path.join(DATA_DIR, "unlocked.json")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

if not os.path.exists(PHOTOS_FILE):
    with open(PHOTOS_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)
if not os.path.exists(UNLOCKED_FILE):
    with open(UNLOCKED_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)

def save_base64_image(photo_id, data_url):
    """
    Decodes base64 Data URL and saves as a physical file in UPLOADS_DIR.
    Returns relative public URL '/uploads/<filename>'.
    """
    match = re.match(r"^data:image/([a-zA-Z0-9\+\-]+);base64,(.+)$", data_url, re.DOTALL)
    if not match:
        return data_url

    img_type = match.group(1).lower()
    b64_data = match.group(2)
    ext = "webp" if "webp" in img_type else ("png" if "png" in img_type else "jpg")

    safe_id = re.sub(r"[^a-zA-Z0-9_\-]", "_", str(photo_id))
    filename = f"{safe_id}.{ext}"
    filepath = os.path.join(UPLOADS_DIR, filename)

    try:
        binary_data = base64.b64decode(b64_data)
        with open(filepath, "wb") as f:
            f.write(binary_data)
        return f"/uploads/{filename}"
    except Exception as e:
        print(f"Error saving image file {filename}: {e}", file=sys.stderr)
        return data_url

class ApiHandler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        clean_path = self.path.split("?")[0].rstrip("/")
        
        # Static uploads serving fallback (if accessed directly or reverse-proxied)
        if clean_path.startswith("/uploads/"):
            filename = os.path.basename(clean_path)
            filepath = os.path.join(UPLOADS_DIR, filename)
            if os.path.exists(filepath) and os.path.isfile(filepath):
                mime, _ = mimetypes.guess_type(filepath)
                if not mime:
                    mime = "image/webp" if filepath.endswith(".webp") else "image/jpeg"
                with open(filepath, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("Content-Length", str(len(content)))
                self.send_header("Cache-Control", "public, max-age=31536000, immutable")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(content)
                return
            else:
                self._send_json(404, {"error": "Image Not Found"})
                return

        if clean_path in ("/photos", "/api/photos"):
            try:
                with open(PHOTOS_FILE, "r", encoding="utf-8") as f:
                    photos = json.load(f)
                self._send_json(200, photos)
            except Exception as e:
                self._send_json(500, {"error": str(e)})
        elif clean_path in ("/unlocked", "/api/unlocked"):
            try:
                with open(UNLOCKED_FILE, "r", encoding="utf-8") as f:
                    unlocked = json.load(f)
                self._send_json(200, unlocked)
            except Exception as e:
                self._send_json(500, {"error": str(e)})
        else:
            self._send_json(404, {"error": "Not Found"})

    def do_POST(self):
        clean_path = self.path.split("?")[0].rstrip("/")
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)
        try:
            body = json.loads(post_data.decode("utf-8"))
        except Exception:
            self._send_json(400, {"error": "Invalid JSON"})
            return

        if clean_path in ("/photos/delete", "/api/photos/delete"):
            try:
                photo_id = body.get("id") or body.get("photoId")
                if not photo_id:
                    self._send_json(400, {"error": "Missing photo id"})
                    return

                with open(PHOTOS_FILE, "r", encoding="utf-8") as f:
                    photos = json.load(f)

                # Delete corresponding file in UPLOADS_DIR if exists
                deleted = [p for p in photos if p.get("id") == photo_id]
                for p in deleted:
                    img_url = p.get("imageUrl", "")
                    if img_url.startswith("/uploads/"):
                        fname = os.path.basename(img_url)
                        fpath = os.path.join(UPLOADS_DIR, fname)
                        if os.path.exists(fpath):
                            try:
                                os.remove(fpath)
                            except Exception:
                                pass

                photos = [p for p in photos if p.get("id") != photo_id]
                with open(PHOTOS_FILE, "w", encoding="utf-8") as f:
                    json.dump(photos, f, ensure_ascii=False, indent=2)
                self._send_json(200, {"status": "ok", "photosCount": len(photos)})
            except Exception as e:
                self._send_json(500, {"error": str(e)})
            return

        if clean_path in ("/photos", "/api/photos"):
            try:
                with open(PHOTOS_FILE, "r", encoding="utf-8") as f:
                    photos = json.load(f)
                new_photos = body.get("photos")
                if not new_photos:
                    new_photos = [body.get("photo", body)]
                elif not isinstance(new_photos, list):
                    new_photos = [new_photos]

                for p in reversed(new_photos):
                    if isinstance(p, dict) and p.get("id"):
                        # If imageUrl is base64, save to physical file and replace with clean static URL
                        img_url = p.get("imageUrl", "")
                        if img_url and img_url.startswith("data:image/"):
                            p["imageUrl"] = save_base64_image(p["id"], img_url)

                        photos = [x for x in photos if x.get("id") != p.get("id")]
                        photos.insert(0, p)

                with open(PHOTOS_FILE, "w", encoding="utf-8") as f:
                    json.dump(photos, f, ensure_ascii=False, indent=2)
                self._send_json(200, {"status": "ok", "photosCount": len(photos)})
            except Exception as e:
                self._send_json(500, {"error": str(e)})
        elif clean_path in ("/unlocked", "/api/unlocked"):
            try:
                with open(UNLOCKED_FILE, "r", encoding="utf-8") as f:
                    unlocked = json.load(f)
                ids = body.get("ids", [body.get("destinationId")]) if isinstance(body, dict) else body
                if not isinstance(ids, list):
                    ids = [ids]
                s = set(unlocked)
                for i in ids:
                    if i: s.add(str(i))
                merged = list(s)
                with open(UNLOCKED_FILE, "w", encoding="utf-8") as f:
                    json.dump(merged, f, ensure_ascii=False, indent=2)
                self._send_json(200, {"status": "ok", "unlocked": merged})
            except Exception as e:
                self._send_json(500, {"error": str(e)})
        else:
            self._send_json(404, {"error": "Not Found"})

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 5000), ApiHandler)
    print("BrazilTravels API server running on 0.0.0.0:5000")
    server.serve_forever()
