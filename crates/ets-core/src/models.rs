use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub name: String,
    pub save_games: Vec<SaveGame>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SaveGame {
    pub name: String,
    pub path: String,
    pub level: u32,
    pub money: f64,
    pub distance_km: f64,
    pub current_truck: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameConfig {
    pub graphics: GraphicsConfig,
    pub audio: AudioConfig,
    pub controls: ControlsConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphicsConfig {
    pub resolution: (u32, u32),
    pub vsync: bool,
    pub scaling: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioConfig {
    pub master_volume: f32,
    pub music_volume: f32,
    pub sfx_volume: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControlsConfig {
    pub steering_sensitivity: f64,
    pub brake_sensitivity: f64,
    pub throttle_sensitivity: f64,
}
