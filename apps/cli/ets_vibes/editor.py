from pathlib import Path
from typing import Optional
from .parser import SiiDocument
from .compression import decompress_save, compress_save
from .profile import SaveFile

class EditResult:
    def __init__(self):
        self.money_modified = False
        self.xp_modified = False

class EditOptions:
    def __init__(self, money: Optional[int] = None, xp: Optional[int] = None):
        self.money = money
        self.xp = xp

class SaveEditor:
    def __init__(self, save_file: SaveFile):
        self._save_file = save_file
        self._document: Optional[SiiDocument] = None
        self._was_compressed = False

    @property
    def document(self) -> SiiDocument:
        if self._document is None:
            raise RuntimeError("Document not loaded.")
        return self._document

    def load(self) -> None:
        data = self._save_file.read_game_sii()
        self._was_compressed = data[:4] == b"ScsC"
        content = decompress_save(data)
        self._document = SiiDocument(content)

    def apply_edits(self, options: EditOptions) -> EditResult:
        doc = self.document
        result = EditResult()
        
        if options.money is not None:
            result.money_modified = doc.set_numeric_property("money", options.money)
        
        if options.xp is not None:
            result.xp_modified = doc.set_numeric_property("experience_points", options.xp)
            
        return result

    def save(self) -> None:
        # Save as plaintext as the game accepts it and its less prone to errors
        if self._document is None:
            raise RuntimeError("Document not loaded.")
        self._save_file.write_game_sii(self._document.content.encode("utf-8"))

    def save_encrypted(self) -> None:
        if self._document is None:
            raise RuntimeError("Document not loaded.")
        
        content = self._document.content
        data = compress_save(content) if self._was_compressed else content.encode("utf-8")
        self._save_file.write_game_sii(data)
