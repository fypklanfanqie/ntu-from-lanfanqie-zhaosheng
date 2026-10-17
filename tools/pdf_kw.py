import re
import sys
from pypdf import PdfReader

path = sys.argv[1]
r = PdfReader(path)
txt = "\n".join((p.extract_text() or "") for p in r.pages)
print("PAGES", len(r.pages), "CHARS", len(txt))
flat = re.sub(r"\s+", " ", txt)
for kw in ["报名", "截止", "注册", "时间"]:
    for m in re.finditer(kw, flat):
        s = max(0, m.start() - 60)
        print(">>", flat[s:m.start() + 60])
    print("---")
