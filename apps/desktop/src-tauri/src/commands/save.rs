use std::path::Path;

use crate::core::backup::backup_file;
use crate::save_parser::{
    compression::decompress_save, editor::get_trucks_info, editor::SaveEditor, sii::SiiDocument,
};

use super::helpers::{calc_level, read_info_sii, save_file_from_game_sii};
use super::{EditResult, SaveData};

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

    let trucks = get_trucks_info(doc.content());

    let game_time = doc
        .get_property("game_time")
        .and_then(|s| s.parse::<i64>().ok());

    let total_distance_km = doc
        .get_property("total_distance")
        .and_then(|s| s.parse::<f64>().ok());

    let total_fuel_litres = doc
        .get_property("total_fuel_litres")
        .and_then(|s| s.parse::<f64>().ok());

    let visited_cities_count = doc
        .get_property("visited_cities_count")
        .and_then(|s| s.parse::<u32>().ok());

    let achieved_feats = doc
        .get_property("achieved_feats")
        .and_then(|s| s.parse::<u32>().ok());

    let new_game = doc.get_property("new_game").map(|s| s == "true");

    let discovered_items = doc
        .get_property("discovered_items")
        .and_then(|s| s.parse::<u32>().ok());

    let save_path = Path::new(&game_sii_path).parent().unwrap_or(Path::new(""));
    let (save_version, file_time, mods) = read_info_sii(save_path);

    let (game_version, compatibility_warning) = super::helpers::read_game_version();

    Ok(SaveData {
        money,
        xp,
        level: computed_level,
        trucks_count,
        drivers_count,
        hq_city,
        trucks,
        money_account,
        experience_points,
        was_compressed,
        game_time,
        total_distance_km,
        total_fuel_litres,
        visited_cities_count,
        achieved_feats,
        new_game,
        discovered_items,
        save_version,
        file_time,
        mods,
        game_version,
        compatibility_warning,
    })
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

    let message = backup.as_ref().map_or_else(
        || "No changes made.".into(),
        |b| format!("Saved (backup: {})", b),
    );

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
            format!(
                "Repaired: {} (backup: {})",
                changes.join(", "),
                bp.display()
            ),
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
