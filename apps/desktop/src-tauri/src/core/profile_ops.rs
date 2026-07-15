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

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_is_valid_save_name_valid() {
        assert!(is_valid_save_name("autosave"));
        assert!(is_valid_save_name("quicksave_1"));
        assert!(is_valid_save_name("my-save-123"));
        assert!(is_valid_save_name("a"));
    }

    #[test]
    fn test_is_valid_save_name_invalid() {
        assert!(!is_valid_save_name(""));
        assert!(!is_valid_save_name("save name"));
        assert!(!is_valid_save_name("save/name"));
        assert!(!is_valid_save_name("save.name"));
        assert!(!is_valid_save_name("save\nname"));
    }

    #[test]
    fn test_is_valid_save_name_unicode() {
        // "salvar" is alphanumeric -> valid
        assert!(is_valid_save_name("salvar"));
    }

    #[test]
    fn test_update_info_sii_name_changes_name() {
        let dir = tempfile::tempdir().unwrap();
        let info_path = dir.path().join("info.sii");
        fs::write(
            &info_path,
            "SiiNunit\n{\n name: \"old_name\"\n version: 10\n}\n",
        )
        .unwrap();
        update_info_sii_name(dir.path(), "new_name").unwrap();
        let content = fs::read_to_string(&info_path).unwrap();
        assert!(content.contains("\"new_name\""));
        assert!(!content.contains("old_name"));
    }

    #[test]
    fn test_update_info_sii_name_no_name_field() {
        let dir = tempfile::tempdir().unwrap();
        let info_path = dir.path().join("info.sii");
        fs::write(&info_path, "SiiNunit\n{\n version: 10\n}\n").unwrap();
        update_info_sii_name(dir.path(), "new_name").unwrap();
        let content = fs::read_to_string(&info_path).unwrap();
        assert_eq!(content, "SiiNunit\n{\n version: 10\n}\n");
    }

    #[test]
    fn test_update_info_sii_name_file_not_found() {
        let dir = tempfile::tempdir().unwrap();
        // no info.sii created — should not error
        update_info_sii_name(dir.path(), "new_name").unwrap();
    }

    #[test]
    fn test_rename_save_invalid_name() {
        let dir = tempfile::tempdir().unwrap();
        let save_dir = dir.path().join("saves").join("valid_save");
        fs::create_dir_all(&save_dir).unwrap();
        let result = rename_save(&save_dir, "invalid name");
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), CoreError::Validation(_)));
    }

    #[test]
    fn test_rename_save_success() {
        let dir = tempfile::tempdir().unwrap();
        let saves_dir = dir.path().join("saves");
        let old_path = saves_dir.join("old_save");
        fs::create_dir_all(&old_path).unwrap();
        let info_path = old_path.join("info.sii");
        fs::write(&info_path, "SiiNunit\n{\n name: \"old_save\"\n}\n").unwrap();

        let new_path = rename_save(&old_path, "new_save").unwrap();
        assert_eq!(new_path, saves_dir.join("new_save"));
        assert!(new_path.exists());
        assert!(!old_path.exists());

        let content = fs::read_to_string(new_path.join("info.sii")).unwrap();
        assert!(content.contains("\"new_save\""));
    }

    #[test]
    fn test_rename_save_already_exists() {
        let dir = tempfile::tempdir().unwrap();
        let saves_dir = dir.path().join("saves");
        let old_path = saves_dir.join("save_a");
        let existing_path = saves_dir.join("save_b");
        fs::create_dir_all(&old_path).unwrap();
        fs::create_dir_all(&existing_path).unwrap();

        let result = rename_save(&old_path, "save_b");
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), CoreError::Validation(_)));
    }

    #[test]
    fn test_clone_save_success() {
        let dir = tempfile::tempdir().unwrap();
        let saves_dir = dir.path().join("saves");
        let src_path = saves_dir.join("original");
        fs::create_dir_all(&src_path).unwrap();
        fs::write(src_path.join("game.sii"), "content").unwrap();
        let info_path = src_path.join("info.sii");
        fs::write(&info_path, "SiiNunit\n{\n name: \"original\"\n}\n").unwrap();

        let cloned_path = clone_save(&src_path, "clone_name").unwrap();
        assert_eq!(cloned_path, saves_dir.join("clone_name"));
        assert!(cloned_path.exists());
        assert!(cloned_path.join("game.sii").exists());
        let content = fs::read_to_string(cloned_path.join("info.sii")).unwrap();
        assert!(content.contains("\"clone_name\""));
    }

    #[test]
    fn test_clone_save_invalid_name() {
        let dir = tempfile::tempdir().unwrap();
        let result = clone_save(&dir.path().join("src"), "invalid/name");
        assert!(result.is_err());
    }

    #[test]
    fn test_clone_save_already_exists() {
        let dir = tempfile::tempdir().unwrap();
        let saves_dir = dir.path().join("saves");
        let src = saves_dir.join("src");
        let dst = saves_dir.join("dst");
        fs::create_dir_all(&src).unwrap();
        fs::create_dir_all(&dst).unwrap();
        let result = clone_save(&src, "dst");
        assert!(result.is_err());
    }

    #[test]
    fn test_delete_save_creates_backup_and_removes() {
        let dir = tempfile::tempdir().unwrap();
        let save_dir = dir.path().join("save");
        fs::create_dir_all(&save_dir).unwrap();
        fs::write(save_dir.join("game.sii"), "data").unwrap();
        fs::write(save_dir.join("info.sii"), "info").unwrap();

        delete_save(&save_dir).unwrap();
        assert!(!save_dir.exists());

        // backup should exist inside save's parent
        let backup_dir = dir.path().join("save");
        assert!(!backup_dir.exists());
    }

    #[test]
    fn test_delete_profile_removes_dir() {
        let dir = tempfile::tempdir().unwrap();
        let profile_dir = dir.path().join("profile");
        fs::create_dir_all(&profile_dir).unwrap();
        fs::write(profile_dir.join("profile.sii"), "data").unwrap();

        let saves_dir = profile_dir.join("save");
        fs::create_dir_all(&saves_dir).unwrap();
        fs::write(saves_dir.join("game.sii"), "data").unwrap();

        delete_profile(&profile_dir).unwrap();
        assert!(!profile_dir.exists());
    }
}
