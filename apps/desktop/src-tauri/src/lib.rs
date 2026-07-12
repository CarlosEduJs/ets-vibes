mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::list_profiles,
            commands::get_saves,
            commands::load_save,
            commands::edit_save,
            commands::unlock_cities,
            commands::max_skills,
            commands::repair_all,
            commands::refuel_all,
            commands::list_configs,
            commands::load_config,
            commands::save_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
