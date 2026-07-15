use std::path::Path;

use crate::save_parser::compression::decompress_save;
use crate::save_parser::sii::SiiDocument;

pub fn calc_level(exp: i64) -> u32 {
    let exp = exp as f64;
    ((1.0 + (1.0 + 8.0 * exp / 100.0).sqrt()) / 2.0).floor() as u32
}

pub fn save_file_from_game_sii(
    game_sii_path: &str,
) -> Result<crate::core::profile::SaveFile, String> {
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
    Ok(crate::core::profile::SaveFile::new(profile_path, save_name))
}

pub fn read_profile_sii(profile_path: &Path) -> (Vec<String>, Option<i64>, Option<f64>) {
    let sii_path = profile_path.join("profile.sii");
    let data = match std::fs::read(&sii_path) {
        Ok(d) => d,
        Err(_) => return (vec![], None, None),
    };
    let content = match decompress_save(&data) {
        Ok(c) => c,
        Err(_) => return (vec![], None, None),
    };
    let doc = SiiDocument::new(content);

    let mut mods: Vec<String> = vec![];
    if let Some(count_str) = doc.get_property("active_mods") {
        if let Ok(count) = count_str.parse::<usize>() {
            for i in 0..count {
                let key = format!("active_mods[{}]", i);
                if let Some(val) = doc.get_property(&key) {
                    let clean = val.trim_matches('"').to_string();
                    mods.push(clean);
                }
            }
        }
    }

    let cached_xp = doc
        .get_property("cached_experience")
        .and_then(|s| s.parse::<i64>().ok());

    let cached_dist = doc
        .get_property("cached_distance")
        .and_then(|s| s.parse::<f64>().ok());

    (mods, cached_xp, cached_dist)
}

pub fn read_info_sii(save_path: &Path) -> (Option<u32>, Option<i64>, Vec<String>) {
    let info_path = save_path.join("info.sii");
    let data = match std::fs::read(&info_path) {
        Ok(d) => d,
        Err(_) => return (None, None, vec![]),
    };
    let content = match decompress_save(&data) {
        Ok(c) => c,
        Err(_) => return (None, None, vec![]),
    };
    let doc = SiiDocument::new(content);

    let version = doc
        .get_property("version")
        .and_then(|s| s.parse::<u32>().ok());

    let file_time = doc
        .get_property("file_time")
        .and_then(|s| s.parse::<i64>().ok());

    let mut deps: Vec<String> = vec![];
    if let Some(count_str) = doc.get_property("dependencies") {
        if let Ok(count) = count_str.parse::<usize>() {
            for i in 0..count {
                let key = format!("dependencies[{}]", i);
                if let Some(val) = doc.get_property(&key) {
                    let clean = val.trim_matches('"').to_string();
                    deps.push(clean);
                }
            }
        }
    }

    (version, file_time, deps)
}
