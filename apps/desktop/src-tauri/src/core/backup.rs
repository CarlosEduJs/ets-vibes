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
