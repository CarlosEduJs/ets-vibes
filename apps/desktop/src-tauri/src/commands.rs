use std::path::{Path, PathBuf};

use ets_core::{backup_file, Profile, ProfileDetector, SaveFile};
use ets_save_parser::{
    compression::decompress_save, config::ConfigDocument, editor::SaveEditor, sii::SiiDocument,
};
use serde::Serialize;

#[derive(Serialize)]
pub struct SaveData {
    pub money: Option<i64>,
    pub xp: Option<i64>,
    pub level: Option<u32>,
    pub trucks_count: Option<u32>,
    pub drivers_count: Option<u32>,
    pub hq_city: Option<String>,
    pub money_account: Option<String>,
    pub experience_points: Option<String>,
    pub was_compressed: bool,
}

fn calc_level(exp: i64) -> u32 {
    let exp = exp as f64;
    ((1.0 + (1.0 + 8.0 * exp / 100.0).sqrt()) / 2.0).floor() as u32
}

#[derive(Serialize)]
pub struct EditResult {
    pub message: String,
    pub backup: Option<String>,
}

#[derive(Serialize)]
pub struct ProfileInfo {
    pub path: String,
    pub name: String,
    pub display_name: String,
}

#[derive(Serialize)]
pub struct SaveInfo {
    pub profile_path: String,
    pub save_name: String,
    pub path: String,
    pub game_sii_path: String,
}

impl From<Profile> for ProfileInfo {
    fn from(p: Profile) -> Self {
        let display_name = p.display_name();
        Self {
            path: p.path.to_string_lossy().to_string(),
            name: p.name,
            display_name,
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
pub fn list_profiles() -> Result<Vec<ProfileInfo>, String> {
    let detector = ProfileDetector::new();
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
pub fn load_save(game_sii_path: String) -> Result<SaveData, String> {
    let data = std::fs::read(&game_sii_path).map_err(|e| e.to_string())?;
    let was_compressed = data.len() >= 4 && &data[..4] == b"ScsC";
    let content = decompress_save(&data).map_err(|e| e.to_string())?;

    let doc = SiiDocument::new(content);

    let money_account = doc.get_property("money_account").map(|s| s.to_string());
    let experience_points = doc.get_property("experience_points").map(|s| s.to_string());

    let money = money_account.as_ref().and_then(|s| s.parse::<i64>().ok());
    let xp = experience_points
        .as_ref()
        .and_then(|s| s.parse::<i64>().ok());

    let computed_level = xp.map(calc_level);

    let trucks_count = doc
        .get_property("trucks")
        .and_then(|s| s.parse::<u32>().ok());

    let drivers_count = doc
        .get_property("drivers")
        .and_then(|s| s.parse::<u32>().ok());

    let hq_city = doc.get_property("hq_city").map(|s| s.to_string());

    Ok(SaveData {
        money,
        xp,
        level: computed_level,
        trucks_count,
        drivers_count,
        hq_city,
        money_account,
        experience_points,
        was_compressed,
    })
}

fn save_file_from_game_sii(game_sii_path: &str) -> Result<SaveFile, String> {
    let path = Path::new(game_sii_path);
    let save_name = path
        .parent()
        .and_then(|p| p.file_name())
        .map(|n| n.to_string_lossy().to_string())
        .ok_or_else(|| "Invalid save path: missing save directory".to_string())?;
    let profile_path = path
        .ancestors()
        .nth(3)
        .ok_or_else(|| "Invalid save path: missing profile directory".to_string())?
        .to_path_buf();
    Ok(SaveFile::new(profile_path, save_name))
}

#[tauri::command]
pub fn edit_save(
    game_sii_path: String,
    money: Option<i64>,
    xp: Option<i64>,
) -> Result<EditResult, String> {
    let file_path = Path::new(&game_sii_path);
    let save_file = save_file_from_game_sii(&game_sii_path)?;

    let mut editor = SaveEditor::new(save_file);
    editor.load().map_err(|e| e.to_string())?;

    let mut changes = Vec::new();

    if let Some(amount) = money {
        if editor.edit_money(amount).map_err(|e| e.to_string())? {
            changes.push(format!("money -> {}", amount));
        }
    }

    if let Some(xp_val) = xp {
        if editor.edit_xp(xp_val).map_err(|e| e.to_string())? {
            changes.push(format!("xp -> {}", xp_val));
        }
    }

    let backup = if changes.is_empty() {
        None
    } else {
        let bp = backup_file(file_path).map_err(|e| e.to_string())?;
        editor.save().map_err(|e| e.to_string())?;
        Some(bp.to_string_lossy().to_string())
    };

    let message = backup
        .as_ref()
        .map(|b| format!("Saved (backup: {})", b))
        .unwrap_or_else(|| "No changes made.".into());

    Ok(EditResult { message, backup })
}

#[tauri::command]
pub fn max_skills(game_sii_path: String) -> Result<EditResult, String> {
    let file_path = Path::new(&game_sii_path);
    let save_file = save_file_from_game_sii(&game_sii_path)?;

    let mut editor = SaveEditor::new(save_file);
    editor.load().map_err(|e| e.to_string())?;
    let changes = editor.max_skills().map_err(|e| e.to_string())?;

    let (message, backup) = if changes.is_empty() {
        ("Skills already maxed.".into(), None)
    } else {
        let bp = backup_file(file_path).map_err(|e| e.to_string())?;
        editor.save().map_err(|e| e.to_string())?;
        (
            format!("Skills maxed (backup: {})", bp.display()),
            Some(bp.to_string_lossy().to_string()),
        )
    };

    Ok(EditResult { message, backup })
}

#[tauri::command]
pub fn repair_all(game_sii_path: String) -> Result<EditResult, String> {
    let file_path = Path::new(&game_sii_path);
    let save_file = save_file_from_game_sii(&game_sii_path)?;

    let mut editor = SaveEditor::new(save_file);
    editor.load().map_err(|e| e.to_string())?;
    let changes = editor.repair_all().map_err(|e| e.to_string())?;

    let (message, backup) = if changes.is_empty() {
        ("Everything already repaired.".into(), None)
    } else {
        let bp = backup_file(file_path).map_err(|e| e.to_string())?;
        editor.save().map_err(|e| e.to_string())?;
        (
            format!("Repaired: {} (backup: {})", changes.join(", "), bp.display()),
            Some(bp.to_string_lossy().to_string()),
        )
    };

    Ok(EditResult { message, backup })
}

#[tauri::command]
pub fn refuel_all(game_sii_path: String) -> Result<EditResult, String> {
    let file_path = Path::new(&game_sii_path);
    let save_file = save_file_from_game_sii(&game_sii_path)?;

    let mut editor = SaveEditor::new(save_file);
    editor.load().map_err(|e| e.to_string())?;
    let changes = editor.refuel_all().map_err(|e| e.to_string())?;

    let (message, backup) = if changes.is_empty() {
        ("Everything already refueled.".into(), None)
    } else {
        let bp = backup_file(file_path).map_err(|e| e.to_string())?;
        editor.save().map_err(|e| e.to_string())?;
        (
            format!("Refueled (backup: {})", bp.display()),
            Some(bp.to_string_lossy().to_string()),
        )
    };

    Ok(EditResult { message, backup })
}

#[tauri::command]
pub fn unlock_cities(game_sii_path: String) -> Result<EditResult, String> {
    let file_path = Path::new(&game_sii_path);
    let save_file = save_file_from_game_sii(&game_sii_path)?;

    let mut editor = SaveEditor::new(save_file);
    editor.load().map_err(|e| e.to_string())?;
    let count = editor.unlock_all_cities().map_err(|e| e.to_string())?;

    let (message, backup) = if count > 0 {
        let bp = backup_file(file_path).map_err(|e| e.to_string())?;
        editor.save().map_err(|e| e.to_string())?;
        (
            format!("Unlocked {} cities (backup: {})", count, bp.display()),
            Some(bp.to_string_lossy().to_string()),
        )
    } else {
        ("No new cities to unlock.".into(), None)
    };

    Ok(EditResult { message, backup })
}

// --- Profile / Save Management ---

#[tauri::command]
pub fn rename_save(game_sii_path: String, new_name: String) -> Result<EditResult, String> {
    let path = Path::new(&game_sii_path);
    let save_path = path
        .parent()
        .ok_or_else(|| "Invalid save path".to_string())?;

    ets_core::rename_save(save_path, &new_name)
        .map_err(|e| e.to_string())?;

    Ok(EditResult {
        message: format!("Renamed save to '{}'", new_name),
        backup: None,
    })
}

#[tauri::command]
pub fn clone_save(game_sii_path: String, new_name: String) -> Result<EditResult, String> {
    let path = Path::new(&game_sii_path);
    let save_path = path
        .parent()
        .ok_or_else(|| "Invalid save path".to_string())?;

    ets_core::clone_save(save_path, &new_name).map_err(|e| e.to_string())?;

    Ok(EditResult {
        message: format!("Cloned save to '{}'", new_name),
        backup: None,
    })
}

#[tauri::command]
pub fn delete_save(game_sii_path: String) -> Result<EditResult, String> {
    let path = Path::new(&game_sii_path);
    let save_path = path
        .parent()
        .ok_or_else(|| "Invalid save path".to_string())?;

    ets_core::delete_save(save_path).map_err(|e| e.to_string())?;

    Ok(EditResult {
        message: "Save deleted (backup created)".into(),
        backup: None,
    })
}

#[tauri::command]
pub fn delete_profile(profile_path: String) -> Result<EditResult, String> {
    let path = Path::new(&profile_path);

    ets_core::delete_profile(path).map_err(|e| e.to_string())?;

    Ok(EditResult {
        message: "Profile deleted (backup created)".into(),
        backup: None,
    })
}

// --- Config Editor ---

#[tauri::command]
pub fn list_configs() -> Result<Vec<String>, String> {
    let configs = ets_core::find_config_files();
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
pub fn save_config(
    path: String,
    entries: Vec<ets_save_parser::ConfigEntry>,
) -> Result<EditResult, String> {
    // Validate all entries before saving
    let mut errors: Vec<String> = Vec::new();
    for entry in &entries {
        if let Err(msg) = entry.val_type.validate(&entry.value) {
            errors.push(format!("{}: {}", entry.key, msg));
        }
    }

    if !errors.is_empty() {
        return Err(format!("Validation errors:\n{}", errors.join("\n")));
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
