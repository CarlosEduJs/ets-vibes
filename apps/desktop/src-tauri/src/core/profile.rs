use std::path::PathBuf;

use serde::Serialize;

use crate::core::detection::{all_games, get_current_platform, GameConfig, Platform};

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
    pub custom_paths: Vec<PathBuf>,
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
            custom_paths: Vec::new(),
        }
    }

    pub fn with_games(games: Vec<&'static GameConfig>) -> Self {
        Self {
            games,
            platform: get_current_platform(),
            custom_paths: Vec::new(),
        }
    }

    pub fn get_profiles(&self) -> Vec<Profile> {
        let mut profiles = Vec::new();
        let mut seen = std::collections::HashSet::new();

        for game in &self.games {
            for path in game.get_paths(self.platform) {
                let profiles_dir = path.join("profiles");
                if profiles_dir.exists() {
                    scan_profiles_dir(&profiles_dir, &mut profiles, &mut seen);
                }
            }
        }

        for custom_path in &self.custom_paths {
            if !custom_path.exists() {
                continue;
            }
            let profiles_dir = custom_path.join("profiles");
            if profiles_dir.exists() && profiles_dir.is_dir() {
                scan_profiles_dir(&profiles_dir, &mut profiles, &mut seen);
            }

            if custom_path.is_dir() {
                scan_profiles_dir(custom_path, &mut profiles, &mut seen);

                if custom_path.join("profile.sii").exists() && seen.insert(custom_path.clone()) {
                    let name = custom_path
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_default();
                    profiles.push(Profile {
                        path: custom_path.clone(),
                        name,
                    });
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

fn scan_profiles_dir(
    dir: &std::path::Path,
    profiles: &mut Vec<Profile>,
    seen: &mut std::collections::HashSet<PathBuf>,
) {
    if let Ok(entries) = std::fs::read_dir(dir) {
        for entry in entries.flatten() {
            let profile_path = entry.path();
            if profile_path.is_dir()
                && profile_path.join("profile.sii").exists()
                && seen.insert(profile_path.clone())
            {
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

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests {
    use super::*;

    #[test]
    fn test_hex_decode_valid_ascii() {
        let result = hex_decode_name("48656c6c6f").unwrap();
        assert_eq!(result, "Hello");
    }

    #[test]
    fn test_hex_decode_space() {
        let result = hex_decode_name("4d792047616d65").unwrap();
        assert_eq!(result, "My Game");
    }

    #[test]
    fn test_hex_decode_empty() {
        // hex::decode("") -> Ok("") -> Some("")
        let result = hex_decode_name("");
        assert_eq!(result, Some(String::new()));
    }

    #[test]
    fn test_hex_decode_invalid_hex() {
        let result = hex_decode_name("zzzz");
        assert!(result.is_none());
    }

    #[test]
    fn test_hex_decode_odd_length() {
        let result = hex_decode_name("4865");
        assert!(result.is_some());
    }

    #[test]
    fn test_hex_decode_invalid_utf8() {
        let result = hex_decode_name("fffe");
        assert!(result.is_none());
    }

    #[test]
    fn test_display_name_hex() {
        let p = Profile {
            path: PathBuf::from("/tmp"),
            name: "48656c6c6f".to_string(),
        };
        assert_eq!(p.display_name(), "Hello");
    }

    #[test]
    fn test_display_name_plain() {
        let p = Profile {
            path: PathBuf::from("/tmp"),
            name: "plain_name".to_string(),
        };
        assert_eq!(p.display_name(), "plain_name");
    }

    #[test]
    fn test_save_file_new() {
        let sf = SaveFile::new(PathBuf::from("/profiles/abc"), "autosave".to_string());
        assert_eq!(sf.save_name, "autosave");
        assert_eq!(sf.path, PathBuf::from("/profiles/abc/save/autosave"));
        assert_eq!(
            sf.game_sii_path,
            PathBuf::from("/profiles/abc/save/autosave/game.sii")
        );
    }

    #[test]
    fn test_custom_path_detection_with_profiles_subfolder() {
        let temp_dir = tempfile::tempdir().unwrap();
        let profiles_dir = temp_dir.path().join("profiles");
        let prof_dir = profiles_dir.join("437573746f6d");
        std::fs::create_dir_all(&prof_dir).unwrap();
        std::fs::write(prof_dir.join("profile.sii"), b"SiiNunit").unwrap();

        let mut detector = ProfileDetector::new();
        detector.custom_paths.push(temp_dir.path().to_path_buf());

        let profiles = detector.get_profiles();
        assert!(profiles.iter().any(|p| p.display_name() == "Custom"));
    }

    #[test]
    fn test_custom_path_detection_profiles_folder_directly() {
        let temp_dir = tempfile::tempdir().unwrap();
        let prof_dir = temp_dir.path().join("54657374");
        std::fs::create_dir_all(&prof_dir).unwrap();
        std::fs::write(prof_dir.join("profile.sii"), b"SiiNunit").unwrap();

        let mut detector = ProfileDetector::new();
        detector.custom_paths.push(temp_dir.path().to_path_buf());

        let profiles = detector.get_profiles();
        assert!(profiles.iter().any(|p| p.display_name() == "Test"));
    }
}
