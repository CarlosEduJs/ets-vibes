# game.sii Format Reference

## Structure

Compressed with AES-256-CBC + zlib (magic bytes `ScsC`). Decompressed content is a plaintext SII document (`SiiNunit` format).

Top-level structure:
```
SiiNunit
{
  <section_type>: <section_name> {
    <property>: <value>
    <array_property[N]>: <value>
  }
  ...
}
```

## Detected Properties (ETS2 1.58+)

### Player Save Data (top-level block)

Found after `experience_points`, before `user_colors`:

| Property | Type | Range | Description |
|---|---|---|---|
| `money_account` | i64 | - | Player's money |
| `experience_points` | i64 | 0+ | Total XP |
| `adr` | u8 (bitmask) | 0-63 | ADR classes (bit 0-5 = class 1-6) |
| `long_dist` | u8 | 0-6 | Long distance skill |
| `heavy` | u8 | 0-6 | Heavy cargo skill |
| `fragile` | u8 | 0-6 | Fragile cargo skill |
| `urgent` | u8 | 0-6 | Urgent/express skill |
| `mechanical` | u8 | 0-6 | Mechanical skill |

Note: `eco`, `high_value`, `just_in_time` do NOT exist in ETS2 1.58+ (removed in 1.53 rework).

### Player Section

```
player : _nameless.XX.XXXX.XXXX {
```

| Property | Type | Description |
|---|---|---|
| `hq_city` | string | Headquarters city name |
| `trucks` | u32 | Number of trucks owned |
| `trucks[N]` | ref | Reference to truck unit |
| `drivers` | u32 | Number of hired drivers |
| `drivers[N]` | ref | Reference to driver unit |
| `trailers` | u32 | Number of trailers owned |
| `trailers[N]` | ref | Reference to trailer unit |
| `driving_time` | u32 | Total driving time (seconds) |
| `free_roam_distance` | f32 | Free roam distance (km) |
| `my_truck` | ref | Current active truck |
| `my_trailer` | ref | Current attached trailer |
| `current_job` | ref | Current job |
| `current_bus_job` | ref/null | Current bus job |
| `gas_pump_money_debt` | i64 | Fuel debt |
| `flags` | u32 | Player flags bitmask |
| `assigned_truck` | ref/null | Truck assigned to driver |

### Truck Section

```
_nameless.XX.XXXX.XXXX {
```

| Property | Type | Description |
|---|---|---|
| `engine_wear` | float | Engine wear (0.0 = new, 1.0 = destroyed) |
| `engine_wear_unfixable` | float | Permanent engine wear |
| `transmission_wear` | float | Transmission wear |
| `transmission_wear_unfixable` | float | Permanent transmission wear |
| `cabin_wear` | float | Cabin wear |
| `cabin_wear_unfixable` | float | Permanent cabin wear |
| `chassis_wear` | float | Chassis wear |
| `chassis_wear_unfixable` | float | Permanent chassis wear |
| `fuel_relative` | float | Fuel level (0.0 = empty, 1.0 = full) |
| `odometer` | u32 | Odometer reading (km) |
| `odometer_float_part` | hex float | Fractional odometer part |
| `brand_id` | string | Truck brand identifier (NOT at top level) |
| `license_plate` | string | License plate text (with offset tags) |

### Trailer Section

Same wear properties as truck, but:
- No `engine_wear` / `transmission_wear` / `cabin_wear` (trailers have no engine)
- Has `chassis_wear` and `body_wear`

### Driver Section

```
driver.N {
```

| Property | Type | Description |
|---|---|---|
| `profit_log` | ref | Reference to profit log |

Driver personal skills appear in their own unnamed sections (same format as player skills).

## Wear Properties (Full List)

Properties that appear for EACH truck/trailer/driver combo (29 occurrences in typical save):

- `engine_wear`
- `engine_wear_unfixable`
- `transmission_wear`
- `transmission_wear_unfixable`
- `cabin_wear`
- `cabin_wear_unfixable`
- `chassis_wear`
- `chassis_wear_unfixable`
- `fuel_relative`
- `odometer`

Note: `wheel_wear` was NOT found in tested saves.

## Value Formats

### Standard values
```
money_account: 51769762
experience_points: 88698
trucks: 2
```

### Hex-encoded floats
Some floats are stored as hex IEEE 754 single-precision:
```
engine_wear: &3d5d0a88    // ~0.051
fuel_relative: &3e25b72d   // ~0.16
```

The leading `&` indicates hex encoding. The game engine also accepts plain decimal values (e.g., `0`, `1.0`).

### Array properties
```
trucks: 2
trucks[0]: _nameless.76d8.d52d.54b0
trucks[1]: _nameless.76d8.d42a.be10
```

## Reference Names

- `ref` values like `_nameless.76d8.d52d.54b0` are unique section identifiers
- `null` represents empty references
- Driver references use `driver.125` format

## Level Calculation

ETS2 does NOT store `level` in the save file. It is computed from `experience_points`:

```
level = floor((1 + sqrt(1 + 8 * xp / 100)) / 2)
```

XP for level N:
```
xp = N * (N - 1) / 2 * 100
```

## Not Found in game.sii

These properties commonly assumed to exist but were NOT found in tested saves:

| Property | Why |
|---|---|
| `level` | Derived from XP |
| `current_truck` | Use `my_truck` in player section |
| `driven_distance` (total) | Only per-job `distance` exists |
| `total_driven_distance_km` | Only statistics sections (per-trailer) |
| `skill_points` | Not stored; game auto-allocates |
| `wheel_wear` | May not exist in current version |
| `high_value`, `just_in_time`, `eco` | Removed in 1.53 skill rework |

## Compression Format

- Magic: `ScsC` (4 bytes)
- Algorithm: AES-256-CBC + zlib (deflate)
- HMAC-SHA256 for integrity check
- For detailed implementation, see `crates/ets-save-parser/src/compression.rs`
