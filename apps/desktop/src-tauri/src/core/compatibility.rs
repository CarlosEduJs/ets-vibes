use serde::{Deserialize, Serialize};

/// The app version — bump this on release.
pub const APP_VERSION: &str = env!("CARGO_PKG_VERSION");

/// The latest ETS2 version this app was tested against. Always update this when a new ETS2 version is released and tested.
pub const TESTED_GAME_VERSION: GameVersion = GameVersion::new(1, 60, 1);

/// Minimum supported game version.
pub const MIN_GAME_VERSION: GameVersion = GameVersion::new(1, 53, 0);

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct GameVersion {
    pub major: u16,
    pub minor: u16,
    pub patch: u16,
}

impl GameVersion {
    pub const fn new(major: u16, minor: u16, patch: u16) -> Self {
        Self {
            major,
            minor,
            patch,
        }
    }

    /// Parse from a version string like `"1.60.1.7"`.
    /// ETS2 uses 4-part versions; we only care about the first 3.
    pub fn parse(s: &str) -> Option<Self> {
        let s = s.trim().trim_matches('"');
        let parts: Vec<&str> = s.split('.').collect();
        if parts.len() < 3 {
            return None;
        }
        Some(Self {
            major: parts[0].parse().ok()?,
            minor: parts[1].parse().ok()?,
            patch: parts[2].parse().ok()?,
        })
    }

    pub fn to_display(&self) -> String {
        format!("{}.{}.{}", self.major, self.minor, self.patch)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CompatibilityStatus {
    /// Version exactly matches tested range.
    Supported,
    /// Version is newer than tested — should work but not verified.
    Untested { detected_version: String },
    /// Version is too old — some features may be missing.
    Deprecated {
        detected_version: String,
        min_version: String,
    },
    /// Could not determine version.
    Unknown,
}

pub fn check_compatibility(game_version_str: &str) -> CompatibilityStatus {
    let detected = match GameVersion::parse(game_version_str) {
        Some(v) => v,
        None => return CompatibilityStatus::Unknown,
    };

    if detected < MIN_GAME_VERSION {
        return CompatibilityStatus::Deprecated {
            detected_version: detected.to_display(),
            min_version: MIN_GAME_VERSION.to_display(),
        };
    }

    if detected.major == TESTED_GAME_VERSION.major && detected.minor == TESTED_GAME_VERSION.minor {
        return CompatibilityStatus::Supported;
    }

    CompatibilityStatus::Untested {
        detected_version: detected.to_display(),
    }
}

pub fn find_game_version_in_config(text: &str) -> Option<String> {
    for line in text.lines() {
        let line = line.trim();
        if line.starts_with('#') || line.is_empty() {
            continue;
        }
        let mut parts = line.splitn(3, ' ');
        let _prefix = parts.next()?;
        let key = parts.next()?;
        if key == "g_game_version" {
            let value = parts.next()?.trim_matches('"');
            return Some(value.to_string());
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_full() {
        let v = GameVersion::parse("1.60.1.7").unwrap();
        assert_eq!(v, GameVersion::new(1, 60, 1));
    }

    #[test]
    fn test_parse_three_parts() {
        let v = GameVersion::parse("1.60.0").unwrap();
        assert_eq!(v, GameVersion::new(1, 60, 0));
    }

    #[test]
    fn test_parse_quoted() {
        let v = GameVersion::parse("\"1.60.1.7\"").unwrap();
        assert_eq!(v, GameVersion::new(1, 60, 1));
    }

    #[test]
    fn test_parse_invalid() {
        assert!(GameVersion::parse("abc").is_none());
        assert!(GameVersion::parse("1").is_none());
    }

    #[test]
    fn test_check_supported() {
        let status = check_compatibility("1.60.1.7");
        assert_eq!(status, CompatibilityStatus::Supported);
    }

    #[test]
    fn test_check_untested_newer() {
        let status = check_compatibility("1.61.0.0");
        assert_eq!(
            status,
            CompatibilityStatus::Untested {
                detected_version: "1.61.0".to_string()
            }
        );
    }

    #[test]
    fn test_check_deprecated_old() {
        let status = check_compatibility("1.52.0.0");
        assert_eq!(
            status,
            CompatibilityStatus::Deprecated {
                detected_version: "1.52.0".to_string(),
                min_version: "1.53.0".to_string()
            }
        );
    }

    #[test]
    fn test_check_unknown() {
        let status = check_compatibility("garbage");
        assert_eq!(status, CompatibilityStatus::Unknown);
    }

    #[test]
    fn test_find_version_in_config() {
        let text = "uset g_game_version \"1.60.1.7\"\nuset g_traffic \"1\"\n";
        assert_eq!(find_game_version_in_config(text), Some("1.60.1.7".into()));
    }

    #[test]
    fn test_find_version_no_match() {
        let text = "uset g_traffic \"1\"\n";
        assert_eq!(find_game_version_in_config(text), None);
    }

    #[test]
    fn test_to_display() {
        let v = GameVersion::new(1, 60, 1);
        assert_eq!(v.to_display(), "1.60.1");
    }
}
