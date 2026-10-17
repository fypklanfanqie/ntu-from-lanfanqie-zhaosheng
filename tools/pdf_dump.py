import sys
from pypdf import PdfReader

path = sys.argv[1]
out = sys.argv[2]
r = PdfReader(path)
txt = "\n".join((p.extract_text() or "") for p in r.pages)
with open(out, "w", encoding="utf-8") as f:
    f.write(txt)
print("wrote", out, len(txt))
