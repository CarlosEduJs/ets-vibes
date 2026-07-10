use thiserror::Error;

#[derive(Error, Debug)]
pub enum ParseError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Parse error at line {line}: {message}")]
    Syntax { line: usize, message: String },
    #[error("Unexpected token: {0}")]
    UnexpectedToken(String),
    #[error("Unknown section: {0}")]
    UnknownSection(String),
}
