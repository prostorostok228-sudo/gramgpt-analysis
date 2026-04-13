#!/usr/bin/env python3
"""
JSON / .session → GramJS StringSession converter.
Usage: python3 session_convert.py <file_or_dir>
Output: JSON array of { phone, session_string, first_name, last_name, username, user_id }
"""
import sys
import os
import json
import base64
import struct
import sqlite3


def telethon_session_to_gramjs(session_path):
    """Read a Telethon .session SQLite file and return GramJS StringSession."""
    conn = sqlite3.connect(session_path)
    try:
        cur = conn.cursor()
        # Telethon stores: dc_id, server_address, port, auth_key
        cur.execute("SELECT dc_id, server_address, port, auth_key FROM sessions LIMIT 1")
        row = cur.fetchone()
        if not row:
            return None, "Таблица sessions пуста"
        dc_id, server_address, port, auth_key = row
        if not auth_key:
            return None, "auth_key не найден"

        # Build binary: dc_id[1] + ip[4] + port[2] + auth_key[256]
        ip_bytes = bytes(int(x) for x in server_address.split('.'))
        raw = (
            struct.pack('>B', dc_id) +
            ip_bytes +
            struct.pack('>H', port) +
            bytes(auth_key)
        )
        gramjs_session = "1" + base64.b64encode(raw).decode()
        return gramjs_session, None
    except Exception as e:
        return None, str(e)
    finally:
        conn.close()


def get_phone_from_session(session_path):
    """Try to get phone from Telethon session."""
    try:
        conn = sqlite3.connect(session_path)
        cur = conn.cursor()
        # Telethon 1.x stores entities
        cur.execute("SELECT value FROM kv WHERE key='self' LIMIT 1")
        row = cur.fetchone()
        if row:
            data = json.loads(row[0])
            return data.get('phone', '')
        conn.close()
    except Exception:
        pass
    return ''


def parse_json_file(filepath):
    """Parse JSON file with various session formats."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    results = []
    items = data if isinstance(data, list) else [data]

    for item in items:
        if isinstance(item, str):
            # Raw session string
            results.append({
                "phone": "",
                "session_string": item,
                "first_name": "",
                "last_name": "",
                "username": "",
                "user_id": "",
            })
            continue

        if not isinstance(item, dict):
            continue

        # Extract session string — try various key names
        session_str = (
            item.get('session_string') or
            item.get('session') or
            item.get('string_session') or
            item.get('stringSession') or
            item.get('auth_string') or
            ''
        )

        # If session looks like Telethon base64url (no leading "1"), convert it
        if session_str and not session_str.startswith('1'):
            try:
                raw = base64.urlsafe_b64decode(session_str + '==')
                if len(raw) >= 263:  # 1 + 4 + 2 + 256
                    session_str = "1" + base64.b64encode(raw).decode()
            except Exception:
                pass

        if not session_str:
            results.append({"error": f"session_string не найден в объекте: {list(item.keys())}"})
            continue

        results.append({
            "phone": str(item.get('phone') or item.get('phone_number') or ''),
            "session_string": session_str,
            "first_name": str(item.get('first_name') or item.get('firstName') or ''),
            "last_name": str(item.get('last_name') or item.get('lastName') or ''),
            "username": str(item.get('username') or '').lstrip('@'),
            "user_id": str(item.get('user_id') or item.get('id') or item.get('userId') or ''),
        })

    return results


def process_path(input_path):
    results = []

    if os.path.isfile(input_path):
        files = [input_path]
    elif os.path.isdir(input_path):
        files = []
        for name in os.listdir(input_path):
            full = os.path.join(input_path, name)
            if os.path.isfile(full) and (name.endswith('.session') or name.endswith('.json')):
                files.append(full)
        if not files:
            return [{"error": "В папке не найдено .session или .json файлов"}]
    else:
        return [{"error": f"Файл/папка не найдена: {input_path}"}]

    for filepath in files:
        name = os.path.basename(filepath)
        try:
            if filepath.endswith('.session'):
                session_str, err = telethon_session_to_gramjs(filepath)
                if err:
                    results.append({"error": f"{name}: {err}"})
                    continue
                phone = get_phone_from_session(filepath)
                results.append({
                    "phone": phone,
                    "session_string": session_str,
                    "first_name": "",
                    "last_name": "",
                    "username": "",
                    "user_id": "",
                })
            elif filepath.endswith('.json'):
                items = parse_json_file(filepath)
                results.extend(items)
        except Exception as e:
            results.append({"error": f"{name}: {str(e)}"})

    return results


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Не указан путь к файлу или папке"}))
        sys.exit(1)

    result = process_path(sys.argv[1])
    print(json.dumps(result))
