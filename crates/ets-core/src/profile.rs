use std::path::PathBuf;

use serde::Serialize;

use crate::detection::{all_games, get_current_platform, GameConfig, Platform};

#[derive(Debug, Clone, Serialize)]
pub struct SaveFile {
    pub profile_path: PathBuf,
    pub save_name: String,
    pub path: PathBuf,
    pub game_sii_path: PathBuf,
}

impl SaveFile {
    pub fn new(profile_path: PathBuf, save_name: String) -> Self {
        let path = profile_path.join("save").join(&save_name);
        let game_sii_path = path.join("game.sii");
        Self {
            profile_path,
            save_name,
            path,
            game_sii_path,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Profile {
    pub path: PathBuf,
    pub name: String,
}

impl Profile {
    pub fn display_name(&self) -> String {
        hex_decode_name(&self.name).unwrap_or_else(|| self.name.clone())
    }
}

fn hex_decode_name(hex_name: &str) -> Option<String> {
    let bytes = hex::decode(hex_name).ok()?;
    String::from_utf8(bytes).ok()
}

pub struct ProfileDetector {
    pub games: Vec<&'static GameConfig>,
    pub platform: Platform,
}

impl Default for ProfileDetector {
    fn default() -> Self {
        Self::new()
    }
}

impl ProfileDetector {
    pub fn new() -> Self {
        Self {
            games: all_games().iter().collect(),
            platform: get_current_platform(),
        }
    }

    pub fn with_games(games: Vec<&'static GameConfig>) -> Self {
        Self {
            games,
            platform: get_current_platform(),
        }
    }

    pub fn get_profiles(&self) -> Vec<Profile> {
        let mut profiles = Vec::new();

        for game in &self.games {
            for path in game.get_paths(self.platform) {
                let profiles_dir = path.join("profiles");
                if !profiles_dir.exists() {
                    continue;
                }

                if let Ok(entries) = std::fs::read_dir(&profiles_dir) {
                    for entry in entries.flatten() {
                        let profile_path = entry.path();
                        if profile_path.is_dir() && profile_path.join("profile.sii").exists() {
                            let name = profile_path
                                .file_name()
                                .map(|n| n.to_string_lossy().to_string())
                                .unwrap_or_default();
                            profiles.push(Profile {
                                path: profile_path,
                                name,
                            });
                        }
                    }
                }
            }
        }

        profiles
    }

    pub fn get_saves(&self, profile: &Profile) -> Vec<SaveFile> {
        let save_dir = profile.path.join("save");
        if !save_dir.exists() {
            return vec![];
        }

        let mut saves = Vec::new();

        if let Ok(entries) = std::fs::read_dir(&save_dir) {
            for entry in entries.flatten() {
                let save_path = entry.path();
                if save_path.is_dir() && save_path.join("game.sii").exists() {
                    let save_name = save_path
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_default();
                    saves.push(SaveFile::new(profile.path.clone(), save_name));
                }
            }
        }

        saves
    }
}
