import os
import shutil
from pathlib import Path
from typing import List
from .games import GameConfig, ETS2, ATS, detect_installed_games, get_current_platform

class SaveFile:
    def __init__(self, profile_path: Path, save_name: str):
        self.path = profile_path / "save" / save_name
        self.name = save_name
        self.game_sii_path = self.path / "game.sii"

    def read_game_sii(self) -> bytes:
        return self.game_sii_path.read_bytes()

    def write_game_sii(self, data: bytes) -> None:
        backup_path = self.game_sii_path.with_suffix(".sii.backup")
        if not backup_path.exists():
            shutil.copy2(self.game_sii_path, backup_path)
        self.game_sii_path.write_bytes(data)

class Profile:
    def __init__(self, path: Path):
        self.path = path
        self.name = path.name

class ProfileDetector:
    def __init__(self, games: List[GameConfig] = None):
        self.games = games or detect_installed_games()
        self.platform = get_current_platform()

    def get_profiles(self) -> List[Profile]:
        profiles = []
        for game in self.games:
            for path in game.get_paths(self.platform):
                profiles_dir = path / "profiles"
                if profiles_dir.exists():
                    for p_dir in profiles_dir.iterdir():
                        if p_dir.is_dir() and (p_dir / "profile.sii").exists():
                            profiles.append(Profile(p_dir))
        return profiles

    def get_saves(self, profile: Profile) -> List[SaveFile]:
        save_dir = profile.path / "save"
        if not save_dir.exists():
            return []
        
        saves = []
        for s_dir in save_dir.iterdir():
            if s_dir.is_dir() and (s_dir / "game.sii").exists():
                saves.append(SaveFile(profile.path, s_dir.name))
        return saves
