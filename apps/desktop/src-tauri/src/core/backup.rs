use std::fs;
use std::path::{Path, PathBuf};

use chrono::Local;

use crate::core::error::CoreError;

pub fn backup_file(source: &Path) -> Result<PathBuf, CoreError> {
    let source_dir = source
        .parent()
        .ok_or_else(|| CoreError::NotFound(format!("Parent of {:?}", source)))?;

    let filename = source
        .file_name()
        .ok_or_else(|| CoreError::NotFound(format!("Filename from {:?}", source)))?;

    let timestamp = Local::now().format("%d-%m-%Y_%H-%M-%S").to_string();
    let backup_dir = source_dir.join("backup").join(&timestamp);

    fs::create_dir_all(&backup_dir)?;

    let backup_path = backup_dir.join(filename);
    fs::copy(source, &backup_path)?;

    Ok(backup_path)
}

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_backup_file_creates_backup() {
        let dir = tempfile::tempdir().unwrap();
        let src = dir.path().join("game.sii");
        fs::write(&src, "some save data").unwrap();

        let backup_path = backup_file(&src).unwrap();
        assert!(backup_path.exists());

        let content = fs::read_to_string(&backup_path).unwrap();
        assert_eq!(content, "some save data");
    }

    #[test]
    fn test_backup_file_returns_different_path() {
        let dir = tempfile::tempdir().unwrap();
        let src = dir.path().join("game.sii");
        fs::write(&src, "data").unwrap();

        let backup_path = backup_file(&src).unwrap();
        assert_ne!(backup_path, src);
        assert!(backup_path.to_string_lossy().contains("backup"));
    }

    #[test]
    fn test_backup_file_source_not_exists() {
        let dir = tempfile::tempdir().unwrap();
        let src = dir.path().join("nonexistent.sii");
        let result = backup_file(&src);
        assert!(result.is_err());
    }

    #[test]
    fn test_backup_file_nested_backup_dir() {
        let dir = tempfile::tempdir().unwrap();
        let src = dir.path().join("game.sii");
        fs::write(&src, "data").unwrap();

        let backup_path = backup_file(&src).unwrap();
        // Should be at <dir>/backup/<timestamp>/game.sii
        assert_eq!(backup_path.file_name().unwrap(), "game.sii");
        let parent = backup_path.parent().unwrap();
        assert!(parent.to_string_lossy().contains("backup"));
    }
}
