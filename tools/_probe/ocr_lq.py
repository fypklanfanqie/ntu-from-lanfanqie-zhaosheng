import sys, io, glob, os
from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
files = sorted(glob.glob(os.path.join(sys.argv[1], "lq3002_*.jpg")))
out = io.StringIO()
for p in files:
    res, _ = ocr(p)
    out.write("===== %s\n" % os.path.basename(p))
    if not res:
        out.write("(no text)\n"); continue
    for box, txt, score in res:
        out.write(txt + "\n")
open(os.path.join(sys.argv[1], "lq3002_ocr.txt"), "w", encoding="utf-8").write(out.getvalue())
print("done", len(files))