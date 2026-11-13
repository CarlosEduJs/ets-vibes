use std::collections::{HashMap, HashSet};

use serde::Deserialize;

use crate::core::models::TruckInfo;
use crate::core::profile::SaveFile;

use crate::save_parser::compression::{compress_save, decompress_save};
use crate::save_parser::error::SaveError;
use crate::save_parser::sii::SiiDocument;

pub fn get_trucks_info(content: &str) -> Vec<TruckInfo> {
    // Get truck references from the player section
    let count = extract_property(content, "trucks")
        .and_then(|v| v.parse::<u32>().ok())
        .unwrap_or(0);

    let models = accessory_models(content);
    let player_vehicles = player_vehicle_refs(content);

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
        let odometer_km =
            extract_property(section_content, "odometer").and_then(|v| v.parse::<f64>().ok());
        let fuel_relative =
            extract_property(section_content, "fuel_relative").and_then(parse_hex_float);

        let engine_wear = effective_wear(section_content, "engine_wear", "engine_wear_unfixable");
        let transmission_wear = effective_wear(
            section_content,
            "transmission_wear",
            "transmission_wear_unfixable",
        );
        let cabin_wear = effective_wear(section_content, "cabin_wear", "cabin_wear_unfixable");
        let chassis_wear =
            effective_wear(section_content, "chassis_wear", "chassis_wear_unfixable");

        let wheels_wear = average_wheels_wear(section_content);

        let (brand, model) = truck_model(section_content, &models);
        let is_player = player_vehicles.contains(reference.as_str());

        trucks.push(TruckInfo {
            index: i,
            license_plate,
            odometer_km,
            fuel_relative,
            engine_wear,
            transmission_wear,
            cabin_wear,
            chassis_wear,
            wheels_wear,
            brand,
            model,
            is_player,
        });
    }
    trucks
}

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_hex_float_regular() {
        let val = parse_hex_float("1.0").unwrap();
        approx_eq(val, 1.0);
    }

    #[test]
    fn test_parse_hex_float_zero() {
        let val = parse_hex_float("0.0").unwrap();
        approx_eq(val, 0.0);
    }

    #[test]
    fn test_parse_hex_float_hex_1() {
        // &3f800000 = 1.0f32
        let val = parse_hex_float("&3f800000").unwrap();
        approx_eq(val, 1.0);
    }

    #[test]
    fn test_parse_hex_float_hex_0() {
        // &00000000 = 0.0f32
        let val = parse_hex_float("&00000000").unwrap();
        approx_eq(val, 0.0);
    }

    #[test]
    fn test_parse_hex_float_hex_half() {
        // &3f000000 = 0.5f32
        let val = parse_hex_float("&3f000000").unwrap();
        approx_eq(val, 0.5);
    }

    #[test]
    fn test_parse_hex_float_hex_neg() {
        // &bf800000 = -1.0f32
        let val = parse_hex_float("&bf800000").unwrap();
        approx_eq(val, -1.0);
    }

    #[test]
    fn test_parse_hex_float_invalid() {
        assert!(parse_hex_float("not_a_number").is_none());
    }

    #[test]
    fn test_parse_hex_float_empty() {
        assert!(parse_hex_float("").is_none());
    }

    #[test]
    fn test_parse_hex_float_ampersand_only() {
        assert!(parse_hex_float("&").is_none());
    }

    #[test]
    fn test_parse_hex_float_trimmed() {
        let val = parse_hex_float("  &3f800000  ").unwrap();
        approx_eq(val, 1.0);
    }

    fn approx_eq(a: f64, b: f64) {
        assert!((a - b).abs() < 1e-6, "{} != {}", a, b);
    }

    #[test]
    fn test_get_trucks_info_no_trucks() {
        let content = "SiiNunit\n{\n trucks: 0\n}\n";
        let trucks = get_trucks_info(content);
        assert!(trucks.is_empty());
    }

    #[test]
    fn test_get_trucks_info_with_truck() {
        let content = "\
SiiNunit
{
 trucks: 1
 trucks[0]: my_truck

 my_truck {
  license_plate: \"ABC-1234\"
  odometer: 15000.0
  fuel_relative: &3f000000
  engine_wear: &3f800000
  transmission_wear: &00000000
  cabin_wear: &3f000000
  chassis_wear: &3f000000
 }
}";
        let trucks = get_trucks_info(content);
        assert_eq!(trucks.len(), 1);

        let t = &trucks[0];
        assert_eq!(t.index, 0);
        assert_eq!(t.license_plate.as_deref(), Some("ABC-1234"));
        approx_eq(t.odometer_km.unwrap(), 15000.0);
        approx_eq(t.fuel_relative.unwrap(), 0.5);
        approx_eq(t.engine_wear.unwrap(), 1.0);
        approx_eq(t.transmission_wear.unwrap(), 0.0);
        approx_eq(t.cabin_wear.unwrap(), 0.5);
        approx_eq(t.chassis_wear.unwrap(), 0.5);
    }

    #[test]
    fn test_get_trucks_info_effective_wear_model_and_owner() {
        let content = "SiiNunit
{
 trucks: 2
 trucks[0]: _nameless.a
 trucks[1]: _nameless.b
}
player_vehicles : _nameless.pv {
 vehicle: _nameless.b
 stored_vehicle_city: null
}
vehicle : _nameless.a {
 engine_wear: 0
 engine_wear_unfixable: &3d800000
 wheels_wear: 2
 wheels_wear[0]: 0
 wheels_wear[1]: &3f000000
 wheels_wear_unfixable: 2
 wheels_wear_unfixable[0]: &3d800000
 wheels_wear_unfixable[1]: 0
 accessories: 2
 accessories[0]: _nameless.acc1
 accessories[1]: _nameless.acc2
}
vehicle : _nameless.b {
 engine_wear: &3f000000
 accessories: 1
 accessories[0]: _nameless.acc3
}
vehicle_accessory : _nameless.acc1 {
 data_path: \"/def/vehicle/truck/renault.t/engine/dti11_380.sii\"
}
vehicle_accessory : _nameless.acc2 {
 data_path: \"/def/vehicle/truck/renault.t/data.sii\"
}
vehicle_accessory : _nameless.acc3 {
 data_path: \"/def/vehicle/truck/scania.s_2016/data.sii\"
 refund: 0
}
";
        let trucks = get_trucks_info(content);
        assert_eq!(trucks.len(), 2);

        // stored wear 0 but permanent wear 0.0625 -> effective wear is 0.0625
        approx_eq(trucks[0].engine_wear.unwrap(), 0.0625);
        // wheels: max(0, 0.0625) and max(0.5, 0) -> average 0.28125
        approx_eq(trucks[0].wheels_wear.unwrap(), 0.28125);
        assert_eq!(trucks[0].brand.as_deref(), Some("renault"));
        assert_eq!(trucks[0].model.as_deref(), Some("t"));
        assert!(!trucks[0].is_player);

        approx_eq(trucks[1].engine_wear.unwrap(), 0.5);
        assert_eq!(trucks[1].brand.as_deref(), Some("scania"));
        assert_eq!(trucks[1].model.as_deref(), Some("s_2016"));
        assert!(trucks[1].is_player);
    }

    #[test]
    fn test_get_trucks_info_missing_section() {
        let content = "SiiNunit\n{\n trucks: 1\n trucks[0]: \"missing.ref\"\n}\n";
        let trucks = get_trucks_info(content);
        assert!(trucks.is_empty());
    }
}

// --- SaveEditor integration tests ---

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod editor_tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;

    fn make_save_editor(content: &str) -> (SaveEditor, tempfile::TempDir) {
        let dir = tempfile::tempdir().unwrap();
        // SaveFile::new(profile_path, save_name) creates:
        //   <profile_path>/save/<save_name>/game.sii
        let game_sii_dir = dir.path().join("save").join("save");
        fs::create_dir_all(&game_sii_dir).unwrap();
        let game_sii = game_sii_dir.join("game.sii");
        fs::write(&game_sii, content).unwrap();

        let save_file = SaveFile::new(dir.path().to_path_buf(), "save".to_string());
        (SaveEditor::new(save_file), dir)
    }

    const TWO_TRUCKS: &str = "SiiNunit
{
 trucks: 2
 trucks[0]: _nameless.a
 trucks[1]: _nameless.b
}
vehicle : _nameless.a {
 engine_wear: &3f000000
 engine_wear_unfixable: &3f000000
 cabin_wear: 0
 cabin_wear_unfixable: &3d62bc63
 odometer: 1000
 license_plate: \"AAA|spain\"
 license_plate_type: truck
 chassis_wear: 0
 wheels_wear: 2
 wheels_wear[0]: &3f000000
 wheels_wear[1]: &3f000000
 wheels_wear_unfixable: 2
 wheels_wear_unfixable[0]: &3e800000
 wheels_wear_unfixable[1]: &3f000000
}
vehicle : _nameless.b {
 engine_wear: &3f000000
 engine_wear_unfixable: &3f000000
 license_plate: \"BBB|spain\"
 chassis_wear: 0
}
";

    #[test]
    fn test_edit_truck_only_touches_selected_truck() {
        let (mut editor, _dir) = make_save_editor(TWO_TRUCKS);
        editor.load().unwrap();
        let edit = TruckEdit {
            engine_wear: Some(0.0),
            license_plate: Some("NEW|belgium".into()),
            ..Default::default()
        };
        let changes = editor.edit_truck(0, &edit).unwrap();
        assert_eq!(changes, vec!["license_plate", "engine_wear"]);

        let content = editor.document.as_ref().unwrap().content().to_string();
        let a = extract_section(&content, "_nameless.a").unwrap();
        let b = extract_section(&content, "_nameless.b").unwrap();
        assert_eq!(
            extract_property(a, "license_plate").unwrap(),
            "\"NEW|belgium\""
        );
        assert_eq!(extract_property(a, "engine_wear").unwrap(), "0");
        // unfixable can never exceed current wear
        assert_eq!(extract_property(a, "engine_wear_unfixable").unwrap(), "0");
        // untouched fields stay as they were
        assert_eq!(extract_property(a, "odometer").unwrap(), "1000");
        // the other truck is untouched
        assert_eq!(
            extract_property(b, "license_plate").unwrap(),
            "\"BBB|spain\""
        );
        assert_eq!(extract_property(b, "engine_wear").unwrap(), "&3f000000");
    }

    #[test]
    fn test_edit_truck_sets_hex_wear_and_keeps_lower_unfixable() {
        let (mut editor, _dir) = make_save_editor(TWO_TRUCKS);
        editor.load().unwrap();
        let edit = TruckEdit {
            cabin_wear: Some(0.5),
            ..Default::default()
        };
        editor.edit_truck(0, &edit).unwrap();
        let content = editor.document.as_ref().unwrap().content().to_string();
        let a = extract_section(&content, "_nameless.a").unwrap();
        assert_eq!(extract_property(a, "cabin_wear").unwrap(), "&3f000000");
        // unfixable (0.054) is below the new wear, so it is kept
        assert_eq!(
            extract_property(a, "cabin_wear_unfixable").unwrap(),
            "&3d62bc63"
        );
    }

    #[test]
    fn test_edit_truck_wheels() {
        let (mut editor, _dir) = make_save_editor(TWO_TRUCKS);
        editor.load().unwrap();
        let edit = TruckEdit {
            wheels_wear: Some(0.0),
            ..Default::default()
        };
        editor.edit_truck(0, &edit).unwrap();
        let content = editor.document.as_ref().unwrap().content().to_string();
        let a = extract_section(&content, "_nameless.a").unwrap();
        assert_eq!(average_wheels_wear(a), Some(0.0));
        assert_eq!(
            extract_property(a, "wheels_wear_unfixable[0]").unwrap(),
            "0"
        );
        assert_eq!(
            extract_property(a, "wheels_wear_unfixable[1]").unwrap(),
            "0"
        );
    }

    #[test]
    fn test_edit_truck_rejects_bad_input() {
        let (mut editor, _dir) = make_save_editor(TWO_TRUCKS);
        editor.load().unwrap();
        let bad_wear = TruckEdit {
            engine_wear: Some(1.5),
            ..Default::default()
        };
        assert!(editor.edit_truck(0, &bad_wear).is_err());
        let bad_plate = TruckEdit {
            license_plate: Some("a\"b".into()),
            ..Default::default()
        };
        assert!(editor.edit_truck(0, &bad_plate).is_err());
        assert!(editor.edit_truck(9, &TruckEdit::default()).is_err());
    }

    #[test]
    fn test_edit_truck_plate_with_dollar_is_literal() {
        let (mut editor, _dir) = make_save_editor(TWO_TRUCKS);
        editor.load().unwrap();
        let edit = TruckEdit {
            license_plate: Some("$1$2".into()),
            ..Default::default()
        };
        editor.edit_truck(1, &edit).unwrap();
        let content = editor.document.as_ref().unwrap().content().to_string();
        let b = extract_section(&content, "_nameless.b").unwrap();
        assert_eq!(extract_property(b, "license_plate").unwrap(), "\"$1$2\"");
    }

    #[test]
    fn test_load_plain_text() {
        let (mut editor, _dir) = make_save_editor("SiiNunit\n{\n}\n");
        editor.load().unwrap();
        assert!(editor.document.is_some());
    }

    #[test]
    fn test_load_file_not_found() {
        let sf = SaveFile::new(PathBuf::from("/nonexistent"), "save".to_string());
        let mut editor = SaveEditor::new(sf);
        let result = editor.load();
        assert!(result.is_err());
    }

    #[test]
    fn test_get_property_before_load_returns_none() {
        let sf = SaveFile::new(PathBuf::from("/tmp"), "x".to_string());
        let editor = SaveEditor::new(sf);
        assert!(editor.get_property("money_account").is_none());
    }

    #[test]
    fn test_get_property_after_load() {
        let (mut editor, _dir) = make_save_editor("SiiNunit\n{\n money_account: 100500\n}\n");
        editor.load().unwrap();
        assert_eq!(editor.get_property("money_account").unwrap(), "100500");
    }

    #[test]
    fn test_edit_xp_does_not_touch_other_experience_points() {
        let (mut editor, _dir) = make_save_editor(
            "SiiNunit\n{\n experience_points: 100\n}\ndriver_ai : d {\n experience_points: 777\n}\n",
        );
        editor.load().unwrap();
        editor.edit_xp(5000).unwrap();
        let content = editor.document.as_ref().unwrap().content().to_string();
        assert!(content.contains(" experience_points: 5000\n"));
        assert!(content.contains(" experience_points: 777\n"));
    }

    #[test]
    fn test_edit_money() {
        let (mut editor, _dir) = make_save_editor("SiiNunit\n{\n money_account: 100\n}\n");
        editor.load().unwrap();
        editor.edit_money(999).unwrap();
        assert_eq!(editor.get_property("money_account").unwrap(), "999");
    }

    #[test]
    fn test_edit_xp() {
        let (mut editor, _dir) = make_save_editor("SiiNunit\n{\n experience_points: 100\n}\n");
        editor.load().unwrap();
        editor.edit_xp(5000).unwrap();
        assert_eq!(editor.get_property("experience_points").unwrap(), "5000");
    }

    #[test]
    fn test_edit_money_without_load_returns_error() {
        let sf = SaveFile::new(PathBuf::from("/tmp"), "x".to_string());
        let mut editor = SaveEditor::new(sf);
        let result = editor.edit_money(100);
        assert!(result.is_err());
    }

    #[test]
    fn test_max_skills_sets_all_skills() {
        let (mut editor, _dir) = make_save_editor(
            "SiiNunit\n{\n adr: 0\n long_dist: 0\n heavy: 0\n fragile: 0\n urgent: 0\n mechanical: 0\n}\n",
        );
        editor.load().unwrap();
        let changed = editor.max_skills().unwrap();
        assert_eq!(changed.len(), 6);
        assert_eq!(editor.get_property("adr").unwrap(), "63");
        assert_eq!(editor.get_property("long_dist").unwrap(), "6");
        assert_eq!(editor.get_property("heavy").unwrap(), "6");
        assert_eq!(editor.get_property("fragile").unwrap(), "6");
        assert_eq!(editor.get_property("urgent").unwrap(), "6");
        assert_eq!(editor.get_property("mechanical").unwrap(), "6");
    }

    #[test]
    fn test_max_skills_idempotent() {
        let (mut editor, _dir) = make_save_editor("SiiNunit\n{\n adr: 63\n long_dist: 6\n}\n");
        editor.load().unwrap();
        let changed = editor.max_skills().unwrap();
        // adr and long_dist already at max, so they won't report as changed
        // but the other 4 missing skills will be created/touched
        assert!(changed.len() <= 6);
    }

    #[test]
    fn test_repair_all_sets_wear_to_zero() {
        let (mut editor, _dir) = make_save_editor(
            "SiiNunit\n{\n engine_wear: &3f800000\n transmission_wear: &3f000000\n cabin_wear: &3f000000\n chassis_wear: &3f000000\n engine_wear_unfixable: &3f800000\n transmission_wear_unfixable: &3f000000\n cabin_wear_unfixable: &3f000000\n chassis_wear_unfixable: &3f000000\n}\n",
        );
        editor.load().unwrap();
        let changed = editor.repair_all().unwrap();
        assert_eq!(changed.len(), 8);
        assert_eq!(editor.get_property("engine_wear").unwrap(), "0");
        assert_eq!(editor.get_property("transmission_wear").unwrap(), "0");
        assert_eq!(editor.get_property("cabin_wear").unwrap(), "0");
        assert_eq!(editor.get_property("chassis_wear").unwrap(), "0");
        assert_eq!(editor.get_property("engine_wear_unfixable").unwrap(), "0");
    }

    #[test]
    fn test_refuel_all_sets_fuel() {
        let (mut editor, _dir) = make_save_editor("SiiNunit\n{\n fuel_relative: &3f000000\n}\n");
        editor.load().unwrap();
        let changed = editor.refuel_all().unwrap();
        assert_eq!(changed.len(), 1);
        assert_eq!(editor.get_property("fuel_relative").unwrap(), "1.0");
    }

    #[test]
    fn test_unlock_cities_adds_new_cities() {
        let (mut editor, _dir) = make_save_editor(
            "SiiNunit\n{\n cities: 2\n cities[0]: \"berlin\"\n cities[1]: \"paris\"\n visited_cities: 1\n visited_cities[0]: \"berlin\"\n visited_cities_count: 1\n visited_cities_count[0]: \"1\"\n}\n",
        );
        editor.load().unwrap();
        let added = editor.unlock_all_cities().unwrap();
        assert_eq!(added, 1); // paris should be added

        let visited = editor
            .document()
            .unwrap()
            .get_array_property("visited_cities");
        assert!(visited.contains(&"\"berlin\"".to_string()));
        assert!(visited.contains(&"\"paris\"".to_string()));
    }

    #[test]
    fn test_unlock_cities_already_all_visited() {
        let (mut editor, _dir) = make_save_editor(
            "SiiNunit\n{\n cities: 2\n cities[0]: \"berlin\"\n cities[1]: \"paris\"\n visited_cities: 2\n visited_cities[0]: \"berlin\"\n visited_cities[1]: \"paris\"\n}\n",
        );
        editor.load().unwrap();
        let added = editor.unlock_all_cities().unwrap();
        assert_eq!(added, 0);
    }

    #[test]
    fn test_unlock_cities_from_companies() {
        let (mut editor, _dir) = make_save_editor(
            "SiiNunit\n{\n companies: 2\n companies[0]: \"company.volatile.bhv.berlin\"\n companies[1]: \"company.volatile.bhv.paris\"\n visited_cities: 0\n}\n",
        );
        editor.load().unwrap();
        let added = editor.unlock_all_cities().unwrap();
        assert_eq!(added, 2);

        let visited = editor
            .document()
            .unwrap()
            .get_array_property("visited_cities");
        assert_eq!(visited.len(), 2);
    }

    #[test]
    fn test_unlock_cities_no_cities() {
        let (mut editor, _dir) =
            make_save_editor("SiiNunit\n{\n cities: 0\n visited_cities: 0\n}\n");
        editor.load().unwrap();
        let added = editor.unlock_all_cities().unwrap();
        assert_eq!(added, 0);
    }

    #[test]
    fn test_save_writes_to_file() {
        let (mut editor, dir) = make_save_editor("SiiNunit\n{\n money_account: 100\n}\n");
        editor.load().unwrap();
        editor.edit_money(200).unwrap();
        editor.save().unwrap();

        let content = fs::read_to_string(dir.path().join("save/save/game.sii")).unwrap();
        assert!(content.contains("money_account: 200"));
    }

    #[test]
    fn test_save_encrypted_plaintext_writes_plaintext() {
        let (mut editor, dir) = make_save_editor("SiiNunit\n{\n money_account: 100\n}\n");
        editor.load().unwrap();
        editor.edit_money(200).unwrap();
        editor.save_encrypted().unwrap();

        // Since original was plaintext, output should also be plaintext
        let content = fs::read_to_string(dir.path().join("save/save/game.sii")).unwrap();
        assert!(content.contains("money_account: 200"));
    }

    #[test]
    fn test_full_workflow() {
        let (mut editor, _dir) = make_save_editor(
            "SiiNunit\n{\n money_account: 100\n experience_points: 0\n adr: 0\n fuel_relative: 0.0\n engine_wear: &3f800000\n}\n",
        );
        editor.load().unwrap();

        editor.edit_money(99999).unwrap();
        editor.edit_xp(5000).unwrap();
        editor.max_skills().unwrap();
        editor.repair_all().unwrap();
        editor.refuel_all().unwrap();

        assert_eq!(editor.get_property("money_account").unwrap(), "99999");
        assert_eq!(editor.get_property("experience_points").unwrap(), "5000");
        assert_eq!(editor.get_property("adr").unwrap(), "63");
        assert_eq!(editor.get_property("fuel_relative").unwrap(), "1.0");
        assert_eq!(editor.get_property("engine_wear").unwrap(), "0");
    }
}

fn parse_hex_float(s: &str) -> Option<f64> {
    let trimmed = s.trim();
    if let Ok(val) = trimmed.parse::<f64>() {
        return Some(val);
    }
    let hex_str = trimmed.strip_prefix('&')?;
    let bits = u32::from_str_radix(hex_str, 16).ok()?;
    Some(f64::from(f32::from_bits(bits)))
}

fn extract_property<'a>(content: &'a str, name: &str) -> Option<&'a str> {
    let escaped = regex::escape(name);
    let pattern = format!(r"(?m)^\s*{}\s*:\s*(.+?)\s*$", escaped);
    let re = regex::Regex::new(&pattern).ok()?;
    let cap = re.captures(content)?;
    Some(cap.get(1)?.as_str())
}

fn extract_section<'a>(content: &'a str, section_name: &str) -> Option<&'a str> {
    let (start, end) = section_range(content, section_name)?;
    Some(&content[start..end])
}

/// Byte range of the `{ ... }` block (including its header line) of a unit.
fn section_range(content: &str, section_name: &str) -> Option<(usize, usize)> {
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
        Some((m.start(), pos))
    } else {
        None
    }
}

/// Wear as the game applies it: the stored value can be lower than the permanent
/// (`_unfixable`) part (the game stores 0 for trucks it doesn't simulate), but the
/// effective wear is never below the permanent part.
fn effective_wear(section: &str, name: &str, unfixable_name: &str) -> Option<f64> {
    let wear = extract_property(section, name).and_then(parse_hex_float)?;
    let unfixable = extract_property(section, unfixable_name)
        .and_then(parse_hex_float)
        .unwrap_or(0.0);
    Some(wear.max(unfixable))
}

fn average_wheels_wear(section: &str) -> Option<f64> {
    let count = extract_property(section, "wheels_wear").and_then(|v| v.parse::<usize>().ok())?;
    let values: Vec<f64> = (0..count)
        .filter_map(|i| {
            effective_wear(
                section,
                &format!("wheels_wear[{i}]"),
                &format!("wheels_wear_unfixable[{i}]"),
            )
        })
        .collect();
    if values.is_empty() {
        None
    } else {
        Some(values.iter().sum::<f64>() / values.len() as f64)
    }
}

#[allow(clippy::expect_used)]
static MODEL_ACCESSORY_RE: std::sync::LazyLock<regex::Regex> = std::sync::LazyLock::new(|| {
    regex::Regex::new(
        r#"(?m)^vehicle_accessory : (\S+) \{\s*\n\s*data_path: "/def/vehicle/truck/([^/"]+)/data\.sii""#,
    )
    .expect("invalid regex pattern")
});

#[allow(clippy::expect_used)]
static PLAYER_VEHICLE_RE: std::sync::LazyLock<regex::Regex> = std::sync::LazyLock::new(|| {
    regex::Regex::new(r"(?m)^player_vehicles : \S+ \{\s*\n\s*vehicle: (\S+)")
        .expect("invalid regex pattern")
});

/// Accessory unit reference -> truck model id (`brand.model`) for every model accessory.
fn accessory_models(content: &str) -> HashMap<String, String> {
    MODEL_ACCESSORY_RE
        .captures_iter(content)
        .map(|c| (c[1].to_string(), c[2].to_string()))
        .collect()
}

/// References of the vehicles that belong to the player (not to hired drivers).
fn player_vehicle_refs(content: &str) -> HashSet<String> {
    PLAYER_VEHICLE_RE
        .captures_iter(content)
        .map(|c| c[1].to_string())
        .collect()
}

/// Splits e.g. `scania.s_2016` into (`scania`, `s_2016`).
fn truck_model(
    section: &str,
    models: &HashMap<String, String>,
) -> (Option<String>, Option<String>) {
    let count = extract_property(section, "accessories")
        .and_then(|v| v.parse::<usize>().ok())
        .unwrap_or(0);
    for i in 0..count {
        let Some(reference) = extract_property(section, &format!("accessories[{i}]")) else {
            continue;
        };
        if let Some(id) = models.get(reference.trim()) {
            return match id.split_once('.') {
                Some((brand, model)) => (Some(brand.to_string()), Some(model.to_string())),
                None => (Some(id.clone()), None),
            };
        }
    }
    (None, None)
}

/// Formats a 0.0-1.0 float the way the game writes it (`0`, or `&` + f32 hex bits).
fn format_sii_float(v: f64) -> String {
    if v == 0.0 {
        "0".to_string()
    } else {
        format!("&{:08x}", (v as f32).to_bits())
    }
}

/// Replaces the value of `name: value` inside `section` only. Returns true if it changed.
fn set_in_section(section: &mut String, name: &str, value: &str) -> bool {
    let pattern = format!(
        r"(?m)^([ \t]*{}[ \t]*:[ \t]*)[^\r\n]*?([ \t]*)$",
        regex::escape(name)
    );
    let Ok(re) = regex::Regex::new(&pattern) else {
        return false;
    };
    let updated = re
        .replace(section, |c: &regex::Captures| {
            format!("{}{}{}", &c[1], value, &c[2])
        })
        .into_owned();
    let changed = updated != *section;
    *section = updated;
    changed
}

/// Sets `name` to `v` and lowers its `<name>_unfixable` counterpart if it would exceed `v`
/// (permanent wear can never be higher than the current wear).
fn set_wear(section: &mut String, name: &str, unfixable: &str, v: f64) -> bool {
    let changed = set_in_section(section, name, &format_sii_float(v));
    let current = extract_property(section, unfixable).and_then(parse_hex_float);
    if current.is_some_and(|u| u > v) {
        set_in_section(section, unfixable, &format_sii_float(v));
    }
    changed
}

/// Fields to change on a single truck. `None` leaves a field untouched.
/// Wear values are fractions between 0.0 (new) and 1.0 (destroyed).
#[derive(Debug, Clone, Default, Deserialize)]
pub struct TruckEdit {
    pub license_plate: Option<String>,
    pub engine_wear: Option<f64>,
    pub transmission_wear: Option<f64>,
    pub cabin_wear: Option<f64>,
    pub chassis_wear: Option<f64>,
    pub wheels_wear: Option<f64>,
}

fn validate_wear(label: &str, v: f64) -> Result<f64, SaveError> {
    if v.is_finite() && (0.0..=1.0).contains(&v) {
        Ok(v)
    } else {
        Err(SaveError::InvalidValue(format!(
            "{label} must be between 0 and 1"
        )))
    }
}

fn validate_plate(plate: &str) -> Result<(), SaveError> {
    if plate.len() > 2048 || plate.contains(['"', '\n', '\r']) {
        return Err(SaveError::InvalidValue(
            "License plate must not contain quotes or line breaks".into(),
        ));
    }
    Ok(())
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
            .set_first_property("money_account", &amount.to_string())
    }

    pub fn edit_xp(&mut self, xp: i64) -> Result<bool, SaveError> {
        // Only the player's value: every hired driver and log entry has its own experience_points.
        self.document_mut()?
            .set_first_property("experience_points", &xp.to_string())
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

    /// Edits one of the player's trucks (`trucks[index]`) without touching any other vehicle.
    /// Returns a human-readable list of the fields that changed.
    pub fn edit_truck(&mut self, index: u32, edit: &TruckEdit) -> Result<Vec<String>, SaveError> {
        let wear_fields = [
            ("engine_wear", edit.engine_wear),
            ("transmission_wear", edit.transmission_wear),
            ("cabin_wear", edit.cabin_wear),
            ("chassis_wear", edit.chassis_wear),
        ];
        for (name, value) in wear_fields {
            if let Some(v) = value {
                validate_wear(name, v)?;
            }
        }
        if let Some(v) = edit.wheels_wear {
            validate_wear("wheels_wear", v)?;
        }
        if let Some(plate) = &edit.license_plate {
            validate_plate(plate)?;
        }

        let content = self.document()?.content();
        let reference = extract_property(content, &format!("trucks[{index}]"))
            .map(|r| r.trim().to_string())
            .ok_or_else(|| SaveError::InvalidValue(format!("Truck {index} not found")))?;
        let (start, end) = section_range(content, &reference)
            .ok_or_else(|| SaveError::InvalidValue(format!("Truck {index} data not found")))?;
        let mut section = content[start..end].to_string();

        let mut changes = Vec::new();

        if let Some(plate) = &edit.license_plate {
            if set_in_section(&mut section, "license_plate", &format!("\"{plate}\"")) {
                changes.push("license_plate".to_string());
            }
        }

        for (name, value) in wear_fields {
            let Some(v) = value else { continue };
            if set_wear(&mut section, name, &format!("{name}_unfixable"), v) {
                changes.push(name.to_string());
            }
        }

        if let Some(v) = edit.wheels_wear {
            let count = extract_property(&section, "wheels_wear")
                .and_then(|c| c.parse::<usize>().ok())
                .unwrap_or(0);
            let mut any = false;
            for i in 0..count {
                any |= set_wear(
                    &mut section,
                    &format!("wheels_wear[{i}]"),
                    &format!("wheels_wear_unfixable[{i}]"),
                    v,
                );
            }
            if any {
                changes.push("wheels_wear".to_string());
            }
        }

        if !changes.is_empty() {
            self.document_mut()?.replace_range(start, end, &section);
        }
        Ok(changes)
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
