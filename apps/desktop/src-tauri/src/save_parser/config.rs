use crate::core::config_category::{categorize, ConfigCategory};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConfigValueType {
    Int,
    Float,
    Bool,
    String,
}

impl ConfigValueType {
    pub fn infer_from_value(value: &str) -> Self {
        if value.parse::<i64>().is_ok() {
            if matches!(value, "0" | "1") {
                // Could be bool, but int is more common - check value
                // 0 and 1 are valid as both, default to Int
                Self::Int
            } else {
                Self::Int
            }
        } else if value.parse::<f64>().is_ok() {
            Self::Float
        } else if matches!(
            value,
            "true" | "false" | "True" | "False" | "TRUE" | "FALSE"
        ) {
            Self::Bool
        } else {
            Self::String
        }
    }

    pub fn validate(&self, value: &str) -> Result<(), String> {
        match self {
            Self::Int => match value.parse::<i64>() {
                Ok(_) => Ok(()),
                Err(_) => Err(format!("Expected integer, got '{}'", value)),
            },
            Self::Float => match value.parse::<f64>() {
                Ok(_) => Ok(()),
                Err(_) => Err(format!("Expected number, got '{}'", value)),
            },
            Self::Bool => {
                if matches!(
                    value,
                    "0" | "1" | "true" | "false" | "True" | "False" | "TRUE" | "FALSE"
                ) {
                    Ok(())
                } else {
                    Err(format!(
                        "Expected boolean (0/1/true/false), got '{}'",
                        value
                    ))
                }
            }
            Self::String => Ok(()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigEntry {
    pub prefix: String,
    pub key: String,
    pub value: String,
    pub category: ConfigCategory,
    #[serde(rename = "value_type")]
    pub val_type: ConfigValueType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigDocument {
    pub entries: Vec<ConfigEntry>,
}

impl ConfigDocument {
    pub fn parse(text: &str) -> Self {
        let mut entries = Vec::new();

        for line in text.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }

            let mut parts = line.splitn(3, ' ');
            let prefix = match parts.next() {
                Some(p) => p.to_string(),
                None => continue,
            };
            let key = match parts.next() {
                Some(k) => k.to_string(),
                None => continue,
            };
            let value = parts.next().unwrap_or("").trim_matches('"').to_string();

            let category = categorize(&key);
            let val_type = ConfigValueType::infer_from_value(&value);
            entries.push(ConfigEntry {
                prefix,
                key,
                value,
                category,
                val_type,
            });
        }

        Self { entries }
    }

    pub fn get(&self, key: &str) -> Option<&ConfigEntry> {
        self.entries.iter().find(|e| e.key == key)
    }

    pub fn set(&mut self, key: &str, value: &str) {
        if let Some(entry) = self.entries.iter_mut().find(|e| e.key == key) {
            entry.value = value.to_string();
        }
    }

    pub fn get_by_category(&self, category: ConfigCategory) -> Vec<&ConfigEntry> {
        self.entries
            .iter()
            .filter(|e| e.category == category)
            .collect()
    }

    pub fn search(&self, query: &str) -> Vec<&ConfigEntry> {
        let q = query.to_lowercase();
        self.entries
            .iter()
            .filter(|e| e.key.to_lowercase().contains(&q) || e.value.to_lowercase().contains(&q))
            .collect()
    }

    pub fn apply_preset(&mut self, changes: &[(&str, &str)]) {
        for (key, value) in changes {
            self.set(key, value);
        }
    }
}

impl std::fmt::Display for ConfigDocument {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        for entry in &self.entries {
            writeln!(f, "{} {} \"{}\"", entry.prefix, entry.key, entry.value)?;
        }
        Ok(())
    }
}

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests {
    use super::*;

    // --- ConfigValueType::infer_from_value ---

    #[test]
    fn test_infer_int() {
        assert_eq!(
            ConfigValueType::infer_from_value("42"),
            ConfigValueType::Int
        );
        assert_eq!(
            ConfigValueType::infer_from_value("-1"),
            ConfigValueType::Int
        );
        assert_eq!(ConfigValueType::infer_from_value("0"), ConfigValueType::Int);
    }

    #[test]
    fn test_infer_float() {
        assert_eq!(
            ConfigValueType::infer_from_value("3.14"),
            ConfigValueType::Float
        );
        assert_eq!(
            ConfigValueType::infer_from_value("-0.5"),
            ConfigValueType::Float
        );
    }

    #[test]
    fn test_infer_bool() {
        assert_eq!(
            ConfigValueType::infer_from_value("true"),
            ConfigValueType::Bool
        );
        assert_eq!(
            ConfigValueType::infer_from_value("false"),
            ConfigValueType::Bool
        );
        assert_eq!(
            ConfigValueType::infer_from_value("True"),
            ConfigValueType::Bool
        );
        assert_eq!(
            ConfigValueType::infer_from_value("FALSE"),
            ConfigValueType::Bool
        );
    }

    #[test]
    fn test_infer_string() {
        assert_eq!(
            ConfigValueType::infer_from_value("hello"),
            ConfigValueType::String
        );
        assert_eq!(
            ConfigValueType::infer_from_value(""),
            ConfigValueType::String
        );
        assert_eq!(
            ConfigValueType::infer_from_value("r_scale"),
            ConfigValueType::String
        );
    }

    // --- ConfigValueType::validate ---

    #[test]
    fn test_validate_int_ok() {
        assert!(ConfigValueType::Int.validate("42").is_ok());
        assert!(ConfigValueType::Int.validate("-1").is_ok());
        assert!(ConfigValueType::Int.validate("0").is_ok());
    }

    #[test]
    fn test_validate_int_err() {
        assert!(ConfigValueType::Int.validate("3.14").is_err());
        assert!(ConfigValueType::Int.validate("abc").is_err());
    }

    #[test]
    fn test_validate_float_ok() {
        assert!(ConfigValueType::Float.validate("3.14").is_ok());
        assert!(ConfigValueType::Float.validate("-1.5").is_ok());
    }

    #[test]
    fn test_validate_float_err() {
        assert!(ConfigValueType::Float.validate("abc").is_err());
    }

    #[test]
    fn test_validate_bool_ok() {
        assert!(ConfigValueType::Bool.validate("true").is_ok());
        assert!(ConfigValueType::Bool.validate("false").is_ok());
        assert!(ConfigValueType::Bool.validate("0").is_ok());
        assert!(ConfigValueType::Bool.validate("1").is_ok());
        assert!(ConfigValueType::Bool.validate("True").is_ok());
        assert!(ConfigValueType::Bool.validate("FALSE").is_ok());
    }

    #[test]
    fn test_validate_bool_err() {
        assert!(ConfigValueType::Bool.validate("yes").is_err());
        assert!(ConfigValueType::Bool.validate("2").is_err());
    }

    #[test]
    fn test_validate_string() {
        assert!(ConfigValueType::String.validate("anything").is_ok());
        assert!(ConfigValueType::String.validate("").is_ok());
    }

    // --- ConfigDocument::parse ---

    #[test]
    fn test_parse_simple() {
        let text = "uset r_scale \"1.0\"\nuset g_traffic \"1\"\n";
        let doc = ConfigDocument::parse(text);
        assert_eq!(doc.entries.len(), 2);
    }

    #[test]
    fn test_parse_skips_empty_and_comments() {
        let text = "# comment\nuset r_scale \"1.0\"\n\nuset g_traffic \"1\"\n";
        let doc = ConfigDocument::parse(text);
        assert_eq!(doc.entries.len(), 2);
    }

    #[test]
    fn test_parse_categorizes() {
        let text = "uset r_scale \"1.0\"\nuset s_volume \"0.5\"\n";
        let doc = ConfigDocument::parse(text);
        assert_eq!(doc.entries[0].category, ConfigCategory::Graphics);
        assert_eq!(doc.entries[1].category, ConfigCategory::Sound);
    }

    #[test]
    fn test_parse_infers_type() {
        let text = "uset r_scale \"1\"\nuset s_volume \"0.5\"\nuset g_console \"true\"\nuset i_joy \"name\"\n";
        let doc = ConfigDocument::parse(text);
        assert_eq!(doc.entries[0].val_type, ConfigValueType::Int);
        assert_eq!(doc.entries[1].val_type, ConfigValueType::Float);
        assert_eq!(doc.entries[2].val_type, ConfigValueType::Bool);
        assert_eq!(doc.entries[3].val_type, ConfigValueType::String);
    }

    // --- ConfigDocument::get / set ---

    #[test]
    fn test_get_existing() {
        let text = "uset r_scale \"1.0\"\nuset g_traffic \"1\"\n";
        let doc = ConfigDocument::parse(text);
        let entry = doc.get("r_scale").unwrap();
        assert_eq!(entry.value, "1.0");
    }

    #[test]
    fn test_get_missing() {
        let text = "uset r_scale \"1.0\"\n";
        let doc = ConfigDocument::parse(text);
        assert!(doc.get("nonexistent").is_none());
    }

    #[test]
    fn test_set_updates_value() {
        let text = "uset r_scale \"1.0\"\n";
        let mut doc = ConfigDocument::parse(text);
        doc.set("r_scale", "2.0");
        assert_eq!(doc.get("r_scale").unwrap().value, "2.0");
    }

    #[test]
    fn test_set_new_key_does_nothing() {
        let text = "uset r_scale \"1.0\"\n";
        let mut doc = ConfigDocument::parse(text);
        doc.set("nonexistent", "val");
        assert!(doc.get("nonexistent").is_none());
    }

    // --- ConfigDocument::get_by_category ---

    #[test]
    fn test_get_by_category() {
        let text = "uset r_scale \"1.0\"\nuset s_volume \"0.5\"\nuset r_fullscreen \"1\"\n";
        let doc = ConfigDocument::parse(text);
        let graphics = doc.get_by_category(ConfigCategory::Graphics);
        assert_eq!(graphics.len(), 2);
        let sound = doc.get_by_category(ConfigCategory::Sound);
        assert_eq!(sound.len(), 1);
    }

    #[test]
    fn test_get_by_category_none() {
        let text = "uset r_scale \"1.0\"\n";
        let doc = ConfigDocument::parse(text);
        let sound = doc.get_by_category(ConfigCategory::Sound);
        assert!(sound.is_empty());
    }

    // --- ConfigDocument::search ---

    #[test]
    fn test_search_by_key() {
        let text = "uset r_scale \"1.0\"\nuset g_traffic \"1\"\n";
        let doc = ConfigDocument::parse(text);
        let results = doc.search("scale");
        assert_eq!(results.len(), 1);
    }

    #[test]
    fn test_search_by_value() {
        let text = "uset r_scale \"1.0\"\nuset g_traffic \"0\"\n";
        let doc = ConfigDocument::parse(text);
        // "0" matches "1.0" (contains '0') and "0"
        let results = doc.search("0");
        assert_eq!(results.len(), 2);
    }

    #[test]
    fn test_search_case_insensitive() {
        let text = "uset r_Scale \"1.0\"\n";
        let doc = ConfigDocument::parse(text);
        let results = doc.search("scale");
        assert_eq!(results.len(), 1);
    }

    #[test]
    fn test_search_no_match() {
        let text = "uset r_scale \"1.0\"\n";
        let doc = ConfigDocument::parse(text);
        let results = doc.search("zzzzz");
        assert!(results.is_empty());
    }

    // --- ConfigDocument::apply_preset ---

    #[test]
    fn test_apply_preset() {
        let text = "uset r_scale \"1.0\"\nuset g_traffic \"1\"\n";
        let mut doc = ConfigDocument::parse(text);
        doc.apply_preset(&[("r_scale", "2.0"), ("g_traffic", "0")]);
        assert_eq!(doc.get("r_scale").unwrap().value, "2.0");
        assert_eq!(doc.get("g_traffic").unwrap().value, "0");
    }

    // --- ConfigDocument::Display ---

    #[test]
    fn test_display_format() {
        let text = "uset r_scale \"1.0\"\n";
        let doc = ConfigDocument::parse(text);
        let output = doc.to_string();
        assert_eq!(output, "uset r_scale \"1.0\"\n");
    }
}
