"""The engine's static data: the same JSON files the TypeScript engine imports (the legacy repo's src/engine/data/**), read in place.

This repo carries a copy at data/engine/ (taken from the legacy repo at ddbf9d81); JG_ENGINE_DATA can point elsewhere (a container that
ships only backend/ copies the folder and sets JG_ENGINE_DATA). Until cutover a change to the TS engine's data is copied here too."""
from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path

ENGINE_DATA = Path(os.environ.get('JG_ENGINE_DATA') or Path(__file__).resolve().parents[3] / 'data' / 'engine')


@lru_cache(maxsize=None)
def load_json(rel: str):
    with open(ENGINE_DATA / rel, encoding='utf-8') as f:
        return json.load(f)
