use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TruckInfo {
    pub index: u32,
    pub license_plate: Option<String>,
    pub odometer_km: Option<f64>,
    pub fuel_relative: Option<f64>,
    pub engine_wear: Option<f64>,
    pub transmission_wear: Option<f64>,
    pub cabin_wear: Option<f64>,
    pub chassis_wear: Option<f64>,
    /// Average wear of all wheels (0.0-1.0).
    pub wheels_wear: Option<f64>,
    /// Brand id taken from the truck's model accessory (e.g. `renault`).
    pub brand: Option<String>,
    /// Model id (e.g. `t`, `s_2016`).
    pub model: Option<String>,
    /// True when the truck is one of the player's own vehicles, false for hired drivers' trucks.
    pub is_player: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileData {
    pub name: String,
    pub display_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SaveSummary {
    pub name: String,
    pub path: String,
    pub money: Option<i64>,
    pub xp: Option<i64>,
    pub level: Option<u32>,
    pub distance_km: Option<f64>,
    pub current_truck: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameSettings {
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
