use ets_core::{SaveFile, TruckInfo};

use crate::compression::{compress_save, decompress_save};
use crate::error::SaveError;
use crate::sii::SiiDocument;

pub fn get_trucks_info(content: &str) -> Vec<TruckInfo> {
    // Get truck references from the player section
    let count = extract_property(content, "trucks")
        .and_then(|v| v.parse::<u32>().ok())
        .unwrap_or(0);

    let mut trucks = Vec::new();
    for i in 0..count {
        let prop = format!("trucks[{}]", i);
        let reference = match extract_property(content, &prop) {
            Some(ref_str) => ref_str.trim().to_string(),
            None => continue,
        };

        let section_content = match extract_section(content, &reference) {
            Some(s) => s,
            None => continue,
        };

        let license_plate = extract_property(section_content, "license_plate")
            .map(|s| s.trim_matches('"').to_string());
        let odometer_km = extract_property(section_content, "odometer")
            .and_then(|v| v.parse::<f64>().ok());
        let fuel_relative = extract_property(section_content, "fuel_relative")
            .and_then(parse_hex_float);

        let engine_wear = extract_property(section_content, "engine_wear")
            .and_then(parse_hex_float);
        let transmission_wear = extract_property(section_content, "transmission_wear")
            .and_then(parse_hex_float);
        let cabin_wear = extract_property(section_content, "cabin_wear")
            .and_then(parse_hex_float);
        let chassis_wear = extract_property(section_content, "chassis_wear")
            .and_then(parse_hex_float);

        trucks.push(TruckInfo {
            index: i,
            license_plate,
            odometer_km,
            fuel_relative,
            engine_wear,
            transmission_wear,
            cabin_wear,
            chassis_wear,
        });
    }
    trucks
}

fn parse_hex_float(s: &str) -> Option<f64> {
    let trimmed = s.trim();
    if let Ok(val) = trimmed.parse::<f64>() {
        return Some(val);
    }
    let hex_str = trimmed.strip_prefix('&')?;
    let bits = u32::from_str_radix(hex_str, 16).ok()?;
    Some(f32::from_bits(bits) as f64)
}

fn extract_property<'a>(content: &'a str, name: &str) -> Option<&'a str> {
    let escaped = regex::escape(name);
    let pattern = format!(r"(?m)^\s*{}\s*:\s*(.+?)\s*$", escaped);
    let re = regex::Regex::new(&pattern).ok()?;
    let cap = re.captures(content)?;
    Some(cap.get(1)?.as_str())
}

fn extract_section<'a>(content: &'a str, section_name: &str) -> Option<&'a str> {
    let escaped = regex::escape(section_name);
    // Section may be defined as "name {" or "type : name {"
    let pattern = format!(r"(?m)^\s*(?:\S+\s+:\s+)?{}\s*\{{", escaped);
    let re = regex::Regex::new(&pattern).ok()?;
    let m = re.find(content)?;

    let mut depth: i32 = 1;
    let bytes = content.as_bytes();
    let mut pos = m.end();

    while pos < bytes.len() && depth > 0 {
        match bytes[pos] {
            b'{' => depth += 1,
            b'}' => depth -= 1,
            _ => {}
        }
        pos += 1;
    }

    if depth == 0 {
        Some(&content[m.start()..pos])
    } else {
        None
    }
}

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
