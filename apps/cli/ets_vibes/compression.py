import struct
import zlib
import hashlib
from typing import Optional

try:
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    from cryptography.hazmat.backends import default_backend
    HAS_CRYPTO = True
except ImportError:
    HAS_CRYPTO = False

class CompressionError(Exception):
    pass

# AES Key for ETS2/ATS (known by community)
AES_KEY = bytes([
    0x2a, 0x5f, 0xcb, 0x17, 0x91, 0xd2, 0x2f, 0xb6,
    0x02, 0x45, 0xb3, 0xd8, 0x36, 0x9e, 0xd0, 0xb2,
    0xc2, 0x73, 0x71, 0x56, 0x3f, 0xbf, 0x1f, 0x3c,
    0x9e, 0xdf, 0x6b, 0x11, 0x82, 0x5a, 0x5d, 0x0a,
])

SCSC_HEADER_SIZE = 56

def decompress_save(data: bytes) -> str:
    if len(data) < 4:
        raise CompressionError("File too small")
    
    magic = data[:4]
    if magic == b"ScsC":
        return _decrypt_scsc(data)
    elif magic == b"BSII":
        raise CompressionError("Binary format BSII not supported. Use g_save_format 2.")
    elif magic == b"SiiN":
        return data.decode("utf-8")
    else:
        try:
            return data.decode("utf-8")
        except UnicodeDecodeError:
            raise CompressionError(f"Unknown format, magic: {magic!r}")

def _decrypt_scsc(data: bytes) -> str:
    if not HAS_CRYPTO:
        raise CompressionError("Module 'cryptography' not installed.")
    
    if len(data) < SCSC_HEADER_SIZE:
        raise CompressionError("ScsC file too short")
    
    iv = data[36:52]
    decompressed_size = struct.unpack("<I", data[52:56])[0]
    encrypted = data[56:]
    
    if len(encrypted) % 16 != 0:
        padding = 16 - (len(encrypted) % 16)
        encrypted = encrypted + (b'\x00' * padding)
    
    try:
        cipher = Cipher(algorithms.AES(AES_KEY), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        decrypted = decryptor.update(encrypted) + decryptor.finalize()
    except Exception as e:
        raise CompressionError(f"AES Decryption failed: {e}")
    
    try:
        return zlib.decompress(decrypted, bufsize=decompressed_size).decode("utf-8")
    except zlib.error:
        try:
            padding_len = decrypted[-1]
            if 1 <= padding_len <= 16:
                return zlib.decompress(decrypted[:-padding_len]).decode("utf-8")
            raise CompressionError("Zlib decompression failed")
        except Exception as e:
            raise CompressionError(f"Zlib decompression failed: {e}")

def compress_save(content: str) -> bytes:
    if not HAS_CRYPTO:
        raise CompressionError("Module 'cryptography' not installed.")
    
    import os
    import hmac as hmac_module
    
    data = content.encode("utf-8")
    decompressed_size = len(data)
    compressed = zlib.compress(data, level=9)
    iv = os.urandom(16)
    
    padding_len = 16 - (len(compressed) % 16)
    padded = compressed + bytes([padding_len] * padding_len)
    
    cipher = Cipher(algorithms.AES(AES_KEY), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    encrypted = encryptor.update(padded) + encryptor.finalize()
    
    hmac_data = hmac_module.new(AES_KEY, iv + encrypted, hashlib.sha256).digest()
    
    output = bytearray()
    output.extend(b"ScsC")
    output.extend(hmac_data)
    output.extend(iv)
    output.extend(struct.pack("<I", decompressed_size))
    output.extend(encrypted)
    
    return bytes(output)
