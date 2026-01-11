import re
from typing import Optional

class SiiDocument:
    def __init__(self, content: str):
        self._content = content

    @property
    def content(self) -> str:
        return self._content

    def get_property(self, property_name: str) -> Optional[str]:
        pattern = rf"^\s*{re.escape(property_name)}\s*:\s*(.+?)\s*$"
        match = re.search(pattern, self._content, re.MULTILINE)
        return match.group(1) if match else None

    def set_property(self, property_name: str, new_value: str) -> bool:
        pattern = rf"(^\s*{re.escape(property_name)}\s*:\s*).+?(\s*$)"
        new_content, count = re.subn(pattern, rf"\g<1>{new_value}\g<2>", self._content, flags=re.MULTILINE)
        if count > 0:
            self._content = new_content
            return True
        return False

    def set_numeric_property(self, property_name: str, value: int) -> bool:
        return self.set_property(property_name, str(value))
