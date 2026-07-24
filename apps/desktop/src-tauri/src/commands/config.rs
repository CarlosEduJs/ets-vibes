use std::path::Path;

use serde::Serialize;

use crate::core::backup::backup_file;
use crate::core::compatibility::APP_VERSION;
use crate::save_parser::config::{ConfigDocument, ConfigEntry};

use super::EditResult;

#[derive(Serialize)]
pub struct AppVersionInfo {
    pub app_version: String,
    pub game_version: Option<String>,
    pub tested_game_version: String,
    pub compatibility_warning: Option<String>,
}

#[tauri::command]
pub fn get_app_info(custom_path: Option<String>) -> Result<AppVersionInfo, String> {
    let custom_p = custom_path
        .as_deref()
        .filter(|s| !s.trim().is_empty())
        .map(Path::new);
    let (game_version, compatibility_warning) = super::helpers::read_game_version(custom_p);
    Ok(AppVersionInfo {
        app_version: APP_VERSION.to_string(),
        game_version,
        tested_game_version: crate::core::compatibility::TESTED_GAME_VERSION.to_display(),
        compatibility_warning,
    })
}

#[tauri::command]
pub fn list_configs(custom_path: Option<String>) -> Result<Vec<String>, String> {
    let custom_p = custom_path
        .as_deref()
        .filter(|s| !s.trim().is_empty())
        .map(Path::new);
    let configs = crate::core::detection::find_config_files(custom_p);
    Ok(configs
        .into_iter()
        .map(|p| p.to_string_lossy().to_string())
        .collect())
}

#[tauri::command]
pub fn load_config(path: String) -> Result<ConfigDocument, String> {
    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let doc = ConfigDocument::parse(&content);
    Ok(doc)
}

#[tauri::command]
pub fn save_config(path: String, entries: Vec<ConfigEntry>) -> Result<EditResult, String> {
    for entry in &entries {
        if let Err(msg) = entry.val_type.validate(&entry.value) {
            return Err(format!("Validation error for {}: {}", entry.key, msg));
        }
    }

    let file_path = Path::new(&path);
    let backup = backup_file(file_path).map_err(|e| e.to_string())?;

    let doc = ConfigDocument { entries };
    let content = doc.to_string();
    std::fs::write(&path, content).map_err(|e| e.to_string())?;

    let message = format!("Config saved (backup: {})", backup.display());
    Ok(EditResult {
        message,
        backup: Some(backup.to_string_lossy().to_string()),
    })
}
