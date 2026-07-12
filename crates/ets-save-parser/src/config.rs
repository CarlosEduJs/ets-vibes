use ets_core::config_category::{categorize, ConfigCategory};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigEntry {
    pub prefix: String,
    pub key: String,
    pub value: String,
    pub category: ConfigCategory,
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
            entries.push(ConfigEntry {
                prefix,
                key,
                value,
                category,
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
