export const CONFIG_DESCRIPTIONS: Record<string, string> = {
  // Display & Resolution
  r_mode_width:
    "Screen width in pixels. Higher values look sharper but need more GPU power to render.",
  r_mode_height:
    "Screen height in pixels. Keep this proportional to the width to avoid a stretched image.",
  r_mode_refresh:
    "Forces a specific refresh rate (Hz) for your monitor. Set to 0 to use the system default.",
  r_fullscreen:
    "Runs the game in exclusive fullscreen. Usually gives the best performance and lowest input lag.",
  r_fullscreen_borderless:
    "Runs the game in a borderless window that covers the screen, so Alt+Tab is instant. Set to -1 to disable.",
  r_windowed_borderless:
    "Runs the game in a window sized to fill the screen but without a title bar or borders. Set to -1 to disable.",
  r_vsync:
    "Locks the frame rate to your monitor's refresh rate to prevent screen tearing. May add slight input lag.",
  r_device:
    "Forces a specific graphics API, e.g. 'dx11'. Leave empty to let the game auto-detect the best option.",
  r_adapter:
    "Chooses which graphics card to use on systems with more than one GPU. Set to -1 to use the primary GPU.",
  r_output:
    "Chooses which monitor the game renders to in a multi-monitor setup. Set to -1 for the default display.",
  r_path:
    "Overrides the engine's internal render path. Advanced/technical option — most players should leave this alone.",
  r_vulkan_runtime: "Custom folder path for Vulkan runtime files, only needed in special setups.",

  // Scaling & Sharpness
  r_scale_x:
    "Internal horizontal render resolution as a multiplier. Above 1.0 renders extra detail and downsamples for a sharper image, at a real performance cost.",
  r_scale_y:
    "Internal vertical render resolution as a multiplier. Keep matched to the horizontal scale to avoid a stretched image.",
  r_anisotropy_factor:
    "Sharpens textures viewed at steep angles, like distant road surfaces. Higher values look better with a modest GPU cost. 0 disables it.",
  r_texture_detail:
    "Texture resolution level. 0 is full quality; higher numbers reduce detail to save video memory (VRAM).",
  r_normal_maps:
    "Adds fine surface detail (bumps, dents, texture) to objects without adding extra geometry.",

  // Shadows, Lighting & Ambient Effects
  r_ssao:
    "Adds soft contact shadows in corners and crevices for extra visual depth (SSAO). Noticeable performance cost.",
  r_aa: "Anti-aliasing strength. Smooths jagged edges on objects. 0 disables it; higher values smooth more but cost more performance.",
  r_taa_tuning:
    "Tuning preset for Temporal Anti-Aliasing (TAA), balancing image sharpness against motion stability.",
  r_taa_luma_sharpen:
    "Sharpening filter applied after TAA to counteract the slight softness TAA can introduce.",
  r_taa_modulated_drr_strength:
    "Controls how strongly dynamic resolution scaling reacts while TAA is active.",
  r_drr_strength:
    "How aggressively Dynamic Resolution lowers render resolution on the fly to keep frame rate stable.",
  r_sun_shadow_texture_size:
    "Resolution of sunlight shadow maps. Higher values (e.g. 4096) give crisper shadow edges but cost GPU performance and VRAM.",
  r_sun_shadow_quality:
    "Overall quality/smoothness of sunlight shadows, from 0 (lowest) to 3 (highest). Higher costs more performance.",
  r_fake_shadows:
    "Uses simplified, cheaper shadows under vehicles and objects to save performance.",
  r_interior_shadow:
    "Enables shadows cast inside the truck cabin. Small performance cost when driving in cabin view.",
  r_cloud_shadows:
    "Projects moving cloud shadows onto the ground for more dynamic lighting. Small performance cost.",
  r_light_flares: "Shows glow/flare effects around headlights, taillights, and street lamps.",
  r_sunshafts:
    "Shows visible light beams (god rays) when sunlight is partly blocked by objects or trees. Moderate performance cost.",
  r_bloom:
    "Intensity of the glow effect around bright lights. 1.0 is the default balance; higher values glow more.",
  r_bloom_override:
    "Lets your manual bloom settings override the defaults defined by the current map or weather.",
  r_bloom_standard_deviation:
    "How far the glow from bright lights spreads outward — lower is tighter/sharper, higher is softer.",

  // Mirrors
  r_mirror_group:
    "Overall quality of rear-view mirror reflections, from 0 (lowest) to 3 (highest). Mirrors are rendered like a second scene, so this has a real performance cost.",
  r_mirror_view_distance:
    "How far away objects are still rendered inside mirror reflections. Higher values cost more performance.",
  r_mirror_scale_x:
    "Internal horizontal resolution of mirror reflections. Higher looks sharper but costs performance.",
  r_mirror_scale_y:
    "Internal vertical resolution of mirror reflections. Keep matched to the horizontal scale.",
  r_deferred_mirrors:
    "Uses a more advanced lighting technique for mirror reflections, improving their visual quality at a performance cost.",

  // Color & Post-Processing
  r_color_correction:
    "Enables post-processing color adjustments for more realistic or vivid tones.",
  r_color_saturation:
    "Color intensity. Higher values make colors more vivid; lower values look more washed out.",
  r_color_yellow_blue:
    "Shifts the overall image color temperature between warm (yellow) and cool (blue).",
  r_color_magenta_green: "Shifts the overall image tint between magenta (pink) and green.",
  r_color_cyan_red: "Shifts the overall image tint between cyan (blue) and red.",
  r_dof:
    "Depth of Field: blurs objects outside the camera's focus distance, like a real camera lens.",
  r_dof_start: "Distance from the camera where the depth-of-field blur starts to appear.",
  r_dof_transition: "How gradually the image transitions from sharp focus into blur.",
  r_dof_filter_size: "Strength/amount of blur applied by the depth-of-field effect.",

  // HDR / SDR Calibration
  r_hdr_display_gray_offset:
    "Fine calibration for the mid-gray point on HDR displays. Technical — most users shouldn't need to touch this.",
  r_hdr_display_white:
    "Maximum HDR brightness (white point). Set to -1 to auto-detect from your display.",
  r_hdr_display_black:
    "Minimum HDR brightness (black point), used to avoid washed-out dark scenes. Set to -1 for auto.",
  r_sdr_display_gray_offset: "Brightness calibration for standard (non-HDR) monitors.",
  r_sdr_display_white: "Maximum brightness for standard (non-HDR) color output.",
  r_sdr_display_black: "Black-level depth adjustment for standard (non-HDR) color output.",
  r_peak_brightness: "Maximum brightness in nits that your HDR monitor can display.",

  // Performance / Rendering Internals
  r_far_shadow_disable:
    "Performance option that removes shadows from objects far away from the player.",
  r_show_sun_cascades:
    "Debug tool: overlays a visualization of how sunlight shadows are split into distance bands. Not for normal use.",
  r_tonemap_debug:
    "Debug tool: visualizes how HDR colors are converted for display. Not for normal use.",
  r_use_depth_bounds:
    "Rendering optimization that skips pixels outside a certain depth range. Technical setting, safe to leave default.",
  r_hide_helpers:
    "Hides on-screen icons and visual aid markers — useful for taking clean screenshots or videos.",
  r_interior_raindrops:
    "Shows raindrops sliding down the windows in interior camera view during rain.",
  r_buffer_page_size:
    "Technical memory chunk size used when loading graphics data. Default is 10; not recommended to change.",
  r_deferred_debug:
    "Developer tool for inspecting the lighting/rendering pipeline. Not for normal use.",
  r_nowmi:
    "Disables the Windows Management Interface (WMI) to avoid compatibility issues on some systems.",
  r_startup_progress: "Shows detailed technical loading info during game startup.",
  r_setup_done: "Internal flag: whether the first-time setup wizard has already been completed.",
  r_imgui_scale: "Size of developer console/debug tool windows on screen.",
  r_no_frame_tracking: "Disables CPU/GPU frame latency monitoring.",
  r_minimal_unfinished_frames:
    "Reduces the number of buffered frames to lower input latency, at the cost of frame-time stability.",

  // Multi-Monitor Setups
  r_multimon_mode:
    "Multi-monitor layout mode. 0 = off, 1–4 = specific multi-screen configurations.",
  r_multimon_fov_horizontal:
    "Horizontal field of view for each side monitor in a multi-monitor setup.",
  r_multimon_fov_vertical:
    "Vertical field of view across monitors. 0 calculates it automatically from the horizontal FOV.",
  r_multimon_rotation_center:
    "Tilt angle (degrees) of the center monitor, for angled multi-monitor setups.",
  r_multimon_rotation_left:
    "Tilt angle (degrees) of the left monitor, useful for curved multi-monitor setups.",
  r_multimon_rotation_right:
    "Tilt angle (degrees) of the right monitor, useful for curved multi-monitor setups.",
  r_multimon_rotation_aux: "Tilt angle (degrees) of a fourth, auxiliary monitor.",
  r_multimon_vert_offset_left:
    "Vertical alignment offset of the left monitor relative to the center one.",
  r_multimon_vert_offset_right:
    "Vertical alignment offset of the right monitor relative to the center one.",
  r_multimon_border_fov_left:
    "Compensates the field of view for the physical bezel gap between the left and center monitors.",
  r_multimon_border_fov_right:
    "Compensates the field of view for the physical bezel gap between the center and right monitors.",
  r_multimon_interior_in_main: "Keeps the truck cabin view on the center monitor only.",
  r_multimon_exterior_in_aux: "Shows the exterior/secondary camera view on the auxiliary monitor.",

  // VR / Stereo
  r_manual_stereo_buffer_scale: "Render resolution scale used in VR/stereo 3D modes.",
  r_manual_stereo_ui_buffer_scale:
    "Extra resolution applied only to the UI in VR, so menus and text stay sharp.",
  r_manual_stereo_ui_fov: "Size of the interface when viewing flat (non-cabin) menus in stereo 3D.",
  r_manual_stereo_ui_fov_game:
    "Size of the in-game menu overlay while inside the truck cabin in VR.",
  r_manual_stereo_ui_static_fov: "Size of the main desktop menus while in VR.",
  r_manual_stereo_ui_dist: "Distance the interface appears from your eyes in flat stereo 3D mode.",
  r_manual_stereo_ui_dist_game:
    "Distance/depth of the in-game menu relative to the dashboard in VR.",
  r_manual_stereo_ui_radius: "Curvature of the interface around the player in flat stereo modes.",
  r_manual_stereo_ui_radius_game: "Curvature of in-cabin menus around the player in VR.",
  r_manual_stereo_ui_x: "Horizontal position offset of the interface in stereo modes.",
  r_manual_stereo_ui_y: "Vertical position offset of the interface in stereo modes.",
  r_manual_stereo_ui_x_game: "Horizontal position offset of the in-game menu in VR.",
  r_manual_stereo_ui_y_game: "Vertical position offset of the in-game menu in VR.",
  r_manual_stereo_ui_yaw: "Left/right rotation of the interface in stereo modes.",
  r_manual_stereo_ui_pitch: "Forward/backward tilt of the interface in stereo modes.",
  r_manual_stereo_ui_yaw_game: "Left/right rotation of the in-game menu in VR.",
  r_manual_stereo_ui_pitch_game: "Forward/backward tilt of the in-game menu in VR.",
  r_manual_stereo_ui_lod_bias:
    "Reduces texture blur (mipmapping) on the VR interface to keep it sharp.",
  r_manual_stereo_ui_mipmaps:
    "Enables lower-resolution texture fallbacks for the VR interface at a distance.",
  r_manual_stereo_mirror_mode: "How rear-view mirrors are rendered per eye in VR.",
  r_hmd_controller_shadows: "Enables shadows cast by your VR motion controllers.",
  r_hmd_draw_controllers: "Shows 3D models of your VR controllers inside the cabin.",
  r_hmd_water_pixels_per_deg: "Pixel density used for water reflections in VR.",
  r_ipd_scale:
    "Adjusts the virtual eye distance (IPD) to match your own for correct 3D depth in VR.",

  // Sound
  s_init_master_volume: "Overall game volume when the game starts.",
  s_init_master_mute: "Starts the game fully muted (1) or with sound on (0).",
  s_init_ui_music_volume: "Volume of the menu/desktop soundtrack.",
  s_init_ui_music_mute: "Starts menu music muted.",
  s_init_intro_music_volume: "Volume of the music during the startup logo screens.",
  s_init_intro_music_mute: "Starts the intro music muted.",
  s_output_driver: "Forces a specific audio output device. Leave empty to use the system default.",
  s_live_update: "Applies sound setting changes immediately without needing to restart the game.",
  s_suspend_sound:
    "Automatically mutes the game audio when you switch to another window (Alt+Tab).",
  s_sound_debug:
    "Debug tool: shows technical visualizers for active sound sources in the world. Not for normal use.",

  // Input / Cursor
  i_controller_cursor_speed: "How fast the on-screen cursor moves in menus when using a gamepad.",
  i_cursor_force_spd_mlt:
    "Cursor sensitivity multiplier when using a steering wheel to control the mouse cursor.",
  i_cursor_semantic_force_spd_mlt:
    "How strongly the cursor is 'pulled' toward clickable buttons and UI elements.",

  // Traffic & World
  g_traffic: "Amount of AI traffic on the road. 1.0 is default; higher values mean denser traffic.",
  g_pedestrian: "Shows pedestrians walking on city sidewalks.",
  g_lod_factor_traffic:
    "Distance at which traffic vehicles switch to lower-detail models. Lower values save performance.",
  g_lod_factor_pedestrian: "Distance at which pedestrians switch to lower-detail models.",
  g_lod_factor_parked: "Rendering distance/detail for parked (stationary) vehicles.",
  g_vehicle_flare_lights:
    "Shows the glow effect on headlights and taillights for all vehicles, not just yours.",
  g_auto_traffic_headlights:
    "AI vehicles turn on their headlights automatically at night or in rain.",
  g_light_span_factor: "How wide headlight beams spread out sideways.",
  g_light_distance_factor: "How far forward headlight beams reach.",

  // Driving Assists
  g_anti_slip:
    "Traction control — helps prevent wheelspin under heavy acceleration or on slippery roads.",
  g_abs:
    "Anti-lock braking — prevents wheel lock-up under hard braking so you keep steering control.",
  g_bumps: "Multiplier for how strongly road bumps and potholes are felt in the truck's physics.",
  g_intelligent_transmission:
    "Improves automatic gearbox shift logic for better efficiency or performance.",
  g_upshift_coef: "Engine RPM point at which the automatic transmission shifts up a gear.",
  g_downshift_coef: "Engine RPM point at which the automatic transmission shifts down a gear.",
  g_spec_trans_refill_tank: "Automatically refills the fuel tank when servicing at a garage.",
  g_trailer_cables_mode:
    "Trailer cable visibility. 0 = hidden, 1 = visible on your truck only, 2 = visible on all trucks.",
  g_suspension_auto_reset:
    "Returns air suspension to its default ride height automatically when you start driving.",

  // Saves & System
  g_save_format:
    "Save file format. 0 = binary, 2 = plain text — text format allows manually editing save files.",
  g_save_indicator: "Shows a small icon on screen whenever the game autosaves.",
  g_game_version:
    "Internal record of the last game version that wrote this save/config file. Not user-editable in a meaningful way.",
  g_lang_init: "Interface language code, e.g. 'en_gb'.",
  g_stream_exts: "Audio file formats the in-game radio is allowed to play from local files.",
  g_album_image: "Shows album art in the radio player when the audio file includes it.",
  g_thrustmaster: "Enables native support for Thrustmaster steering wheels and peripherals.",
  g_tobii: "Enables integration with Tobii eye-tracking devices.",
  g_trackir: "Enables head tracking for camera movement using TrackIR hardware.",
  g_disable_hud_activation:
    "Prevents the HUD/adviser messages from popping up automatically in certain situations.",
  g_interior_camera_zero_pitch:
    "Keeps the interior camera's vertical tilt level with the horizon by default.",
  g_color_feedback: "Shows color changes in the UI to indicate states like fines or warnings.",
  g_truck_light_specular:
    "Adds bright specular light reflections on the truck's metallic and glossy surfaces.",
  g_hq_3d_scale:
    "Fine resolution multiplier used specifically for high-quality in-game screenshots.",
  g_hq_3d_screenshot: "Renders at boosted quality only at the moment a screenshot is taken.",
  g_menu_aa_limit: "Maximum anti-aliasing level applied while browsing menus.",
  g_additional_water_fov:
    "Prevents water rendering from being cut off at the edges on ultra-wide monitors.",
  g_screenshot_on_bug:
    "Automatically takes a screenshot when you submit an in-game bug report (F11).",
  g_screenshot_on_bug_quality:
    "JPEG compression quality used for automatic bug-report screenshots.",
  g_city_name_move: "Subtle floating animation applied to city names on the world map.",

  // Debug / Developer Tools (not intended for regular players)
  g_kdop_preview:
    "Debug tool: visualizes simplified collision boundaries in the engine. Not for normal use.",
  g_assert_dump: "Debug tool: writes a detailed log file when a critical code error occurs.",
  g_colbox:
    "Debug tool: displays the physical collision boxes of objects in the world. Not for normal use.",
  g_col_offset_factor:
    "Technical adjustment for the contact distance between physics surfaces. Not for normal use.",
  g_col_fill_backface: "Debug tool: shows the interior faces of collision objects for testing.",
  g_col_fill_alpha: "Debug tool: transparency of visible collision boxes when debugging.",
  g_glass_debugging_level: "Debug tool for testing reflections and transparency on glass surfaces.",
  v_bug_break:
    "Debug tool: pauses the game the instant a code error is detected. Not for normal use.",
  g_debug_allocators:
    "Debug tool: technical memory allocation tracking for developers. Not for normal use.",
  g_show_sun_cascades: "Debug tool: visualizes sunlight shadow distance bands. Not for normal use.",

  // Sorting & UI Behavior
  g_line_sort: "Default sort order for cargo/route lists in the interface.",
  g_cargo_sort:
    "Default sort criteria (price, distance, weight, etc.) for available freight listings.",
  g_editor_zoom_speed: "Scroll sensitivity when zooming in the map editor.",
  g_map_note_user_id: "Unique ID used to sync your personal map notes/annotations.",
  g_desktop_fadeout: "Seconds of inactivity before the desktop UI dims.",
  g_item_check_speed:
    "Speed at which the game validates files and mods on startup. -1 uses the default.",
  g_hw_info: "Allows the game to send anonymous hardware info to SCS for statistics.",
  g_sns: "Settings for sharing photos to external social/photo-sharing services.",
  g_global_force_load_selector:
    "Always shows the save-slot selection screen on startup, even with one save.",
  g_semantical_pause_inactivity: "Seconds of no input before the game automatically pauses.",
  g_semantical_ff_inactivity:
    "Speeds up game time automatically if you remain stationary for too long.",
  g_pause_on_disconnect: "Instantly pauses the game if your wheel or gamepad disconnects.",
  g_ignore_low_fps:
    "Suppresses the warning message that appears when the game detects poor performance.",
  g_artist_id: "Internal identifier used for online radio station metadata.",
  g_force_online_lscrs: "Always tries to download new community loading-screen images.",
  g_flyspeed: "Movement speed of the free/developer camera (accessed in developer mode).",
  g_frame_image_fmt: "File format for in-game screenshots: 'jpg' or 'png'.",
  g_frames_path: "Custom folder path where screenshots are saved.",
  g_convoy_allow_load:
    "Allows the host to load a save during an active multiplayer convoy session.",
  g_max_convoy_size: "Maximum number of players allowed in a multiplayer convoy.",
  g_last_hidden_dlc_widget_name: "Internal record of the last DLC banner you dismissed.",
  g_last_seen_dlc_release_date:
    "Internal timestamp used to avoid repeating DLC/news notifications.",
  g_last_seen_patch_notes_hash:
    "Internal code used to detect whether you've already read the current patch notes.",
  g_academy_book_count: "Number of unread lessons/guides in the Driving Academy menu.",
  g_mm_help_shown:
    "Internal flag: whether the basic main-menu tutorial tips have already been shown.",
  g_radio_saved_state:
    "Remembers whether the radio was playing, and which station, when you last exited.",
  g_radio_stream_safe:
    "Streamer-safe mode: filters out music that could trigger copyright claims (DMCA) on stream.",
  g_radio_mode: "Radio audio source. 0 = off, 1 = online streaming, 2 = local MP3 files.",

  // Graphics Presets & Environment
  g_gfx_quality:
    "Overall graphics preset, from 0 (Low) to 3 (Ultra). -1 means a custom mix of settings is in use.",
  g_gfx_advanced: "Shows detailed/advanced options in the graphics settings menu.",
  g_gfx_all_scales: "When enabled, adjusts all resolution-scaling options together as one.",
  g_grass_density:
    "Amount of grass and ground vegetation rendered, from 0 (none) to 3 (dense). Affects performance in green areas.",
  g_veg_detail:
    "Visual detail and draw distance for trees and bushes. Higher looks better but costs performance.",
  g_reflection:
    "Detail level of reflections on windows, chrome, and metallic surfaces. Higher costs more performance.",
  g_reflection_scale: "Internal resolution used for reflections. -1 sets it automatically.",
  g_water_reflect_actor: "Shows your own truck reflected in water surfaces.",
  g_water_reflect_traffic: "Shows AI traffic vehicles reflected in water surfaces.",
  g_water_reflect_cache: "Caches water reflections to reduce their performance cost.",
  g_rain_reflection: "Shows a wet-asphalt mirror effect on roads during rain.",
  g_rain_reflect_actor: "Shows your own truck reflected on wet asphalt.",
  g_rain_reflect_traffic: "Shows AI traffic reflected on wet asphalt.",
  g_rain_reflect_hookups: "Shows environment lights (poles, signs) reflected on wet asphalt.",
  g_rain_reflect_cache: "Caches wet-road reflections to reduce their performance cost.",
  g_rain_sensor: "Automatically activates windshield wipers when rain is detected.",

  // Developer / Debug Access
  g_developer:
    "Enables developer mode: advanced commands, free camera, and testing tools. Not intended for normal play.",
  g_console: "Enables the in-game command console, opened with the ' or ~ key.",
  g_console_state:
    "Internal flag: whether the console was open or closed when you last exited (0 = closed).",
  g_fps: "Shows an on-screen FPS and performance counter.",
  g_minicon: "Shows a compact, live version of the console log at the top of the screen.",
  g_debug_map_limits:
    "Debug tool: shows the boundaries of the playable world map. Not for normal use.",
  g_steam_screenshots: "Uses Steam's built-in system to capture and save screenshots.",
  g_steam_browser: "Opens external links using Steam's built-in browser.",
  g_steam_rich_presence:
    "Shows what you're doing in-game (e.g. 'Driving in Berlin') on your Steam profile.",
  g_online_loading_screens: "Downloads community-made loading screen photos from World of Trucks.",
  g_news: "Shows SCS news and update announcements on the main menu.",

  // Frame Rate & Timing
  t_limit_fps:
    "Caps the maximum frame rate — useful to reduce heat and power use, or to match your monitor.",
  t_limit_fps_inactive:
    "Sharply lowers the frame rate when the game window is minimized or unfocused.",
  t_locked_fps:
    "Attempts to hold the game at a fixed frame rate for smoother, more consistent motion.",
  t_averaging_window_duration: "Time window (ms) used to calculate the displayed average FPS.",
  t_averaging_window_length: "Number of frames used when calculating performance statistics.",
  t_ignore_hmd_timing: "Debug option: ignores VR headset timing sync when benchmarking frame rate.",

  // UI Behavior
  ui_tooltip_delay: "How long the mouse must hover over an item before its tooltip appears.",
};
