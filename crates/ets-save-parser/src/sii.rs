use std::path::Path;

use ets_core::SaveGame;

use crate::error::ParseError;

/// Parses a .sii save file and returns structured data.
pub fn parse_save(path: &Path) -> Result<SaveGame, ParseError> {
    let _content = std::fs::read_to_string(path)?;
    // TODO: implement actual .sii parsing
    todo!("SII parser not yet implemented")
}
