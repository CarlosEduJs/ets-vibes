# game.sii Format Reference

## Structure

### File Layout

A save consists of a directory with three files:

```
{profile_path}/
  profile.sii           # Profile metadata (name, mods, cached stats)
  save/
    {save_name}/
      game.sii           # Main save data (SII text or ScsC binary)
      info.sii           # Save metadata (version, timestamp, DLC deps)
```

### SII Document Format

Decompressed `game.sii` and the other `.sii` files use the SCS `SiiNunit` format:

```
SiiNunit
{
  <section_type> : <section_name> {
    <property>: <value>
    <array_property[N]>: <value>
  }
  ...
}
```

- `section_type` — e.g., `player`, `vehicle`, `economy`, `bank`
- `section_name` — unique identifier, typically `_nameless.XX.XXXX.XXXX` or a named reference like `garage.berlin`
- `property: value` — key-value pairs separated by colon
- Lines can be indented with spaces or tabs (the parser is whitespace-agnostic within reason)
- Quoted values: strings like license plates are quoted (`"ABC-1234"`), but most values are bare
- Booleans use `true` / `false` (lowercase)

## File Type Detection

Implemented in `save_parser/compression.rs`. The first 4 bytes (magic) determine the format:

| Magic  | Format                                  | Handling                                           |
| ------ | --------------------------------------- | -------------------------------------------------- |
| `ScsC` | AES-256-CBC encrypted + zlib compressed | Decrypt → decompress → UTF-8                       |
| `SiiN` | Plaintext SII                           | Direct UTF-8 string                                |
| `BSII` | Binary SII (legacy)                     | Returns error: set `g_save_format 2` in config.cfg |
| other  | Unknown                                 | Tries UTF-8; fails with `UnknownFormat`            |

Modern ETS2 (1.58+) uses `ScsC` for most saves, and `SiiN` for `profile.sii` and `info.sii` (which are never compressed).

## Compression Format (ScsC)

### Header (56 bytes)

```
Offset  Size  Field
------  ----  -----
0       4     Magic: "ScsC"
4       32    HMAC-SHA256 (IV + encrypted data)
36      16    IV (random, AES-CBC initialization vector)
52      4     Decompressed size (u32, little-endian)
56      *     Encrypted payload (AES-256-CBC of zlib-compressed SII)
```

### AES Key

Hardcoded constant shared by all ETS2/ATS installations (32 bytes):

```rust
const AES_KEY: [u8; 32] = [
    0x2a, 0x5f, 0xcb, 0x17, 0x91, 0xd2, 0x2f, 0xb6,
    0x02, 0x45, 0xb3, 0xd8, 0x36, 0x9e, 0xd0, 0xb2,
    0xc2, 0x73, 0x71, 0x56, 0x3f, 0xbf, 0x1f, 0x3c,
    0x9e, 0xdf, 0x6b, 0x11, 0x82, 0x5a, 0x5d, 0x0a,
];
```

### Decryption Pipeline

1. Read IV from `data[36..52]`
2. Read decompressed size from `data[52..56]`
3. Encrypted payload starts at `data[56..]`
4. Zero-pad to 16-byte boundary if needed
5. AES-256-CBC decrypt (NoPadding)
6. Zlib (deflate) decompress
7. If result starts with `BSII`, return error
8. Convert to UTF-8 string

### Encryption Pipeline

1. Zlib compress SII text (`Compression::best`)
2. Generate random 16-byte IV
3. AES-256-CBC encrypt (Pkcs7 padding)
4. HMAC-SHA256(`iv || encrypted_data`, key = AES_KEY)
5. Assemble: `ScsC` + HMAC + IV + decompressed_size + encrypted_data

## Parsing Behavior (SII Documents)

Implemented in `save_parser/sii.rs` via the `SiiDocument` struct.

### get_property

```rust
let pattern = format!(r"(?m)^\s*{}\s*:\s*(.+?)\s*$", regex::escape(property_name));
```

- Dynamically builds a regex that matches lines of the form `key: value`
- Uses multiline mode (`(?m)`) — `^` and `$` match line boundaries
- Returns the raw value string (with quotes if present, with `&` prefix if hex)
- Returns `None` if no match

### set_property

```rust
let pattern = format!(r"(?m)(^\s*{})\s*:\s*.+?(\s*$)", escaped);
let replacement = format!("${{1}}: {new_value}${{2}}");
```

- Captures and preserves leading whitespace (indentation) and trailing whitespace
- Uses `replace_all` — if the same property name appears in multiple sections, **all instances are replaced**
- Returns `Ok(true)` if the content changed

### get_array_property

1. Reads the count property (`cities: 3`)
2. Iterates indexed names (`cities[0]`, `cities[1]`, ...)
3. If an element is missing, returns an empty string for that slot

### set_array_property

1. Updates the count property
2. For each element, attempts `set_property` first
3. If the indexed property doesn't exist (new elements), **appends at the end of document** after the last property line found via `PROPERTY_RE.captures_iter`
4. This can insert array elements **outside their section** — see Known Quirks

### Static Regex

```rust
static PROPERTY_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?m)^\s*(?P<name>\w+(?:\[\d+\])?)\s*:\s*(?P<value>.+?)\s*$")
        .expect("invalid regex pattern")
});
```

Used by `set_array_property` to find the last property line in the document for appending.

### extract_section (helper in editor.rs)

Finds a section by header and extracts its content by counting brace depth (`{` increment, `}` decrement). Used by city unlock logic.

## Complete Section Reference (ETS2 1.58+)

### player Section

```
player : _nameless.XX.XXXX.XXXX {
```

| Property                  | Type     | Description                   |
| ------------------------- | -------- | ----------------------------- |
| `hq_city`                 | string   | Headquarters city name        |
| `trucks`                  | u32      | Number of trucks owned        |
| `trucks[N]`               | ref      | Reference to truck unit       |
| `drivers`                 | u32      | Number of hired drivers       |
| `drivers[N]`              | ref      | Reference to driver unit      |
| `trailers`                | u32      | Number of trailers owned      |
| `trailers[N]`             | ref      | Reference to trailer unit     |
| `driving_time`            | u32      | Total driving time (seconds)  |
| `free_roam_distance`      | f32      | Free roam distance (km)       |
| `my_truck`                | ref      | Current active truck          |
| `my_trailer`              | ref      | Current attached trailer      |
| `current_job`             | ref      | Current job                   |
| `current_bus_job`         | ref/null | Current bus job               |
| `gas_pump_money_debt`     | i64      | Fuel debt                     |
| `flags`                   | u32      | Player flags bitmask          |
| `assigned_truck`          | ref/null | Truck assigned to driver      |
| `visited_cities`          | u32      | Count of discovered cities    |
| `visited_cities[N]`       | string   | City name                     |
| `visited_cities_count`    | u32      | Count of visited city entries |
| `visited_cities_count[N]` | u32      | Visit count per city          |
| `cities`                  | u32      | Total available cities        |
| `cities[N]`               | string   | City name (full list)         |

### economy Section

```
economy : _nameless.XX.XXXX.XXXX {
```

| Property       | Type | Description                 |
| -------------- | ---- | --------------------------- |
| `bank`         | ref  | Reference to bank section   |
| `player`       | ref  | Reference to player section |
| `companies`    | u32  | Number of companies         |
| `companies[N]` | ref  | Reference to company        |
| `garages`      | u32  | Number of garages owned     |
| `garages[N]`   | ref  | Reference to garage         |

### bank Section

```
bank : _nameless.XX.XXXX.XXXX {
```

| Property            | Type    | Description                               |
| ------------------- | ------- | ----------------------------------------- |
| `money_account`     | i64     | Player's money                            |
| `coinsurance_fixed` | i64     | Insurance fixed cost                      |
| `coinsurance_ratio` | hex f32 | Insurance ratio (e.g., `&3dcccccd` = 0.1) |
| `accident_severity` | u32     | Accident severity counter                 |
| `loans`             | u32     | Active loan count                         |
| `loan_limit`        | i64     | Maximum loan amount                       |
| `app_enabled`       | bool    | Mobile app enabled                        |
| `overdraft`         | bool    | Overdraft enabled                         |

### driver_player Section

```
driver_player : driver.NNN {
```

| Property            | Type         | Range | Description                       |
| ------------------- | ------------ | ----- | --------------------------------- |
| `experience_points` | i64          | 0+    | Total XP                          |
| `adr`               | u8 (bitmask) | 0-63  | ADR classes (bit 0-5 = class 1-6) |
| `long_dist`         | u8           | 0-6   | Long distance skill               |
| `heavy`             | u8           | 0-6   | Heavy cargo skill                 |
| `fragile`           | u8           | 0-6   | Fragile cargo skill               |
| `urgent`            | u8           | 0-6   | Urgent/express skill              |
| `mechanical`        | u8           | 0-6   | Mechanical skill                  |

**Note:** `eco`, `high_value`, `just_in_time` removed in 1.53 skill rework.

### vehicle (Truck) Section

```
_nameless.XX.XXXX.XXXX {
```

| Property                      | Type            | Description                          |
| ----------------------------- | --------------- | ------------------------------------ |
| `license_plate`               | string (quoted) | License plate text                   |
| `odometer`                    | u32             | Odometer reading (km)                |
| `fuel_relative`               | hex f32         | Fuel level (0.0 = empty, 1.0 = full) |
| `engine_wear`                 | float           | Engine wear                          |
| `transmission_wear`           | float           | Transmission wear                    |
| `cabin_wear`                  | float           | Cabin wear                           |
| `chassis_wear`                | float           | Chassis wear                         |
| `engine_wear_unfixable`       | hex f32         | Permanent engine wear                |
| `transmission_wear_unfixable` | hex f32         | Permanent transmission wear          |
| `cabin_wear_unfixable`        | hex f32         | Permanent cabin wear                 |
| `chassis_wear_unfixable`      | hex f32         | Permanent chassis wear               |

Additional properties found in real saves but not in minimal test fixture:
| `brand_id` | string | Truck brand |
| `wheels_wear` | float | Wheel wear (may be `0` in some versions) |
| `odometer_float_part` | hex f32 | Fractional odometer part |

### Trailer Section

Same wear properties as truck minus:

- No `engine_wear` / `transmission_wear` / `cabin_wear`
- Has `chassis_wear` and `body_wear`

### Driver Section

```
driver.N {
```

| Property     | Type | Description             |
| ------------ | ---- | ----------------------- |
| `profit_log` | ref  | Reference to profit log |

Driver personal skills appear in their own unnamed sections (same format as player skills).

### garage Section

```
garage : <location> {
```

| Property       | Type | Description                 |
| -------------- | ---- | --------------------------- |
| `vehicles`     | u32  | Number of trucks assigned   |
| `drivers`      | u32  | Number of drivers assigned  |
| `trailers`     | u32  | Number of trailers assigned |
| `status`       | u32  | Garage status               |
| `productivity` | u32  | Garage productivity         |

### company Section

```
company : company.volatile.<brand>.<city> {
```

| Property         | Type | Description                         |
| ---------------- | ---- | ----------------------------------- |
| `permanent_data` | ref  | Reference to permanent company data |
| `job_offer`      | u32  | Available job offers count          |
| `job_offer[N]`   | ref  | Reference to job offer              |
| `discovered`     | bool | Whether the company is discovered   |
| `state`          | u32  | Company state                       |

### profile.sii Section

```
profile : _nameless.XX.XXXX.XXXX {
```

| Property                | Type            | Description                        |
| ----------------------- | --------------- | ---------------------------------- |
| `name`                  | string (quoted) | Player name                        |
| `company_name`          | string (quoted) | Company name                       |
| `company_name_colored`  | string (quoted) | Company name with color            |
| `game_time`             | u64             | Total game time                    |
| `last_save_game_time`   | u64             | Game time at last save             |
| `game_weather`          | u32             | Weather state                      |
| `game_time_time`        | u32             | Time of day (minutes)              |
| `game_time_time_factor` | u32             | Time speed multiplier              |
| `game_time_date`        | u32             | Day counter                        |
| `active_mods`           | u32             | Active mod count                   |
| `active_mods[N]`        | string (quoted) | Mod identifier                     |
| `cached_experience`     | i64             | Cached XP (for save listing)       |
| `cached_distance`       | f64             | Cached distance (for save listing) |
| `cached_income`         | i64             | Cached income                      |

### info.sii Section

```
save_container : _nameless.XX.XXXX.XXXX {
```

| Property                     | Type            | Description                         |
| ---------------------------- | --------------- | ----------------------------------- | ------- | ------------------------ |
| `name`                       | string (quoted) | Save name / description             |
| `time`                       | u32             | Game time at save                   |
| `file_time`                  | i64             | Unix timestamp of save              |
| `version`                    | u32             | Save format version (e.g., `90`)    |
| `info_version`               | u32             | Info format version (currently `1`) |
| `dependencies`               | u32             | DLC dependency count                |
| `dependencies[N]`            | string (quoted) | DLC identifier (e.g., `dlc          | eut2_fr | DLC - Vive la France !`) |
| `info_players_experience`    | i64             | Player XP (for save listing)        |
| `info_unlocked_recruitments` | u32             | Unlocked recruitment agencies       |
| `info_unlocked_dealers`      | u32             | Unlocked truck dealers              |
| `info_visited_cities`        | u32             | Visited city count                  |
| `info_money_account`         | i64             | Player money (for save listing)     |
| `info_explored_ratio`        | float           | Map exploration ratio               |

## Value Formats

### Standard scalars

```
money_account: 50000000
experience_points: 1600
coinsurance_fixed: 1000
loan_limit: 0
```

### Quoted strings

Only certain properties use quotes:

```
license_plate: "ABC-1234"
name: "Carlos"
```

### Hex-encoded floats (`&XXXXXXXX`)

Some floats are stored as IEEE 754 single-precision bits in hex with a `&` prefix:

```
fuel_relative: &3f000000        // 0.5
coinsurance_ratio: &3dcccccd    // 0.1
engine_wear_unfixable: &3a1cae97  // ~0.000934
```

The parser handles these via `parse_hex_float`:

1. Try standard `f64` parse first
2. Strip leading `&`
3. Parse remaining hex as `u32`
4. Reinterpret as `f32::from_bits()`, widen to `f64`

Real hex float examples (from test fixtures):

| Hex         | Decimal   | Context                     |
| ----------- | --------- | --------------------------- |
| `&3f800000` | 1.0       | fuel_relative (full)        |
| `&00000000` | 0.0       | empty / zero                |
| `&bf800000` | -1.0      | negative                    |
| `&3f000000` | 0.5       | fuel_relative (half)        |
| `&3dcccccd` | 0.1       | coinsurance_ratio           |
| `&3a1cae97` | 0.000934  | engine_wear_unfixable       |
| `&3d05901d` | 0.032366  | transmission_wear_unfixable |
| `&3d974782` | 0.073814  | cabin_wear_unfixable        |
| `&3d76db2a` | 0.060245  | chassis_wear_unfixable      |
| `&3ef92c25` | 0.486422  | fuel_relative               |
| `&3fe29b40` | 1.771053  | discovery distance          |
| `&42615739` | 56.335178 | real_time_seconds           |
| `&45d077f5` | 6670.995  | payment_timer               |

The `&` prefix is the key indicator. Plain decimal values (like `0`, `1.0`) are also accepted by the game engine.

### Array properties

```
trucks: 2
trucks[0]: _nameless.7646.a03e.bea0
trucks[1]: _nameless.7646.a185.e210
```

Arrays are stored as a count property plus indexed elements. The `set_array_property` method updates the count and individual entries, appending new elements at the end of the document.

### Booleans

```
app_enabled: false
overdraft: false
discovered: true
```

Always lowercase `true` / `false`.

## Reference Names

- `ref` values like `_nameless.7646.a03e.bea0` are unique section identifiers
- `null` represents empty references
- Named references: `garage.berlin`, `driver.125`, `company.volatile.bhv.berlin`
- `_nameless` references change between saves (and even between consecutive saves)

## Edit Operations

Implemented in `save_parser/editor.rs` (`SaveEditor`).

| Operation           | What it changes                                                      | Method                       |
| ------------------- | -------------------------------------------------------------------- | ---------------------------- |
| `edit_money`        | `money_account` in bank section                                      | regex replace                |
| `edit_xp`           | `experience_points` in driver_player                                 | regex replace                |
| `max_skills`        | Sets adr=63, long_dist=6, heavy=6, fragile=6, urgent=6, mechanical=6 | 6x regex replace             |
| `repair_all`        | Sets all 8 wear/unfixable properties to `0`                          | 8x regex replace per vehicle |
| `refuel_all`        | Sets `fuel_relative` to `1.0`                                        | regex replace per vehicle    |
| `unlock_all_cities` | Extracts city names from companies array, merges with visited_cities | See below                    |

### unlock_all_cities Details

1. Read the `cities` array from the `player` section (full city list)
2. If empty, fall back to extracting city names from `companies` array (splitting `company.volatile.bhv.berlin` → `berlin`)
3. Deduplicate and sort
4. Compare with `visited_cities` to find unvisited cities
5. Build new `visited_cities` array (sorted union)
6. Build `visited_cities_count` array (all `1`)

## Level Calculation

ETS2 does NOT store `level` in the save file. It is computed from `experience_points`:

```
level = floor((1 + sqrt(1 + 8 * xp / 100)) / 2)
```

XP for level N:

```
xp = N * (N - 1) / 2 * 100
```

| XP     | Level |
| ------ | ----- |
| 0      | 1     |
| 100    | 2     |
| 300    | 3     |
| 1600   | 6     |
| 495000 | 100   |

## Known Quirks

### Array Element Appending

`set_array_property` appends new array elements at the **last property line in the entire document**, not within the section they belong to. This can result in:

```
vehicle : _nameless.4e43.34c0 {
  ...
  wheels_wear: 0
}

garage : garage.berlin {
  visited_cities[1]: paris       # <-- appended here, outside player section
  visited_cities_count[1]: 1
}
```

### Comments Are Not Preserved

When a ScsC save is decompressed and re-compressed, any `#` comments in the original text are preserved (since the editor modifies the decompressed text in-place), but the application itself never adds comments.

### Same Property Name in Multiple Sections

Because `set_property` uses `replace_all` on the entire document, setting a common property name that appears in multiple sections (like `fuel_relative` which exists on every truck/trailer) will change **all** instances. The application handles this intentionally for operations like `refuel_all` and `repair_all`, but it means you cannot selectively edit a single vehicle's wear via the current API.

### Hex Float Replacement

When setting properties that were originally hex-encoded, the application writes plain decimal values (e.g., `fuel_relative: 1.0` instead of `&3f800000`). The game engine accepts both formats.

## Not Found in game.sii

Properties commonly assumed to exist but NOT found in tested saves:

| Property                            | Why                                        |
| ----------------------------------- | ------------------------------------------ |
| `level`                             | Derived from XP                            |
| `current_truck`                     | Use `my_truck` in player section           |
| `driven_distance` (total)           | Only per-job `distance` exists             |
| `total_driven_distance_km`          | Only statistics sections (per-trailer)     |
| `skill_points`                      | Not stored; game auto-allocates            |
| `economy: fuel_prices`              | Fuel prices exist in separate economy data |
| `high_value`, `just_in_time`, `eco` | Removed in 1.53 skill rework               |

## Error Types

Defined in `save_parser/error.rs`:

| Variant         | Description                                          |
| --------------- | ---------------------------------------------------- |
| `Io`            | Filesystem read/write errors                         |
| `Compression`   | zlib decompression failures                          |
| `Crypto`        | AES decryption failures (wrong key, corrupted data)  |
| `Syntax`        | Parse error at a specific line                       |
| `UnknownFormat` | File with unrecognized magic bytes                   |
| `Utf8`          | Non-UTF-8 content after decompression                |
| `Regex`         | Invalid regex pattern (should not occur in practice) |
