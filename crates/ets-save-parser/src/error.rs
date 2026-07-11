use thiserror::Error;

#[derive(Error, Debug)]
pub enum SaveError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Compression error: {0}")]
    Compression(String),

    #[error("Crypto error: {0}")]
    Crypto(String),

    #[error("Parse error at line {line}: {message}")]
    Syntax { line: usize, message: String },

    #[error("Unknown format: {0}")]
    UnknownFormat(String),

    #[error("UTF-8 error: {0}")]
    Utf8(#[from] std::str::Utf8Error),

    #[error("Regex error: {0}")]
    Regex(#[from] regex::Error),
}
