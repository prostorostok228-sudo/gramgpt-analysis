#!/usr/bin/env python3
"""
tdata → GramJS StringSession converter.
Usage: python3 tdata_convert.py <tdata_dir>
Output: JSON array of { phone, dc_id, session_string, first_name, last_name, username }
"""
import sys
import os
import shutil
import asyncio
import json
import struct
import base64
import socket


def fix_tdata_structure(p):
    """
    Opentele expects this layout:
      <root>/key_datas          — encrypted local key (tried as 'key_data' + 's')
      <root>/D877F783D5D3EF8Cs  — mtp auth data backup (tried as hex + 's')
      <root>/D877F783D5D3EF8C/  — DIRECTORY: account sub-storage
      <root>/D877F783D5D3EF8C/maps — account map file

    Old-format tdata puts 'maps' in the root instead of inside the hex subdirectory.
    This function creates the subdirectory and copies the root 'maps' into it.
    Also removes any hex FILE we may have previously created (needs to be a dir).
    """
    try:
        entries = os.listdir(p)

        # Find backup hex files (17-char: 16 hex + 's')
        hex_bases = set()
        for name in entries:
            full = os.path.join(p, name)
            if (os.path.isfile(full) and len(name) == 17
                    and name.endswith('s')
                    and all(c in '0123456789ABCDEFabcdef' for c in name[:-1])):
                hex_bases.add(name[:-1])

        root_maps = os.path.join(p, 'maps')

        for base in hex_bases:
            subdir = os.path.join(p, base)

            # If a plain FILE with this name exists (from a previous copy attempt), remove it
            if os.path.isfile(subdir):
                os.remove(subdir)

            # Create the subdirectory that opentele expects
            if not os.path.isdir(subdir):
                os.makedirs(subdir)

            # Populate maps inside the subdir so mapData.read() finds it
            subdir_maps = os.path.join(subdir, 'maps')
            if os.path.isfile(root_maps) and not os.path.exists(subdir_maps):
                shutil.copy2(root_maps, subdir_maps)

    except Exception:
        pass  # Non-critical — opentele will raise its own error if still broken


async def convert(tdata_path: str):
    results = []

    try:
        import opentele.td as td
        from opentele.api import UseCurrentSession

        # Try the path directly, then with "tdata" subfolder
        candidates = [tdata_path]
        tdata_sub = os.path.join(tdata_path, "tdata")
        if os.path.isdir(tdata_sub):
            candidates.insert(0, tdata_sub)

        # Pre-check: validate tdata structure before calling opentele
        def check_tdata_structure(p):
            """Returns (ok, error_msg). Checks for account data presence."""
            if not os.path.exists(os.path.join(p, 'key_datas')):
                return False, "Файл key_datas не найден — это не папка tdata"
            entries = os.listdir(p)
            def is_account_entry(name):
                # Primary hex file/dir (D877F783D5D3EF8C) - 16 chars
                if (len(name) == 16 and
                        all(c in '0123456789ABCDEFabcdef' for c in name)):
                    return True
                # Backup hex file (D877F783D5D3EF8Cs) - 17 chars ending in 's'
                if (name.endswith('s') and len(name) == 17 and
                        all(c in '0123456789ABCDEFabcdef' for c in name[:-1])):
                    return True
                return False
            hex_entries = [e for e in entries if is_account_entry(e)]
            if not hex_entries:
                return False, (
                    "Папка с данными аккаунта не найдена. "
                    "В tdata должна быть подпапка вида D877F783D5D3EF8C или D877F783D5D3EF8Cs. "
                    "Проверьте, что загружена правильная папка tdata."
                )
            return True, None

        tdesktop = None
        last_error = None
        for candidate in candidates:
            ok, err = check_tdata_structure(candidate)
            if not ok:
                last_error = err
                continue
            # Fix old-format tdata: create hex subdir with maps inside
            fix_tdata_structure(candidate)
            try:
                t = td.TDesktop(candidate)
                if t.isLoaded() and t.accounts:
                    tdesktop = t
                    break
            except Exception as e:
                last_error = str(e)
                continue

        if tdesktop is None:
            print(json.dumps({"error": last_error or "tdata не загружена или повреждена"}))
            return

        accounts = tdesktop.accounts
        if not accounts:
            print(json.dumps({"error": "Аккаунты не найдены в tdata"}))
            return

        for account in accounts:
            try:
                # Convert to telethon client
                client = await account.ToTelethon(flag=UseCurrentSession)

                await client.connect()
                me = await client.get_me()

                # SQLiteSession.save() returns None (no filename), so build raw manually
                dc_id = client.session.dc_id
                ip_bytes = socket.inet_aton(client.session.server_address)
                port = client.session.port
                auth_key_bytes = client.session.auth_key.key  # 256 bytes

                # GramJS StringSession: "1" + base64(dc_id[1] + ip[4] + port[2] + authkey[256])
                raw = struct.pack('>B', dc_id) + ip_bytes + struct.pack('>H', port) + auth_key_bytes
                gramjs_session = "1" + base64.b64encode(raw).decode()

                await client.disconnect()

                results.append({
                    "phone": me.phone or ("+" + str(me.id)),
                    "first_name": me.first_name or "",
                    "last_name": me.last_name or "",
                    "username": me.username or "",
                    "user_id": str(me.id),
                    "session_string": gramjs_session,
                })
            except Exception as e:
                results.append({"error": f"Аккаунт пропущен: {str(e)}"})

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        return

    print(json.dumps(results))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Не указан путь к tdata"}))
        sys.exit(1)

    tdata_path = sys.argv[1]

    # opentele expects the folder containing "tdata" subfolder,
    # or directly the tdata folder itself — try both
    if not os.path.isdir(tdata_path):
        print(json.dumps({"error": f"Папка не найдена: {tdata_path}"}))
        sys.exit(1)

    asyncio.run(convert(tdata_path))
