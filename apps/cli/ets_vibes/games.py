import sys
import os
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import List

class Platform(Enum):
    WINDOWS = "windows"
    LINUX = "linux"
    MACOS = "macos"

class GameType(Enum):
    ETS2 = "ets2"
    ATS = "ats"

@dataclass
class GameConfig:
    game_type: GameType
    name: str
    steam_app_id: str
    
    def get_paths(self, platform: Platform) -> List[Path]:
        if platform == Platform.WINDOWS:
            return self._get_windows_paths()
        elif platform == Platform.LINUX:
            return self._get_linux_paths()
        elif platform == Platform.MACOS:
            return self._get_macos_paths()
        return []
    
    def _get_windows_paths(self) -> List[Path]:
        base_name = self._get_folder_name()
        paths = []
        user_profile = os.environ.get("USERPROFILE", "")
        
        docs = Path(user_profile) / "Documents" / base_name
        if docs.exists(): paths.append(docs)
        
        onedrive = Path(user_profile) / "OneDrive/Documents" / base_name
        if onedrive.exists(): paths.append(onedrive)
        
        steam_paths = [
            Path("C:/Program Files (x86)/Steam/userdata"),
            Path("C:/Program Files/Steam/userdata"),
            Path(user_profile) / "Steam/userdata",
        ]
        
        for steam in steam_paths:
            if steam.exists():
                for user_dir in steam.iterdir():
                    if user_dir.is_dir():
                        game_path = user_dir / self.steam_app_id / "remote"
                        if game_path.exists(): paths.append(game_path)
        return paths
    
    def _get_linux_paths(self) -> List[Path]:
        home = Path.home()
        base_name = self._get_folder_name()
        paths = []
        
        native = home / ".local/share" / base_name
        if native.exists(): paths.append(native)
        
        steam_dirs = [
            home / ".steam/steam/userdata",
            home / ".local/share/Steam/userdata",
            home / ".var/app/com.valvesoftware.Steam/.steam/steam/userdata",
        ]
        
        for steam_primary in steam_dirs:
            if steam_primary.exists():
                for user_dir in steam_primary.iterdir():
                    if user_dir.is_dir():
                        game_path = user_dir / self.steam_app_id / "remote"
                        if game_path.exists(): paths.append(game_path)
        return paths
    
    def _get_macos_paths(self) -> List[Path]:
        path = Path.home() / "Library/Application Support" / self._get_folder_name()
        return [path] if path.exists() else []
    
    def _get_folder_name(self) -> str:
        return "Euro Truck Simulator 2" if self.game_type == GameType.ETS2 else "American Truck Simulator"

ETS2 = GameConfig(GameType.ETS2, "Euro Truck Simulator 2", "227300")
ATS = GameConfig(GameType.ATS, "American Truck Simulator", "270880")
SUPPORTED_GAMES = [ETS2, ATS]

def get_current_platform() -> Platform:
    if sys.platform == "win32": return Platform.WINDOWS
    if sys.platform == "darwin": return Platform.MACOS
    return Platform.LINUX

def detect_installed_games() -> List[GameConfig]:
    platform = get_current_platform()
    return [g for g in SUPPORTED_GAMES if g.get_paths(platform)]
