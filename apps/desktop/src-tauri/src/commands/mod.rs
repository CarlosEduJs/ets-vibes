pub mod config;
pub mod helpers;
pub mod manage;
pub mod profile;
pub mod save;

use serde::Serialize;

use crate::core::models::TruckInfo;

#[derive(Serialize)]
pub struct SaveData {
    pub money: Option<i64>,
    pub xp: Option<i64>,
    pub level: Option<u32>,
    pub trucks_count: Option<u32>,
    pub drivers_count: Option<u32>,
    pub hq_city: Option<String>,
    pub trucks: Vec<TruckInfo>,
    pub money_account: Option<String>,
    pub experience_points: Option<String>,
    pub was_compressed: bool,
    pub game_time: Option<i64>,
    pub total_distance_km: Option<f64>,
    pub total_fuel_litres: Option<f64>,
    pub visited_cities_count: Option<u32>,
    pub achieved_feats: Option<u32>,
    pub new_game: Option<bool>,
    pub discovered_items: Option<u32>,
    pub save_version: Option<u32>,
    pub file_time: Option<i64>,
    pub mods: Vec<String>,
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
    pub active_mods: Vec<String>,
    pub cached_experience: Option<i64>,
    pub cached_distance: Option<f64>,
}

#[derive(Serialize)]
pub struct SaveInfo {
    pub profile_path: String,
    pub save_name: String,
    pub path: String,
    pub game_sii_path: String,
}
