import sys, io
from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
out = io.StringIO()
for p in sys.argv[1:]:
    res, _ = ocr(p)
    out.write("===== %s\n" % p)
    if not res:
        out.write("(no text)\n"); continue
    for box, txt, score in res:
        out.write(txt + "\n")
open(r"D:\ai\ntu-from-lanfanqie-zhaosheng\tools\_probe\raicom_notice_ocr.txt", "w", encoding="utf-8").write(out.getvalue())
print("done")