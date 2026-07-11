use std::path::PathBuf;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Platform {
    Windows,
    Linux,
    MacOS,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GameType {
    Ets2,
    Ats,
}

#[derive(Debug, Clone)]
pub struct GameConfig {
    pub game_type: GameType,
    pub name: &'static str,
    pub steam_app_id: &'static str,
}

static SUPPORTED_GAMES: &[GameConfig] = &[
    GameConfig {
        game_type: GameType::Ets2,
        name: "Euro Truck Simulator 2",
        steam_app_id: "227300",
    },
    GameConfig {
        game_type: GameType::Ats,
        name: "American Truck Simulator",
        steam_app_id: "270880",
    },
];

impl GameConfig {
    pub fn get_paths(&self, platform: Platform) -> Vec<PathBuf> {
        match platform {
            Platform::Windows => self.get_windows_paths(),
            Platform::Linux => self.get_linux_paths(),
            Platform::MacOS => self.get_macos_paths(),
        }
    }

    fn folder_name(&self) -> &'static str {
        match self.game_type {
            GameType::Ets2 => "Euro Truck Simulator 2",
            GameType::Ats => "American Truck Simulator",
        }
    }

    fn get_windows_paths(&self) -> Vec<PathBuf> {
        let mut paths = Vec::new();

        if let Some(docs) = dirs::document_dir() {
            let path = docs.join(self.folder_name());
            if path.exists() {
                paths.push(path);
            }

            let onedrive = docs.join("OneDrive/Documents").join(self.folder_name());
            if onedrive.exists() {
                paths.push(onedrive);
            }
        }

        if let Some(user_profile) = dirs::home_dir() {
            let steam_dirs = [
                PathBuf::from("C:/Program Files (x86)/Steam/userdata"),
                PathBuf::from("C:/Program Files/Steam/userdata"),
                user_profile.join("Steam/userdata"),
            ];

            for steam_dir in &steam_dirs {
                if steam_dir.exists() {
                    if let Ok(entries) = std::fs::read_dir(steam_dir) {
                        for entry in entries.flatten() {
                            let game_path = entry.path().join(self.steam_app_id).join("remote");
                            if game_path.exists() {
                                paths.push(game_path);
                            }
                        }
                    }
                }
            }
        }

        paths
    }

    fn get_linux_paths(&self) -> Vec<PathBuf> {
        let mut paths = Vec::new();

        if let Some(data_dir) = dirs::data_dir() {
            let local = data_dir.join(self.folder_name());
            if local.exists() {
                paths.push(local);
            }
        }

        if let Some(home) = dirs::home_dir() {
            let steam_dirs = [
                home.join(".steam/steam/userdata"),
                home.join(".local/share/Steam/userdata"),
                home.join(".var/app/com.valvesoftware.Steam/.steam/steam/userdata"),
            ];

            for steam_dir in &steam_dirs {
                if steam_dir.exists() {
                    if let Ok(entries) = std::fs::read_dir(steam_dir) {
                        for entry in entries.flatten() {
                            let game_path = entry.path().join(self.steam_app_id).join("remote");
                            if game_path.exists() {
                                paths.push(game_path);
                            }
                        }
                    }
                }
            }
        }

        paths
    }

    fn get_macos_paths(&self) -> Vec<PathBuf> {
        let path = dirs::home_dir()
            .unwrap_or_default()
            .join("Library/Application Support")
            .join(self.folder_name());

        if path.exists() {
            vec![path]
        } else {
            vec![]
        }
    }
}

pub fn get_current_platform() -> Platform {
    if cfg!(target_os = "windows") {
        Platform::Windows
    } else if cfg!(target_os = "macos") {
        Platform::MacOS
    } else {
        Platform::Linux
    }
}

pub fn detect_installed_games() -> Vec<&'static GameConfig> {
    let platform = get_current_platform();
    SUPPORTED_GAMES
        .iter()
        .filter(|g| !g.get_paths(platform).is_empty())
        .collect()
}

pub fn all_games() -> &'static [GameConfig] {
    SUPPORTED_GAMES
}
