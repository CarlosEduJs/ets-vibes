export interface ConfigRange {
  min: number;
  max: number;
  step: number;
}

export const CONFIG_RANGES: Record<string, ConfigRange> = {
  g_traffic: { min: 0, max: 10, step: 0.1 },
  r_sun_shadow_texture_size: { min: 1024, max: 8192, step: 256 },
  r_buffer_page_size: { min: 10, max: 50, step: 1 },
  t_limit_fps: { min: 30, max: 360, step: 1 },
  r_mirror_view_distance: { min: 80, max: 400, step: 10 },
  g_lod_factor_traffic: { min: 1, max: 5, step: 0.1 },
  g_lod_factor_parked: { min: 1, max: 5, step: 0.1 },
  g_upshift_coef: { min: 0.1, max: 0.9, step: 0.01 },
  g_downshift_coef: { min: 0.1, max: 0.9, step: 0.01 },
  g_flyspeed: { min: 10, max: 500, step: 10 },
};
