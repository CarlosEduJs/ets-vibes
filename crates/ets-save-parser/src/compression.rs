use std::io::{Read, Write};

use aes::Aes256;
use cbc::{Decryptor, Encryptor};
use cipher::{
    block_padding::NoPadding, block_padding::Pkcs7, BlockModeDecrypt, BlockModeEncrypt, KeyIvInit,
};
use flate2::read::ZlibDecoder;
use flate2::write::ZlibEncoder;
use flate2::Compression;
use getrandom::getrandom;
use hmac::{digest::KeyInit as HmacKeyInit, Hmac, Mac};
use sha2::Sha256;

use crate::error::SaveError;

type Aes256CbcDec = Decryptor<Aes256>;
type Aes256CbcEnc = Encryptor<Aes256>;
type HmacSha256 = Hmac<Sha256>;

const AES_KEY: [u8; 32] = [
    0x2a, 0x5f, 0xcb, 0x17, 0x91, 0xd2, 0x2f, 0xb6, 0x02, 0x45, 0xb3, 0xd8, 0x36, 0x9e, 0xd0, 0xb2,
    0xc2, 0x73, 0x71, 0x56, 0x3f, 0xbf, 0x1f, 0x3c, 0x9e, 0xdf, 0x6b, 0x11, 0x82, 0x5a, 0x5d, 0x0a,
];

const SCSC_HEADER_SIZE: usize = 56;

pub fn decompress_save(data: &[u8]) -> Result<String, SaveError> {
    if data.len() < 4 {
        return Err(SaveError::Compression("File too small".into()));
    }

    match &data[..4] {
        b"ScsC" => decrypt_scsc(data),
        b"BSII" => Err(SaveError::Compression(
            "Binary format BSII not supported. Use g_save_format 2.".into(),
        )),
        b"SiiN" => Ok(std::str::from_utf8(data)?.to_string()),
        _ => std::str::from_utf8(data)
            .map(|s| s.to_string())
            .map_err(|_| {
                SaveError::UnknownFormat(format!("Unknown format, magic: {:?}", &data[..4]))
            }),
    }
}

fn decrypt_scsc(data: &[u8]) -> Result<String, SaveError> {
    if data.len() < SCSC_HEADER_SIZE {
        return Err(SaveError::Compression("ScsC file too short".into()));
    }

    let iv: &[u8; 16] = data[36..52]
        .try_into()
        .map_err(|_| SaveError::Compression("Invalid IV size".into()))?;

    let _decompressed_size = u32::from_le_bytes(
        data[52..56]
            .try_into()
            .map_err(|_| SaveError::Compression("Invalid decompressed size".into()))?,
    ) as usize;

    let encrypted = &data[56..];

    // Decrypt AES-CBC
    let mut buf = encrypted.to_vec();

    if !buf.len().is_multiple_of(16) {
        let padding = 16 - (buf.len() % 16);
        buf.extend(std::iter::repeat_n(0, padding));
    }

    let decrypted_len = {
        let decrypted = Aes256CbcDec::new_from_slices(&AES_KEY, iv)
            .map_err(|e| SaveError::Crypto(format!("AES init failed: {e}")))?
            .decrypt_padded::<NoPadding>(&mut buf)
            .map_err(|e| SaveError::Crypto(format!("AES decrypt failed: {e}")))?;
        decrypted.len()
    };
    buf.truncate(decrypted_len);

    // Zlib decompress
    let mut decoder = ZlibDecoder::new(&buf[..]);
    let mut result = Vec::new();
    decoder
        .read_to_end(&mut result)
        .map_err(|e| SaveError::Compression(format!("Zlib decompression failed: {e}")))?;

    let text = String::from_utf8(result)
        .map_err(|e| SaveError::Compression(format!("Zlib output is not valid UTF-8: {e}")))?;

    Ok(text)
}

pub fn compress_save(content: &str) -> Result<Vec<u8>, SaveError> {
    let data = content.as_bytes();
    let decompressed_size = data.len();

    // Zlib compress
    let mut encoder = ZlibEncoder::new(Vec::new(), Compression::best());
    encoder
        .write_all(data)
        .map_err(|e| SaveError::Compression(format!("Zlib compression failed: {e}")))?;
    let compressed = encoder
        .finish()
        .map_err(|e| SaveError::Compression(format!("Zlib compression finalize failed: {e}")))?;

    // Generate random IV
    let mut iv = [0u8; 16];
    getrandom(&mut iv).map_err(|e| SaveError::Crypto(format!("Failed to generate IV: {e}")))?;

    // AES-CBC encrypt
    let block_size = 16;
    let padded_len = compressed.len() + (block_size - (compressed.len() % block_size));
    let mut enc_buf = vec![0u8; padded_len];
    enc_buf[..compressed.len()].copy_from_slice(&compressed);

    let encrypted = Aes256CbcEnc::new_from_slices(&AES_KEY, &iv)
        .map_err(|e| SaveError::Crypto(format!("AES init failed: {e}")))?
        .encrypt_padded::<Pkcs7>(&mut enc_buf, compressed.len())
        .map_err(|e| SaveError::Crypto(format!("AES encrypt failed: {e}")))?;
    let encrypted = encrypted.to_vec();

    // HMAC-SHA256
    let mut mac = HmacSha256::new_from_slice(&AES_KEY)
        .map_err(|e| SaveError::Crypto(format!("HMAC init failed: {e}")))?;
    mac.update(&iv);
    mac.update(&encrypted);
    let hmac_result = mac.finalize().into_bytes();

    // Build output
    let mut output = Vec::with_capacity(SCSC_HEADER_SIZE + encrypted.len());
    output.extend_from_slice(b"ScsC");
    output.extend_from_slice(&hmac_result);
    output.extend_from_slice(&iv);
    output.extend_from_slice(&(decompressed_size as u32).to_le_bytes());
    output.extend_from_slice(&encrypted);

    Ok(output)
}
