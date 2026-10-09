#!/usr/bin/env python3
import json, sqlite3, sys
from pathlib import Path

def audit(root: str):
    root = Path(root)
    db = root / "pb_data" / "data.db"
    con = sqlite3.connect(f"file:{db}?mode=ro&immutable=1", uri=True)
    con.row_factory = sqlite3.Row
    out = {"root": str(root), "db": str(db)}
    out["integrity_check"] = con.execute("PRAGMA integrity_check").fetchone()[0]
    out["journal_mode"] = con.execute("PRAGMA journal_mode").fetchone()[0]
    out["tables"] = [r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")]
    cols = {r[1] for r in con.execute("PRAGMA table_info(_collections)")}
    out["collections_columns"] = sorted(cols)
    wanted = [c for c in ("id","name","type","system","schema","fields","indexes","listRule","viewRule","createRule","updateRule","deleteRule","options") if c in cols]
    collections = []
    for row in con.execute(f"SELECT {','.join(wanted)} FROM _collections ORDER BY name"):
        item = dict(row)
        for key in ("schema", "fields", "indexes", "options"):
            if key in item and isinstance(item[key], str):
                try: item[key] = json.loads(item[key])
                except json.JSONDecodeError: pass
        table = item["name"]
        try:
            item["record_count"] = con.execute(f'SELECT count(*) FROM "{table}"').fetchone()[0]
            item["record_ids"] = [r[0] for r in con.execute(f'SELECT id FROM "{table}" ORDER BY id')] if "id" in {x[1] for x in con.execute(f'PRAGMA table_info("{table}")')} else []
        except sqlite3.Error as exc:
            item["record_error"] = str(exc)
        collections.append(item)
    out["collections"] = collections
    out["migrations"] = sorted(p.name for p in (root / "pb_migrations").glob("*") if p.is_file())
    out["hooks"] = sorted(str(p.relative_to(root)) for p in (root / "pb_hooks").rglob("*") if p.is_file()) if (root / "pb_hooks").exists() else []
    out["storage_files"] = sorted(str(p.relative_to(root / "pb_data")) for p in (root / "pb_data" / "storage").rglob("*") if p.is_file()) if (root / "pb_data" / "storage").exists() else []
    return out

if __name__ == "__main__":
    print(json.dumps(audit(sys.argv[1]), indent=2, sort_keys=True))
