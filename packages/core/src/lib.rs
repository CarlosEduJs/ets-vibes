// Core library for ETS-Vibes
// This will contain shared Rust code for both CLI and GUI apps

pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

// Future modules:
// pub mod compression;
// pub mod parser;
// pub mod profile;
// pub mod editor;
