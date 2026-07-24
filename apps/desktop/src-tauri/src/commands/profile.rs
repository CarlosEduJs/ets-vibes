use std::path::PathBuf;

use crate::core::profile::{Profile, ProfileDetector, SaveFile};

use super::{helpers::read_profile_sii, ProfileInfo, SaveInfo};

impl From<Profile> for ProfileInfo {
    fn from(p: Profile) -> Self {
        let display_name = p.display_name();
        let (active_mods, cached_experience, cached_distance) = read_profile_sii(&p.path);
        Self {
            path: p.path.to_string_lossy().to_string(),
            name: p.name,
            display_name,
            active_mods,
            cached_experience,
            cached_distance,
        }
    }
}

impl From<SaveFile> for SaveInfo {
    fn from(s: SaveFile) -> Self {
        Self {
            profile_path: s.profile_path.to_string_lossy().to_string(),
            save_name: s.save_name,
            path: s.path.to_string_lossy().to_string(),
            game_sii_path: s.game_sii_path.to_string_lossy().to_string(),
        }
    }
}

#[tauri::command]
pub fn list_profiles(custom_path: Option<String>) -> Result<Vec<ProfileInfo>, String> {
    let mut detector = ProfileDetector::new();
    if let Some(path_str) = custom_path {
        let trimmed = path_str.trim();
        if !trimmed.is_empty() {
            detector.custom_paths.push(PathBuf::from(trimmed));
        }
    }
    let profiles = detector.get_profiles();
    Ok(profiles.into_iter().map(ProfileInfo::from).collect())
}

#[tauri::command]
pub fn get_saves(profile_path: String) -> Result<Vec<SaveInfo>, String> {
    let profile = Profile {
        path: PathBuf::from(&profile_path),
        name: String::new(),
    };
    let detector = ProfileDetector::new();
    let saves = detector.get_saves(&profile);
    Ok(saves.into_iter().map(SaveInfo::from).collect())
}

#[tauri::command]
pub fn delete_profile(profile_path: String) -> Result<super::EditResult, String> {
    let path = std::path::Path::new(&profile_path);
    crate::core::profile_ops::delete_profile(path).map_err(|e| e.to_string())?;
    Ok(super::EditResult {
        message: "Profile deleted (backup created)".into(),
        backup: None,
    })
}
