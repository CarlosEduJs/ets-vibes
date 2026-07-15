use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConfigCategory {
    Graphics,
    MultiMonitor,
    Vr,
    Sound,
    Input,
    Gameplay,
    GraphicsAdvanced,
    Developer,
    Steam,
    Radio,
    Framerate,
    Ui,
    Misc,
}

impl ConfigCategory {
    pub fn label(&self) -> &'static str {
        match self {
            Self::Graphics => "Graphics",
            Self::MultiMonitor => "Multi Monitor",
            Self::Vr => "VR",
            Self::Sound => "Sound",
            Self::Input => "Input",
            Self::Gameplay => "Gameplay",
            Self::GraphicsAdvanced => "Graphics Advanced",
            Self::Developer => "Developer",
            Self::Steam => "Steam",
            Self::Radio => "Radio",
            Self::Framerate => "Framerate",
            Self::Ui => "UI",
            Self::Misc => "Misc",
        }
    }
}

pub fn categorize(key: &str) -> ConfigCategory {
    if key.starts_with("r_multimon_") {
        return ConfigCategory::MultiMonitor;
    }
    if key.starts_with("r_manual_stereo_") || key.starts_with("r_hmd_") || key == "r_ipd_scale" {
        return ConfigCategory::Vr;
    }
    if key.starts_with("s_") {
        return ConfigCategory::Sound;
    }
    if key.starts_with("i_") {
        return ConfigCategory::Input;
    }
    if key.starts_with("t_") {
        return ConfigCategory::Framerate;
    }
    if key.starts_with("ui_") {
        return ConfigCategory::Ui;
    }
    if key.starts_with("v_") {
        return ConfigCategory::Developer;
    }
    if key.starts_with("g_radio_") {
        return ConfigCategory::Radio;
    }
    if key.starts_with("g_steam_") || key == "g_online_loading_screens" || key == "g_news" {
        return ConfigCategory::Steam;
    }
    if key.starts_with("g_developer")
        || key.starts_with("g_console")
        || key == "g_fps"
        || key == "g_minicon"
        || key.starts_with("g_debug_")
    {
        return ConfigCategory::Developer;
    }
    if key.starts_with("g_bloom")
        || key.starts_with("g_gfx_")
        || key.starts_with("g_grass")
        || key.starts_with("g_veg_")
        || key.starts_with("g_reflection")
        || key.starts_with("g_water_reflect")
        || key.starts_with("g_rain_")
    {
        return ConfigCategory::GraphicsAdvanced;
    }
    if key.starts_with("g_") {
        return ConfigCategory::Gameplay;
    }
    if key.starts_with("r_") {
        return ConfigCategory::Graphics;
    }

    ConfigCategory::Misc
}

pub fn all_categories() -> Vec<ConfigCategory> {
    vec![
        ConfigCategory::Graphics,
        ConfigCategory::MultiMonitor,
        ConfigCategory::Vr,
        ConfigCategory::Sound,
        ConfigCategory::Input,
        ConfigCategory::Gameplay,
        ConfigCategory::GraphicsAdvanced,
        ConfigCategory::Developer,
        ConfigCategory::Steam,
        ConfigCategory::Radio,
        ConfigCategory::Framerate,
        ConfigCategory::Ui,
        ConfigCategory::Misc,
    ]
}
