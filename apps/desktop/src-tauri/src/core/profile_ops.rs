use std::fs;
use std::path::{Path, PathBuf};

use crate::core::backup::backup_file;
use crate::core::error::CoreError;

fn is_valid_save_name(name: &str) -> bool {
    !name.is_empty()
        && name
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '-')
}

fn update_info_sii_name(save_path: &Path, new_name: &str) -> Result<(), CoreError> {
    let info_path = save_path.join("info.sii");
    if !info_path.exists() {
        return Ok(());
    }
    let content = fs::read_to_string(&info_path)?;
    let mut lines: Vec<String> = content.lines().map(|l| l.to_string()).collect();
    let mut changed = false;

    for line in &mut lines {
        let trimmed = line.trim();
        if trimmed.starts_with("name:") || trimmed.starts_with("name :") {
            let Some(colon_pos) = trimmed.find(':') else {
                continue;
            };
            // Build new line keeping spacing: "  name: " + new_name
            let prefix = &line[..line.find(trimmed).unwrap_or(0) + colon_pos + 1];
            *line = format!("{} \"{}\"", prefix, new_name);
            changed = true;
        }
    }

    if changed {
        fs::write(&info_path, lines.join("\n") + "\n")?;
    }
    Ok(())
}

pub fn rename_save(save_path: &Path, new_name: &str) -> Result<PathBuf, CoreError> {
    if !is_valid_save_name(new_name) {
        return Err(CoreError::Validation(
            "Save name must only contain letters, numbers, underscores, and hyphens".into(),
        ));
    }
    let parent = save_path
        .parent()
        .ok_or_else(|| CoreError::NotFound("parent directory".into()))?;
    let new_path = parent.join(new_name);

    if new_path.exists() {
        return Err(CoreError::Validation(format!(
            "Save '{}' already exists",
            new_name
        )));
    }

    // Update info.sii name field BEFORE renaming
    update_info_sii_name(save_path, new_name)?;

    fs::rename(save_path, &new_path)?;
    Ok(new_path)
}

pub fn clone_save(save_path: &Path, new_name: &str) -> Result<PathBuf, CoreError> {
    if !is_valid_save_name(new_name) {
        return Err(CoreError::Validation(
            "Save name must only contain letters, numbers, underscores, and hyphens".into(),
        ));
    }
    let parent = save_path
        .parent()
        .ok_or_else(|| CoreError::NotFound("parent directory".into()))?;
    let new_path = parent.join(new_name);

    if new_path.exists() {
        return Err(CoreError::Validation(format!(
            "Save '{}' already exists",
            new_name
        )));
    }

    copy_dir_all(save_path, &new_path)?;

    // Update info.sii name in the clone
    update_info_sii_name(&new_path, new_name)?;

    Ok(new_path)
}

pub fn delete_save(save_path: &Path) -> Result<(), CoreError> {
    let game_sii_path = save_path.join("game.sii");
    if game_sii_path.exists() {
        backup_file(&game_sii_path)?;
    }
    fs::remove_dir_all(save_path)?;
    Ok(())
}

pub fn delete_profile(profile_path: &Path) -> Result<(), CoreError> {
    let save_dir = profile_path.join("save");
    let profile_sii = profile_path.join("profile.sii");

    // Backup all game.sii files in saves before deleting
    if save_dir.exists() {
        if let Ok(entries) = fs::read_dir(&save_dir) {
            for entry in entries.flatten() {
                let game_sii = entry.path().join("game.sii");
                if game_sii.exists() {
                    let _ = backup_file(&game_sii);
                }
            }
        }
    }

    // Also backup profile.sii
    if profile_sii.exists() {
        let _ = backup_file(&profile_sii);
    }

    fs::remove_dir_all(profile_path)?;
    Ok(())
}

fn copy_dir_all(src: &Path, dst: &Path) -> Result<(), CoreError> {
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        let target = dst.join(entry.file_name());
        if ty.is_dir() {
            copy_dir_all(&entry.path(), &target)?;
        } else {
            fs::copy(entry.path(), &target)?;
        }
    }
    Ok(())
}
