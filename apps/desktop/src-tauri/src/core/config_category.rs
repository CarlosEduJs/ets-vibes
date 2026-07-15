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

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests {
    use super::*;

    #[test]
    fn test_graphics_r() {
        assert_eq!(categorize("r_scale"), ConfigCategory::Graphics);
        assert_eq!(categorize("r_fullscreen"), ConfigCategory::Graphics);
    }

    #[test]
    fn test_multimonitor() {
        assert_eq!(categorize("r_multimon_mode"), ConfigCategory::MultiMonitor);
        assert_eq!(
            categorize("r_multimon_center_width"),
            ConfigCategory::MultiMonitor
        );
    }

    #[test]
    fn test_vr() {
        assert_eq!(categorize("r_manual_stereo_buffer"), ConfigCategory::Vr);
        assert_eq!(categorize("r_hmd_optical_dist"), ConfigCategory::Vr);
        assert_eq!(categorize("r_ipd_scale"), ConfigCategory::Vr);
    }

    #[test]
    fn test_sound() {
        assert_eq!(categorize("s_mix_rate"), ConfigCategory::Sound);
        assert_eq!(categorize("s_volume"), ConfigCategory::Sound);
    }

    #[test]
    fn test_input() {
        assert_eq!(categorize("i_joy_steering"), ConfigCategory::Input);
        assert_eq!(categorize("i_fft_setup"), ConfigCategory::Input);
    }

    #[test]
    fn test_framerate() {
        assert_eq!(categorize("t_limiter"), ConfigCategory::Framerate);
        assert_eq!(categorize("t_averaging_window"), ConfigCategory::Framerate);
    }

    #[test]
    fn test_ui() {
        assert_eq!(categorize("ui_scale"), ConfigCategory::Ui);
        assert_eq!(categorize("ui_tooltip_delay"), ConfigCategory::Ui);
    }

    #[test]
    fn test_developer_v() {
        assert_eq!(categorize("v_sync"), ConfigCategory::Developer);
        assert_eq!(categorize("v_fps"), ConfigCategory::Developer);
    }

    #[test]
    fn test_radio() {
        assert_eq!(categorize("g_radio_truck"), ConfigCategory::Radio);
        assert_eq!(categorize("g_radio_music_volume"), ConfigCategory::Radio);
    }

    #[test]
    fn test_steam() {
        assert_eq!(categorize("g_steam_screenshots"), ConfigCategory::Steam);
        assert_eq!(
            categorize("g_online_loading_screens"),
            ConfigCategory::Steam
        );
        assert_eq!(categorize("g_news"), ConfigCategory::Steam);
    }

    #[test]
    fn test_dev_g_console() {
        assert_eq!(categorize("g_developer"), ConfigCategory::Developer);
        assert_eq!(categorize("g_console"), ConfigCategory::Developer);
        assert_eq!(categorize("g_fps"), ConfigCategory::Developer);
        assert_eq!(categorize("g_minicon"), ConfigCategory::Developer);
        assert_eq!(categorize("g_debug_commands"), ConfigCategory::Developer);
    }

    #[test]
    fn test_graphics_advanced() {
        assert_eq!(categorize("g_bloom"), ConfigCategory::GraphicsAdvanced);
        assert_eq!(
            categorize("g_gfx_quality"),
            ConfigCategory::GraphicsAdvanced
        );
        assert_eq!(
            categorize("g_grass_density"),
            ConfigCategory::GraphicsAdvanced
        );
        assert_eq!(categorize("g_veg_detail"), ConfigCategory::GraphicsAdvanced);
        assert_eq!(
            categorize("g_reflection_quality"),
            ConfigCategory::GraphicsAdvanced
        );
        assert_eq!(
            categorize("g_water_reflect"),
            ConfigCategory::GraphicsAdvanced
        );
        assert_eq!(
            categorize("g_rain_density"),
            ConfigCategory::GraphicsAdvanced
        );
    }

    #[test]
    fn test_gameplay() {
        assert_eq!(categorize("g_traffic"), ConfigCategory::Gameplay);
        assert_eq!(categorize("g_simple_parking"), ConfigCategory::Gameplay);
    }

    #[test]
    fn test_misc() {
        assert_eq!(categorize("something_unknown"), ConfigCategory::Misc);
        assert_eq!(categorize(""), ConfigCategory::Misc);
        assert_eq!(categorize("uset"), ConfigCategory::Misc);
    }

    #[test]
    fn test_g_radio_does_not_match_gameplay() {
        assert_eq!(categorize("g_radio_truck"), ConfigCategory::Radio);
    }

    #[test]
    fn test_g_developer_does_not_match_gameplay() {
        assert_eq!(categorize("g_developer"), ConfigCategory::Developer);
    }

    #[test]
    fn test_all_categories_contains_all() {
        let cats = all_categories();
        assert!(cats.contains(&ConfigCategory::Graphics));
        assert!(cats.contains(&ConfigCategory::MultiMonitor));
        assert!(cats.contains(&ConfigCategory::Vr));
        assert!(cats.contains(&ConfigCategory::Sound));
        assert!(cats.contains(&ConfigCategory::Input));
        assert!(cats.contains(&ConfigCategory::Gameplay));
        assert!(cats.contains(&ConfigCategory::GraphicsAdvanced));
        assert!(cats.contains(&ConfigCategory::Developer));
        assert!(cats.contains(&ConfigCategory::Steam));
        assert!(cats.contains(&ConfigCategory::Radio));
        assert!(cats.contains(&ConfigCategory::Framerate));
        assert!(cats.contains(&ConfigCategory::Ui));
        assert!(cats.contains(&ConfigCategory::Misc));
        assert_eq!(cats.len(), 13);
    }

    #[test]
    fn test_label_returns_non_empty() {
        for cat in all_categories() {
            assert!(!cat.label().is_empty());
        }
    }
}
