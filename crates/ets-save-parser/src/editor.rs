use ets_core::SaveFile;

use crate::compression::{compress_save, decompress_save};
use crate::error::SaveError;
use crate::sii::SiiDocument;

pub struct SaveEditor {
    save_file: SaveFile,
    document: Option<SiiDocument>,
    was_compressed: bool,
}

impl SaveEditor {
    pub fn new(save_file: SaveFile) -> Self {
        Self {
            save_file,
            document: None,
            was_compressed: false,
        }
    }

    pub fn load(&mut self) -> Result<(), SaveError> {
        let data = std::fs::read(&self.save_file.game_sii_path)?;
        self.was_compressed = data.len() >= 4 && &data[..4] == b"ScsC";
        let content = decompress_save(&data)?;
        self.document = Some(SiiDocument::new(content));
        Ok(())
    }

    fn document(&self) -> Result<&SiiDocument, SaveError> {
        self.document
            .as_ref()
            .ok_or_else(|| SaveError::Compression("Document not loaded. Call load() first.".into()))
    }

    fn document_mut(&mut self) -> Result<&mut SiiDocument, SaveError> {
        self.document
            .as_mut()
            .ok_or_else(|| SaveError::Compression("Document not loaded. Call load() first.".into()))
    }

    pub fn get_property(&self, name: &str) -> Option<&str> {
        self.document.as_ref().and_then(|d| d.get_property(name))
    }

    pub fn edit_money(&mut self, amount: i64) -> Result<bool, SaveError> {
        self.document_mut()?
            .set_property("money_account", &amount.to_string())
    }

    pub fn edit_xp(&mut self, xp: i64) -> Result<bool, SaveError> {
        self.document_mut()?
            .set_property("experience_points", &xp.to_string())
    }

    pub fn unlock_all_cities(&mut self) -> Result<usize, SaveError> {
        let doc = self.document_mut()?;

        let all_cities = doc.get_array_property("cities");

        let all_cities = if !all_cities.is_empty() {
            all_cities
        } else {
            let companies = doc.get_array_property("companies");
            let mut extracted: Vec<String> = companies
                .iter()
                .filter_map(|comp| {
                    let parts: Vec<&str> = comp.split('.').collect();
                    if parts.len() >= 4 {
                        Some(parts[3].to_string())
                    } else {
                        None
                    }
                })
                .collect();
            extracted.sort();
            extracted.dedup();
            extracted
        };

        if all_cities.is_empty() {
            return Ok(0);
        }

        let visited: std::collections::HashSet<String> = doc
            .get_array_property("visited_cities")
            .into_iter()
            .collect();

        let to_add: Vec<String> = all_cities
            .iter()
            .filter(|c| !visited.contains(*c))
            .cloned()
            .collect();

        if to_add.is_empty() {
            return Ok(0);
        }

        let mut new_visited: Vec<String> = visited.into_iter().collect();
        new_visited.extend(to_add.iter().cloned());
        new_visited.sort();

        doc.set_array_property("visited_cities", &new_visited)?;

        let counts: Vec<String> = std::iter::repeat_n("1".to_string(), new_visited.len()).collect();
        doc.set_array_property("visited_cities_count", &counts)?;

        Ok(to_add.len())
    }

    pub fn max_skills(&mut self) -> Result<Vec<String>, SaveError> {
        let doc = self.document_mut()?;
        let mut changed = Vec::new();

        let skills = [
            ("adr", "63"),
            ("long_dist", "6"),
            ("heavy", "6"),
            ("fragile", "6"),
            ("urgent", "6"),
            ("mechanical", "6"),
        ];

        for (name, value) in &skills {
            if doc.set_property(name, value)? {
                changed.push(format!("{} -> {}", name, value));
            }
        }

        Ok(changed)
    }

    pub fn repair_all(&mut self) -> Result<Vec<String>, SaveError> {
        let doc = self.document_mut()?;
        let mut changed = Vec::new();

        let wear_props = [
            "engine_wear",
            "engine_wear_unfixable",
            "transmission_wear",
            "transmission_wear_unfixable",
            "cabin_wear",
            "cabin_wear_unfixable",
            "chassis_wear",
            "chassis_wear_unfixable",
        ];

        for name in &wear_props {
            if doc.set_property(name, "0")? {
                changed.push(name.to_string());
            }
        }

        Ok(changed)
    }

    pub fn refuel_all(&mut self) -> Result<Vec<String>, SaveError> {
        let doc = self.document_mut()?;
        let mut changed = Vec::new();

        if doc.set_property("fuel_relative", "1.0")? {
            changed.push("fuel_relative -> 1.0".to_string());
        }

        Ok(changed)
    }

    pub fn save(&mut self) -> Result<(), SaveError> {
        let content = self.document()?.content().to_string();
        std::fs::write(&self.save_file.game_sii_path, content.as_bytes())?;
        Ok(())
    }

    pub fn save_encrypted(&mut self) -> Result<(), SaveError> {
        let content = self.document()?.content().to_string();
        let data = if self.was_compressed {
            compress_save(&content)?
        } else {
            content.as_bytes().to_vec()
        };
        std::fs::write(&self.save_file.game_sii_path, data)?;
        Ok(())
    }
}
