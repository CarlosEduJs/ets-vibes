# config.cfg Format Reference

## Structure

Plaintext UTF-8 file with one configuration entry per line. No encryption or compression (unlike `game.sii`). Found at the game's root directory (next to `profiles/`). The game auto-writes this file on settings changes and reads it at startup.

Line format:

```
<prefix> <key> "<value>"
```

- Lines starting with `#` are comments and are skipped on parse.
- Empty lines are skipped.
- The value is always quoted in the raw file (double quotes). The parser strips surrounding `"` on read and re-adds them on write.
- The prefix is always `uset` (user setting) in current versions.

## Parsing Behavior

Implemented in `save_parser/config.rs` (`ConfigDocument::parse`):

1. Trim whitespace per line.
2. Skip if empty or starts with `#`.
3. Split on first two spaces into `[prefix, key, value]`.
4. `value` is `trim_matches('"')`.
5. Each entry is annotated with a `ConfigCategory` (via prefix matching) and a `ConfigValueType` (inferred from value string).

## Serialization Behavior

Display/output reconstructs each line as `{prefix} {key} "{value}"\n`. **Comments are not preserved** on roundtrip (the parser discards them).

## Value Type Inference

Applied automatically when parsing. Used by the frontend to select the appropriate editor widget.

| Inferred Type | Rule                            | Example                                   |
| ------------- | ------------------------------- | ----------------------------------------- |
| `Int`         | Parses as `i64`                 | `0`, `-1`, `300`, `1920`                  |
| `Float`       | Parses as `f64` (but not `i64`) | `1.0`, `-0.5`, `100.0`                    |
| `Bool`        | Case-insensitive `true`/`false` | `true`, `False`, `TRUE`                   |
| `String`      | Everything else                 | `jpg`, `pt_br`, `.ogg;.mp3`, empty string |

**Note:** `0` and `1` are always inferred as `Int`, never `Bool`. Boolean config keys use `0`/`1` as integers in practice (e.g., `g_console "0"`).

## Category System

Defined in `core/config_category.rs` via prefix-based matching (priority order):

| Category            | Prefix / Key Pattern                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `Multi Monitor`     | `r_multimon_*`                                                                                |
| `VR`                | `r_manual_stereo_*`, `r_hmd_*`, `r_ipd_scale`                                                 |
| `Sound`             | `s_*`                                                                                         |
| `Input`             | `i_*`                                                                                         |
| `Framerate`         | `t_*`                                                                                         |
| `UI`                | `ui_*`                                                                                        |
| `Developer` (v\_)   | `v_*`                                                                                         |
| `Radio`             | `g_radio_*`                                                                                   |
| `Steam`             | `g_steam_*`, `g_online_loading_screens`, `g_news`                                             |
| `Developer` (g\_)   | `g_developer`, `g_console`, `g_fps`, `g_minicon`, `g_debug_*`                                 |
| `Graphics Advanced` | `g_bloom*`, `g_gfx_*`, `g_grass*`, `g_veg_*`, `g_reflection*`, `g_water_reflect*`, `g_rain_*` |
| `Gameplay`          | `g_*` (catch-all)                                                                             |
| `Graphics`          | `r_*` (catch-all)                                                                             |
| `Misc`              | Everything else                                                                               |

## Game Path Detection

Implemented in `core/detection.rs` (`find_config_files`). On Linux:

| Path Pattern                                                                                       | Description                |
| -------------------------------------------------------------------------------------------------- | -------------------------- |
| `~/.local/share/Euro Truck Simulator 2/config.cfg`                                                 | Native install / non-Steam |
| `~/.steam/steam/userdata/<steam_userid>/227300/remote/config.cfg`                                  | Steam (default)            |
| `~/.local/share/Steam/userdata/<steam_userid>/227300/remote/config.cfg`                            | Steam (alternative)        |
| `~/.var/app/com.valvesoftware.Steam/.steam/steam/userdata/<steam_userid>/227300/remote/config.cfg` | Steam (Flatpak)            |

For ATS, app ID is `270880`.

## Complete Property Reference (ETS2 1.60)

All 225 keys found in a real 1.60.1.7 config, organized by category.

### Graphics (`r_*`) — 65 entries

Resolution, display mode, rendering features, shadow/light quality.

| Key                            | Type   | Example | Description                           |
| ------------------------------ | ------ | ------- | ------------------------------------- |
| `r_mode_width`                 | Int    | `1920`  | Horizontal resolution                 |
| `r_mode_height`                | Int    | `1080`  | Vertical resolution                   |
| `r_mode_refresh`               | Int    | `0`     | Refresh rate override (0 = default)   |
| `r_fullscreen`                 | Int    | `1`     | Fullscreen mode                       |
| `r_fullscreen_borderless`      | Int    | `-1`    | Borderless fullscreen (-1 = disabled) |
| `r_windowed_borderless`        | Int    | `-1`    | Windowed borderless (-1 = disabled)   |
| `r_vsync`                      | Int    | `1`     | VSync on/off                          |
| `r_device`                     | String | `""`    | Render device override (empty = auto) |
| `r_adapter`                    | Int    | `-1`    | GPU adapter index (-1 = auto)         |
| `r_output`                     | Int    | `-1`    | Display output index (-1 = auto)      |
| `r_path`                       | String | `""`    | Render path override                  |
| `r_vulkan_runtime`             | String | `""`    | Vulkan runtime path override          |
| `r_scale_x`                    | Float  | `1`     | Horizontal scaling                    |
| `r_scale_y`                    | Float  | `1`     | Vertical scaling                      |
| `r_anisotropy_factor`          | Int    | `0`     | Anisotropic filtering (0 = off)       |
| `r_texture_detail`             | Int    | `2`     | Texture quality (0-3)                 |
| `r_normal_maps`                | Int    | `0`     | Normal mapping on/off                 |
| `r_ssao`                       | Int    | `0`     | SSAO on/off                           |
| `r_aa`                         | Int    | `0`     | Anti-aliasing (0 = off, 1+ = mode)    |
| `r_taa_tuning`                 | Int    | `0`     | TAA tuning preset                     |
| `r_taa_luma_sharpen`           | Int    | `1`     | TAA luma sharpen on/off               |
| `r_taa_modulated_drr_strength` | Float  | `0.0`   | TAA modulated DRR strength            |
| `r_drr_strength`               | Float  | `8.0`   | Dynamic resolution scaling strength   |
| `r_sun_shadow_texture_size`    | Int    | `2048`  | Sun shadow map resolution             |
| `r_sun_shadow_quality`         | Int    | `0`     | Sun shadow quality (0-3)              |
| `r_fake_shadows`               | Int    | `1`     | Fake/dynamic shadows on/off           |
| `r_interior_shadow`            | Int    | `0`     | Interior shadows on/off               |
| `r_cloud_shadows`              | Int    | `1`     | Cloud shadows on/off                  |
| `r_light_flares`               | Int    | `1`     | Light flares on/off                   |
| `r_mirror_group`               | Int    | `3`     | Mirror detail group (0-3)             |
| `r_mirror_view_distance`       | Int    | `80`    | Mirror view distance                  |
| `r_mirror_scale_x`             | Float  | `1`     | Mirror horizontal scale               |
| `r_mirror_scale_y`             | Float  | `1`     | Mirror vertical scale                 |
| `r_deferred_mirrors`           | Int    | `0`     | Deferred mirror rendering on/off      |
| `r_color_correction`           | Int    | `0`     | Color correction mode                 |
| `r_color_saturation`           | Float  | `1.0`   | Color saturation                      |
| `r_color_yellow_blue`          | Float  | `0.0`   | Yellow-blue color balance             |
| `r_color_magenta_green`        | Float  | `0.0`   | Magenta-green color balance           |
| `r_color_cyan_red`             | Float  | `0.0`   | Cyan-red color balance                |
| `r_sunshafts`                  | Int    | `0`     | Sunshafts on/off                      |
| `r_dof`                        | Int    | `0`     | Depth of field on/off                 |
| `r_dof_start`                  | Float  | `200.0` | DOF start distance                    |
| `r_dof_transition`             | Float  | `400.0` | DOF transition distance               |
| `r_dof_filter_size`            | Float  | `0.5`   | DOF blur filter size                  |
| `r_hdr_display_gray_offset`    | Float  | `0.0`   | HDR gray offset (display calibration) |
| `r_hdr_display_white`          | Float  | `-1.0`  | HDR white point (-1 = auto)           |
| `r_hdr_display_black`          | Float  | `-1.0`  | HDR black point (-1 = auto)           |
| `r_sdr_display_gray_offset`    | Float  | `0.0`   | SDR gray offset                       |
| `r_sdr_display_white`          | Float  | `1`     | SDR white point                       |
| `r_sdr_display_black`          | Float  | `0`     | SDR black point                       |
| `r_peak_brightness`            | Float  | `1.0`   | Peak brightness nits (HDR)            |
| `r_far_shadow_disable`         | Int    | `1`     | Far shadow disable (performance)      |
| `r_show_sun_cascades`          | Int    | `0`     | Debug: show sun shadow cascades       |
| `r_tonemap_debug`              | Int    | `0`     | Debug: tonemap visualization          |
| `r_use_depth_bounds`           | Int    | `1`     | Use depth bounds test                 |
| `r_hide_helpers`               | Int    | `0`     | Hide helper objects                   |
| `r_interior_raindrops`         | Int    | `0`     | Interior rain drops effect            |
| `r_buffer_page_size`           | Int    | `10`    | Buffer page size                      |
| `r_deferred_debug`             | Int    | `0`     | Debug: deferred rendering             |
| `r_nowmi`                      | Int    | `0`     | No WMI (Windows-only)                 |
| `r_startup_progress`           | Int    | `0`     | Startup progress display              |
| `r_setup_done`                 | Int    | `1`     | First-time setup completed            |
| `r_imgui_scale`                | Float  | `1.0`   | ImGui UI scale (dev tools)            |
| `r_no_frame_tracking`          | Int    | `0`     | Frame tracking on/off                 |
| `r_minimal_unfinished_frames`  | Int    | `0`     | Minimal unfinished frames             |

### Multi Monitor (`r_multimon_*`) — 13 entries

| Key                            | Type  | Example | Description                   |
| ------------------------------ | ----- | ------- | ----------------------------- |
| `r_multimon_mode`              | Int   | `0`     | Multi-monitor mode (0 = off)  |
| `r_multimon_fov_horizontal`    | Float | `50`    | Horizontal FOV per monitor    |
| `r_multimon_fov_vertical`      | Float | `0`     | Vertical FOV (0 = auto)       |
| `r_multimon_rotation_center`   | Float | `0`     | Center monitor rotation (deg) |
| `r_multimon_rotation_left`     | Float | `0`     | Left monitor rotation (deg)   |
| `r_multimon_rotation_right`    | Float | `0`     | Right monitor rotation (deg)  |
| `r_multimon_rotation_aux`      | Float | `0`     | Aux monitor rotation (deg)    |
| `r_multimon_vert_offset_left`  | Float | `0`     | Left monitor vertical offset  |
| `r_multimon_vert_offset_right` | Float | `0`     | Right monitor vertical offset |
| `r_multimon_border_fov_left`   | Float | `0`     | Left bezel correction FOV     |
| `r_multimon_border_fov_right`  | Float | `0`     | Right bezel correction FOV    |
| `r_multimon_interior_in_main`  | Int   | `1`     | Interior view on main monitor |
| `r_multimon_exterior_in_aux`   | Int   | `0`     | Exterior view on aux monitor  |

### VR (`r_manual_stereo_*`, `r_hmd_*`, `r_ipd_scale`) — 24 entries

| Key                               | Type  | Example | Description                    |
| --------------------------------- | ----- | ------- | ------------------------------ |
| `r_manual_stereo_buffer_scale`    | Float | `1.0`   | Stereo render buffer scale     |
| `r_manual_stereo_ui_buffer_scale` | Float | `2.0`   | UI buffer oversampling         |
| `r_manual_stereo_ui_fov`          | Int   | `65`    | UI FOV (flat)                  |
| `r_manual_stereo_ui_fov_game`     | Int   | `100`   | UI FOV (in-game)               |
| `r_manual_stereo_ui_static_fov`   | Int   | `40`    | UI static FOV (menus)          |
| `r_manual_stereo_ui_dist`         | Float | `1`     | UI distance (flat)             |
| `r_manual_stereo_ui_dist_game`    | Float | `0.5`   | UI distance (in-game)          |
| `r_manual_stereo_ui_radius`       | Float | `3.0`   | UI radius (flat)               |
| `r_manual_stereo_ui_radius_game`  | Float | `0.0`   | UI radius (in-game)            |
| `r_manual_stereo_ui_x`            | Float | `0.0`   | UI horizontal offset (flat)    |
| `r_manual_stereo_ui_y`            | Float | `-0.5`  | UI vertical offset (flat)      |
| `r_manual_stereo_ui_x_game`       | Float | `0.5`   | UI horizontal offset (in-game) |
| `r_manual_stereo_ui_y_game`       | Float | `-0.2`  | UI vertical offset (in-game)   |
| `r_manual_stereo_ui_yaw`          | Float | `0.0`   | UI yaw rotation (flat)         |
| `r_manual_stereo_ui_pitch`        | Float | `-30.0` | UI pitch rotation (flat)       |
| `r_manual_stereo_ui_yaw_game`     | Float | `-40.0` | UI yaw rotation (in-game)      |
| `r_manual_stereo_ui_pitch_game`   | Float | `-10.0` | UI pitch rotation (in-game)    |
| `r_manual_stereo_ui_lod_bias`     | Float | `-0.75` | UI LOD bias                    |
| `r_manual_stereo_ui_mipmaps`      | Int   | `1`     | UI mipmaps on/off              |
| `r_manual_stereo_mirror_mode`     | Int   | `1`     | Mirror mode in VR              |
| `r_hmd_controller_shadows`        | Int   | `0`     | HMD controller shadows         |
| `r_hmd_draw_controllers`          | Int   | `0`     | Draw VR controllers            |
| `r_hmd_water_pixels_per_deg`      | Float | `20.0`  | Water resolution in VR (ppd)   |
| `r_ipd_scale`                     | Float | `1.0`   | IPD scale factor               |

### Sound (`s_*`) — 10 entries

| Key                         | Type   | Example | Description                  |
| --------------------------- | ------ | ------- | ---------------------------- |
| `s_init_master_volume`      | Float  | `0.75`  | Master volume                |
| `s_init_master_mute`        | Int    | `0`     | Master mute                  |
| `s_init_ui_music_volume`    | Float  | `0.5`   | UI music volume              |
| `s_init_ui_music_mute`      | Int    | `0`     | UI music mute                |
| `s_init_intro_music_volume` | Float  | `0.5`   | Intro music volume           |
| `s_init_intro_music_mute`   | Int    | `0`     | Intro music mute             |
| `s_output_driver`           | String | `""`    | Audio output device override |
| `s_live_update`             | Int    | `0`     | Live audio update            |
| `s_suspend_sound`           | Int    | `1`     | Suspend sound on focus loss  |
| `s_sound_debug`             | Int    | `0`     | Debug: sound visualization   |

### Input (`i_*`) — 3 entries

| Key                               | Type  | Example | Description                           |
| --------------------------------- | ----- | ------- | ------------------------------------- |
| `i_controller_cursor_speed`       | Float | `800.0` | Controller cursor speed               |
| `i_cursor_force_spd_mlt`          | Float | `0.75`  | Cursor force speed multiplier (wheel) |
| `i_cursor_semantic_force_spd_mlt` | Float | `0.35`  | Semantic force speed multiplier       |

### Gameplay (`g_*` catch-all) — 71 entries

This category acts as a catch-all for `g_` prefixed keys that don't match the more specific sub-categories above. It contains a wide range of settings.

| Key                             | Type   | Example      | Description                                  |
| ------------------------------- | ------ | ------------ | -------------------------------------------- |
| `g_traffic`                     | Float  | `1.0`        | Traffic density multiplier                   |
| `g_pedestrian`                  | Int    | `0`          | Pedestrians on/off                           |
| `g_lod_factor_traffic`          | Float  | `1`          | Traffic LOD multiplier                       |
| `g_lod_factor_pedestrian`       | Int    | `2`          | Pedestrian LOD multiplier                    |
| `g_lod_factor_parked`           | Float  | `5.0`        | Parked car LOD multiplier                    |
| `g_vehicle_flare_lights`        | Int    | `0`          | Vehicle flare lights on/off                  |
| `g_auto_traffic_headlights`     | Int    | `0`          | Auto traffic headlights on/off               |
| `g_light_span_factor`           | Float  | `0`          | Light span factor                            |
| `g_light_distance_factor`       | Float  | `0`          | Light distance factor                        |
| `g_anti_slip`                   | Int    | `1`          | Anti-slip control on/off                     |
| `g_abs`                         | Int    | `1`          | ABS on/off                                   |
| `g_bumps`                       | Float  | `1.0`        | Bumps intensity multiplier                   |
| `g_intelligent_transmission`    | Int    | `0`          | Intelligent transmission on/off              |
| `g_upshift_coef`                | Float  | `0.3`        | Upshift coefficient                          |
| `g_downshift_coef`              | Float  | `0.8`        | Downshift coefficient                        |
| `g_spec_trans_refill_tank`      | Int    | `1`          | Refill tank on service                       |
| `g_trailer_cables_mode`         | Int    | `2`          | Trailer cable mode                           |
| `g_suspension_auto_reset`       | Int    | `1`          | Auto-reset suspension                        |
| `g_save_format`                 | Int    | `2`          | Save format (2 = ASCII, was 1 = binary BSII) |
| `g_save_indicator`              | Int    | `1`          | Save indicator popup on/off                  |
| `g_game_version`                | String | `1.60.1.7`   | Last game version that wrote this config     |
| `g_lang_init`                   | String | `pt_br`      | Language setting                             |
| `g_stream_exts`                 | String | `.ogg;.mp3`  | Allowed stream audio extensions              |
| `g_album_image`                 | Int    | `0`          | Album art display on/off                     |
| `g_thrustmaster`                | Int    | `1`          | Thrustmaster peripheral support              |
| `g_tobii`                       | Int    | `1`          | Tobii eye tracker support                    |
| `g_trackir`                     | Int    | `1`          | TrackIR support                              |
| `g_disable_hud_activation`      | Int    | `0`          | Disable HUD activation on/off                |
| `g_interior_camera_zero_pitch`  | Int    | `0`          | Interior camera zero pitch                   |
| `g_color_feedback`              | Int    | `1`          | Color feedback UI on/off                     |
| `g_truck_light_specular`        | Int    | `1`          | Truck light specular on/off                  |
| `g_hq_3d_scale`                 | Float  | `0.0`        | HQ 3D scale                                  |
| `g_hq_3d_screenshot`            | Int    | `0`          | HQ 3D screenshot mode                        |
| `g_menu_aa_limit`               | Int    | `8`          | Menu AA limit                                |
| `g_additional_water_fov`        | String | `20.0f`      | Additional water FOV                         |
| `g_screenshot_on_bug`           | Int    | `0`          | Auto-screenshot on bug report                |
| `g_screenshot_on_bug_quality`   | Int    | `100`        | Bug screenshot JPEG quality                  |
| `g_city_name_move`              | Int    | `0`          | City name movement effect                    |
| `g_kdop_preview`                | Int    | `0`          | Debug: K-DOP preview                         |
| `g_assert_dump`                 | Int    | `0`          | Assert dump on/off                           |
| `g_colbox`                      | Int    | `0`          | Debug: collision box display                 |
| `g_col_offset_factor`           | Float  | `1.0`        | Collision offset factor                      |
| `g_col_fill_backface`           | Int    | `0`          | Debug: collision fill backface               |
| `g_col_fill_alpha`              | Float  | `0.0`        | Debug: collision fill alpha                  |
| `g_glass_debugging_level`       | Int    | `0`          | Glass debugging level                        |
| `g_line_sort`                   | Int    | `0`          | Line sort mode                               |
| `g_cargo_sort`                  | Int    | `10`         | Cargo sort mode                              |
| `g_editor_zoom_speed`           | Float  | `1.0`        | Editor zoom speed                            |
| `g_map_note_user_id`            | Int    | `0`          | Map note user ID                             |
| `g_desktop_fadeout`             | Int    | `60`         | Desktop fadeout timer (seconds)              |
| `g_item_check_speed`            | Float  | `-1`         | Item check speed (-1 = default)              |
| `g_debug_allocators`            | Float  | `-1`         | Debug: allocator settings                    |
| `g_hw_info`                     | Int    | `1`          | Hardware info collection on/off              |
| `g_sns`                         | String | `""`         | Social network sharing                       |
| `g_global_force_load_selector`  | Int    | `0`          | Force load selector                          |
| `g_semantical_pause_inactivity` | Int    | `120`        | Auto-pause after inactivity (sec)            |
| `g_semantical_ff_inactivity`    | Int    | `300`        | Fast-forward after inactivity (sec)          |
| `g_pause_on_disconnect`         | Int    | `1`          | Pause on controller disconnect               |
| `g_ignore_low_fps`              | Int    | `0`          | Ignore low FPS warning                       |
| `g_artist_id`                   | Int    | `0`          | Artist ID (radio)                            |
| `g_force_online_lscrs`          | Int    | `0`          | Force online loading screens                 |
| `g_flyspeed`                    | Float  | `100.0`      | Developer fly mode speed                     |
| `g_frame_image_fmt`             | String | `jpg`        | Screenshot image format                      |
| `g_frames_path`                 | String | `""`         | Screenshots save path                        |
| `g_convoy_allow_load`           | Int    | `0`          | Allow loading convoy saves                   |
| `g_max_convoy_size`             | Int    | `8`          | Max convoy size                              |
| `g_last_hidden_dlc_widget_name` | String | `""`         | Last hidden DLC widget                       |
| `g_last_seen_dlc_release_date`  | Int    | `1764230400` | Last seen DLC release date (Unix ts)         |
| `g_last_seen_patch_notes_hash`  | Int    | `0`          | Last seen patch notes hash                   |
| `g_academy_book_count`          | Int    | `3`          | Academy unread book count                    |
| `g_mm_help_shown`               | Int    | `1`          | Main menu help shown                         |
| `g_radio_saved_state`           | Int    | `0`          | Radio saved play state                       |
| `g_radio_stream_safe`           | Int    | `0`          | Radio stream safe mode                       |
| `g_radio_mode`                  | Int    | `2`          | Radio mode (0=off, 1=stream, 2=file)         |

### Graphics Advanced (`g_bloom*`, `g_gfx_*`, `g_grass*`, `g_veg_*`, `g_reflection*`, `g_water_reflect*`, `g_rain_*`) — 17 entries

| Key                          | Type  | Example | Description                           |
| ---------------------------- | ----- | ------- | ------------------------------------- |
| `g_bloom`                    | Float | `1.0`   | Bloom intensity                       |
| `g_bloom_override`           | Int   | `0`     | Bloom override on/off                 |
| `g_bloom_standard_deviation` | Float | `0.5`   | Bloom standard deviation              |
| `g_gfx_quality`              | Int   | `-1`    | Graphics quality preset (-1 = custom) |
| `g_gfx_advanced`             | Int   | `1`     | Advanced graphics options on/off      |
| `g_gfx_all_scales`           | Int   | `0`     | Scale all graphics together on/off    |
| `g_grass_density`            | Float | `0`     | Grass density (0-3 in older versions) |
| `g_veg_detail`               | Float | `0`     | Vegetation detail                     |
| `g_reflection`               | Int   | `0`     | Reflection quality                    |
| `g_reflection_scale`         | Float | `-1`    | Reflection scale (-1 = auto)          |
| `g_water_reflect_actor`      | Int   | `0`     | Water: reflect actor                  |
| `g_water_reflect_traffic`    | Int   | `0`     | Water: reflect traffic                |
| `g_water_reflect_cache`      | Int   | `0`     | Water: reflection cache               |
| `g_rain_reflection`          | Int   | `0`     | Rain reflections on/off               |
| `g_rain_reflect_actor`       | Int   | `0`     | Rain: reflect actor                   |
| `g_rain_reflect_traffic`     | Int   | `0`     | Rain: reflect traffic                 |
| `g_rain_reflect_hookups`     | Int   | `0`     | Rain: reflect hookups                 |
| `g_rain_reflect_cache`       | Int   | `0`     | Rain: reflection cache                |
| `g_rain_sensor`              | Int   | `0`     | Rain sensor on/off                    |

### Developer (`g_developer`, `g_console`, `g_fps`, `g_minicon`, `g_debug_*`, `v_*`) — 7 entries

| Key                  | Type | Example | Description                |
| -------------------- | ---- | ------- | -------------------------- |
| `g_developer`        | Int  | `0`     | Developer mode on/off      |
| `g_console`          | Int  | `0`     | Console on/off             |
| `g_console_state`    | Int  | `0`     | Console state (0 = closed) |
| `g_fps`              | Int  | `0`     | FPS counter on/off         |
| `g_minicon`          | Int  | `0`     | Mini console on/off        |
| `g_debug_map_limits` | Int  | `0`     | Debug: show map limits     |
| `v_bug_break`        | Int  | `0`     | Break on bug report        |

### Steam (`g_steam_*`, `g_online_loading_screens`, `g_news`) — 5 entries

| Key                        | Type | Example | Description                   |
| -------------------------- | ---- | ------- | ----------------------------- |
| `g_steam_screenshots`      | Int  | `2`     | Steam screenshot mode         |
| `g_steam_browser`          | Int  | `1`     | Steam overlay browser on/off  |
| `g_steam_rich_presence`    | Int  | `1`     | Steam rich presence on/off    |
| `g_online_loading_screens` | Int  | `0`     | Online loading screens on/off |
| `g_news`                   | Int  | `0`     | News feed on/off              |

### Radio (`g_radio_*`) — 3 entries

| Key                    | Type | Example | Description                                    |
| ---------------------- | ---- | ------- | ---------------------------------------------- |
| `g_radio_truck`        | Int  | —       | _Not present in 1.60_                          |
| `g_radio_music_volume` | Int  | —       | _Replaced by `s_init_\*` system? Not in 1.60\_ |

Only `g_radio_saved_state`, `g_radio_stream_safe`, `g_radio_mode` found in 1.60.

### Framerate (`t_*`) — 6 entries

| Key                           | Type | Example | Description                |
| ----------------------------- | ---- | ------- | -------------------------- |
| `t_limit_fps`                 | Int  | `300`   | FPS limit (menu/loading)   |
| `t_limit_fps_inactive`        | Int  | `40`    | FPS limit when inactive    |
| `t_locked_fps`                | Int  | `0`     | Locked FPS                 |
| `t_averaging_window_duration` | Int  | `100`   | FPS averaging window (ms)  |
| `t_averaging_window_length`   | Int  | `10`    | FPS averaging sample count |
| `t_ignore_hmd_timing`         | Int  | `0`     | Ignore HMD timing for FPS  |

### UI (`ui_*`) — 1 entry

| Key                | Type  | Example | Description             |
| ------------------ | ----- | ------- | ----------------------- |
| `ui_tooltip_delay` | Float | `0.4`   | Tooltip delay (seconds) |

## Value Formats

### Standard entries

```
uset g_traffic "1.0"
uset r_fullscreen "1"
uset g_developer "0"
uset g_save_format "2"
```

### String values

```
uset g_lang_init "pt_br"
uset g_stream_exts ".ogg;.mp3"
uset g_frame_image_fmt "jpg"
uset g_game_version "1.60.1.7"
uset g_frames_path ""
```

### Suffix `f` on floats

Some float values in 1.60 carry a trailing `f`:

```
uset g_additional_water_fov "20.0f"
```

The parser treats this as a `String` type (not `Float`) because `"20.0f"` does not parse as `f64`. The game engine appears to accept it.

## Serialization & Backup

- **Write**: `ConfigDocument::to_string()` outputs `{prefix} {key} "{value}"\n` for each entry.
- **Backup**: Before writing, `backup_file()` copies the current file to `<config_dir>/backup/<timestamp>/config.cfg`. Timestamp format: `%d-%m-%Y_%H-%M-%S`.
- **Comments are lost on roundtrip**: The parser discards `#` comment lines during `parse()`, and `Display` does not re-add them.

## Version Caveats

- The format is relatively stable: `uset <key> "<value>"` pattern has been unchanged for many years.
- Keys are frequently added, renamed, or removed across ETS2 versions.
- The `g_save_format "2"` setting controls whether saves are written as ASCII (`2`) or binary BSII (`1`). This app requires format `2`.
- Game version is recorded in the file as `g_game_version` (e.g., `"1.60.1.7"`).
- The application validates each entry before writing, rejecting invalid types per the inferred `ConfigValueType`.
- Only entries present in the original file can be edited (the parser does not support adding new keys — `set` is a no-op on missing keys).

## Not Found in 1.60 config.cfg

These were present in older versions or are commonly expected but not in the tested 1.60.1.7 config:

| Key                             | Reason                                    |
| ------------------------------- | ----------------------------------------- |
| `g_radio_truck`                 | Not in 1.60 config                        |
| `g_radio_music_volume`          | Not in 1.60 config (moved to `s_init_*`?) |
| `g_simple_parking`              | Not in 1.60 config                        |
| `r_scale`                       | Replaced by `r_scale_x` / `r_scale_y`     |
| `r_hmd_enabled`                 | Not in 1.60 config                        |
| `s_volume`, `s_mix_rate`        | Replaced by `s_init_*` system             |
| `i_joy_steering`, `i_fft_setup` | Not in 1.60 config                        |
| `t_limiter`                     | Replaced by `t_limit_fps`                 |
| `ui_scale`                      | Not in 1.60 config                        |
| `v_sync`                        | Replaced by `r_vsync`                     |

## Technical Note: `g_save_format` Impact

If `g_save_format` is `1`, the game writes saves in binary BSII format (magic `BSII`), which this application does **not** support. The load error message advises:

> "Binary format BSII not supported. Load the save in Euro Truck Simulator 2 and save again to convert, or set g_save_format 2 in config.cfg."

The config editor in this app can change this value to `2`, which fixes the issue.
