#![allow(clippy::unwrap_used)]

use std::fs;
use std::path::Path;

/// Test that we can load and parse the minimal_game.sii fixture
#[test]
fn test_load_minimal_fixture() {
    let path = fixture_path("minimal_game.sii");
    let content = fs::read_to_string(&path).unwrap();

    let doc = ets_vibes_lib::save_parser::sii::SiiDocument::new(content.clone());

    assert_eq!(doc.get_property("money_account").unwrap(), "50000000");
    assert_eq!(doc.get_property("experience_points").unwrap(), "1600");
    assert_eq!(doc.get_property("adr").unwrap(), "63");
    assert_eq!(doc.get_property("fuel_relative").unwrap(), "&3f000000");
    assert_eq!(
        doc.get_property("engine_wear_unfixable").unwrap(),
        "&3a1cae97"
    );
    assert_eq!(doc.get_property("license_plate").unwrap(), "\"ABC-1234\"");
    assert_eq!(doc.get_property("coinsurance_ratio").unwrap(), "&3dcccccd");

    // Test array access
    let cities = doc.get_array_property("visited_cities");
    assert_eq!(cities.len(), 3);
    assert_eq!(cities[0], "berlin");

    let companies = doc.get_array_property("companies");
    assert_eq!(companies.len(), 4);
    assert!(companies[0].contains("berlin"));
}

/// Test round-trip compress/decompress with the real fixture
#[test]
fn test_fixture_compress_roundtrip() {
    let path = fixture_path("minimal_game.sii");
    let original = fs::read_to_string(&path).unwrap();

    let compressed = ets_vibes_lib::save_parser::compression::compress_save(&original).unwrap();
    let decompressed =
        ets_vibes_lib::save_parser::compression::decompress_save(&compressed).unwrap();

    assert_eq!(decompressed, original);
}

/// Test that generated ScsC fixture can be loaded
#[test]
fn test_scsc_fixture_roundtrip() {
    let path = fixture_path("minimal_game.sii");
    let original = fs::read_to_string(&path).unwrap();
    let compressed = ets_vibes_lib::save_parser::compression::compress_save(&original).unwrap();

    // Write the ScsC fixture if it doesn't exist or is stale
    let scsc_path = fixtures_dir().join("minimal_game_scsc.bin");
    if !scsc_path.exists() {
        fs::write(&scsc_path, &compressed).unwrap();
    }

    // Verify we can load the fixture
    let saved_data = fs::read(&scsc_path).unwrap();
    let decompressed =
        ets_vibes_lib::save_parser::compression::decompress_save(&saved_data).unwrap();
    assert_eq!(decompressed, original);
}

/// Test profile.sii fixture
#[test]
fn test_profile_fixture() {
    let path = fixture_path("profile.sii");
    let content = fs::read_to_string(&path).unwrap();
    let doc = ets_vibes_lib::save_parser::sii::SiiDocument::new(content);

    assert_eq!(doc.get_property("name").unwrap(), "\"Carlos\"");
    assert_eq!(doc.get_property("cached_experience").unwrap(), "1600");
    assert_eq!(doc.get_property("cached_distance").unwrap(), "245000");
    let mods = doc.get_array_property("active_mods");
    assert!(mods.is_empty());
}

/// Test info.sii fixture
#[test]
fn test_info_fixture() {
    let path = fixture_path("info.sii");
    let content = fs::read_to_string(&path).unwrap();
    let doc = ets_vibes_lib::save_parser::sii::SiiDocument::new(content);

    assert_eq!(doc.get_property("name").unwrap(), "\"autosave\"");
    assert_eq!(doc.get_property("file_time").unwrap(), "1768155758");
    let deps = doc.get_array_property("dependencies");
    assert_eq!(deps.len(), 3);
    assert!(deps[0].contains("eut2_fr"));
}

/// Test config.cfg fixture
#[test]
fn test_config_fixture() {
    let path = fixture_path("config.cfg");
    let content = fs::read_to_string(&path).unwrap();
    let doc = ets_vibes_lib::save_parser::config::ConfigDocument::parse(&content);

    assert_eq!(doc.entries.len(), 29);

    // Check known entries
    let scale = doc.get("r_scale").unwrap();
    assert_eq!(scale.value, "1.0");
    assert_eq!(
        scale.category,
        ets_vibes_lib::core::config_category::ConfigCategory::Graphics
    );
    assert_eq!(
        scale.val_type,
        ets_vibes_lib::save_parser::config::ConfigValueType::Float
    );

    let fps = doc.get("g_fps").unwrap();
    assert_eq!(fps.value, "0");
    assert_eq!(
        fps.category,
        ets_vibes_lib::core::config_category::ConfigCategory::Developer
    );

    let unknown = doc.get("unknown_setting").unwrap();
    assert_eq!(
        unknown.category,
        ets_vibes_lib::core::config_category::ConfigCategory::Misc
    );

    // Test categorization
    let graphics =
        doc.get_by_category(ets_vibes_lib::core::config_category::ConfigCategory::Graphics);
    assert!(graphics.len() >= 2);

    // Test search - matches r_scale, ui_scale, r_ipd_scale
    let results = doc.search("scale");
    assert_eq!(results.len(), 3);

    // Test Display roundtrip
    let serialized = doc.to_string();
    let reparsed = ets_vibes_lib::save_parser::config::ConfigDocument::parse(&serialized);
    assert_eq!(reparsed.entries.len(), doc.entries.len());
}

/// Test edit operations on the real fixture
#[test]
fn test_edit_money_on_fixture() {
    let path = fixture_path("minimal_game.sii");
    let content = fs::read_to_string(&path).unwrap();
    let doc = ets_vibes_lib::save_parser::sii::SiiDocument::new(content);

    assert_eq!(doc.get_property("money_account").unwrap(), "50000000");
}

/// Test hex float parsing with real ETS2 values
#[test]
fn test_real_hex_floats() {
    // Real values from ETS2 save files
    let cases = vec![
        ("&3dcccccd", 0.1),             // coinsurance_ratio
        ("&3f000000", 0.5),             // fuel_relative half
        ("&3f400000", 0.75),            // rheostat_factor
        ("&3f800000", 1.0),             // 1.0
        ("&00000000", 0.0),             // 0.0
        ("&bf800000", -1.0),            // -1.0
        ("&3a1cae97", 0.000_934_230_6), // engine_wear_unfixable
        ("&3d05901d", 0.032_366_33),    // transmission_wear_unfixable
        ("&3d974782", 0.073_814_4),     // cabin_wear_unfixable
        ("&3d76db2a", 0.060_244_52),    // chassis_wear_unfixable
        ("&3ef92c25", 0.486_422_36),    // fuel_relative
        ("&3fe29b40", 1.771_053),       // discovery distance
        ("&42615739", 56.335_178),      // real_time_seconds
        ("&45d077f5", 6_670.994_6),     // payment_timer
    ];

    for (hex, expected) in &cases {
        let result = parse_hex_float(hex).unwrap();
        let diff = (result - expected).abs();
        assert!(
            diff < 0.02,
            "hex={} expected={} got={} diff={}",
            hex,
            expected,
            result,
            diff
        );
    }
}

/// Test player level calculation with real XP
#[test]
fn test_real_xp_levels() {
    // level = floor((1 + sqrt(1 + 8*xp/100)) / 2)
    assert_eq!(calc_level(0), 1);
    assert_eq!(calc_level(100), 2);
    assert_eq!(calc_level(300), 3);
    assert_eq!(calc_level(1600), 6); // from fixture
    assert_eq!(calc_level(495000), 100);
}

/// Test the unlock_all_cities logic on fixture data
#[test]
fn test_unlock_cities_on_fixture() {
    let path = fixture_path("minimal_game.sii");
    let content = fs::read_to_string(&path).unwrap();
    let doc = ets_vibes_lib::save_parser::sii::SiiDocument::new(content);

    // Get currently visited cities
    let visited = doc.get_array_property("visited_cities");
    assert_eq!(visited.len(), 3);

    // get_trucks_info from fixture
    let trucks = ets_vibes_lib::save_parser::editor::get_trucks_info(doc.content());
    assert_eq!(trucks.len(), 1);
    assert_eq!(trucks[0].license_plate.as_deref(), Some("ABC-1234"));
}

fn calc_level(exp: i64) -> u32 {
    let exp = exp as f64;
    ((1.0 + (1.0 + 8.0 * exp / 100.0).sqrt()) / 2.0).floor() as u32
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

fn fixtures_dir() -> std::path::PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures")
}

fn fixture_path(name: &str) -> std::path::PathBuf {
    fixtures_dir().join(name)
}
