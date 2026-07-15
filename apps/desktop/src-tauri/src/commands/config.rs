use std::path::Path;

use crate::core::backup::backup_file;
use crate::save_parser::config::{ConfigDocument, ConfigEntry};

use super::EditResult;

#[tauri::command]
pub fn list_configs() -> Result<Vec<String>, String> {
    let configs = crate::core::detection::find_config_files();
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
