use regex::Regex;
use std::sync::LazyLock;

use crate::error::SaveError;

static PROPERTY_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?m)^\s*(?P<name>\w+(?:\[\d+\])?)\s*:\s*(?P<value>.+?)\s*$").unwrap()
});

pub struct SiiDocument {
    content: String,
}

impl SiiDocument {
    pub fn new(content: String) -> Self {
        Self { content }
    }

    pub fn content(&self) -> &str {
        &self.content
    }

    pub fn get_property(&self, property_name: &str) -> Option<&str> {
        let escaped = regex::escape(property_name);
        let pattern = format!(r"(?m)^\s*{}\s*:\s*(.+?)\s*$", escaped);
        let re = Regex::new(&pattern).ok()?;
        let cap = re.captures(&self.content)?;
        Some(cap.get(1)?.as_str())
    }

    pub fn set_property(
        &mut self,
        property_name: &str,
        new_value: &str,
    ) -> Result<bool, SaveError> {
        let escaped = regex::escape(property_name);
        let pattern = format!(r"(?m)(^\s*{})\s*:\s*.+?(\s*$)", escaped);
        let re = Regex::new(&pattern)?;
        let replacement = format!("${{1}}: {new_value}${{2}}");
        let new_content = re.replace_all(&self.content, replacement.as_str());
        let changed = new_content != self.content;
        self.content = new_content.into_owned();
        Ok(changed)
    }

    pub fn get_array_property(&self, property_name: &str) -> Vec<String> {
        let count = match self.get_property(property_name) {
            Some(val) => val.parse::<usize>().unwrap_or(0),
            None => return Vec::new(),
        };

        let mut items = Vec::with_capacity(count);
        for i in 0..count {
            let indexed_name = format!("{}[{}]", property_name, i);
            match self.get_property(&indexed_name) {
                Some(val) => items.push(val.to_string()),
                None => items.push(String::new()),
            }
        }
        items
    }

    pub fn set_array_property(
        &mut self,
        property_name: &str,
        values: &[String],
    ) -> Result<bool, SaveError> {
        let mut changed = false;

        if self.set_property(property_name, &values.len().to_string())? {
            changed = true;
        }

        let last_prop_line = PROPERTY_RE.captures_iter(&self.content).last().map(|c| {
            let m = c.get(0).unwrap();
            (m.start(), m.end())
        });

        for (i, value) in values.iter().enumerate() {
            let indexed_name = format!("{}[{}]", property_name, i);

            match self.set_property(&indexed_name, value) {
                Ok(true) => {
                    changed = true;
                }
                Ok(false) => {
                    if let Some((_, end)) = last_prop_line {
                        let insertion = format!("\n {}: {}", indexed_name, value);
                        self.content.insert_str(end, &insertion);
                        changed = true;
                    }
                }
                Err(e) => return Err(e),
            }
        }

        Ok(changed)
    }

    pub fn get_array_property_count(&self, property_name: &str) -> usize {
        self.get_property(property_name)
            .and_then(|val| val.parse().ok())
            .unwrap_or(0)
    }
}
