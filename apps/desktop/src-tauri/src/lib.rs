#![allow(dead_code)]

pub mod commands;
pub mod core;
pub mod save_parser;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::profile::list_profiles,
            commands::profile::get_saves,
            commands::profile::delete_profile,
            commands::save::load_save,
            commands::save::edit_save,
            commands::save::unlock_cities,
            commands::save::max_skills,
            commands::save::repair_all,
            commands::save::refuel_all,
            commands::manage::rename_save,
            commands::manage::clone_save,
            commands::manage::delete_save,
            commands::config::list_configs,
            commands::config::load_config,
            commands::config::save_config,
            commands::config::get_app_info,
        ]);

    #[allow(clippy::expect_used)]
    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
