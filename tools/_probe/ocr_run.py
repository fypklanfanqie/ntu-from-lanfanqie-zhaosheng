import sys, json
from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
for p in sys.argv[1:]:
    res, _ = ocr(p)
    print("=====", p)
    if not res:
        print("(no text)")
        continue
    for box, txt, score in res:
        print(txt)