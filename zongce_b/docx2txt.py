import sys
from docx import Document

def dump(path, out):
    d = Document(path)
    parts = []
    # paragraphs in body order along with tables
    from docx.table import Table
    from docx.text.paragraph import Paragraph
    body = d.element.body
    for child in body.iterchildren():
        tag = child.tag.split('}')[-1]
        if tag == 'p':
            p = Paragraph(child, d)
            t = p.text.strip()
            if t:
                parts.append(t)
        elif tag == 'tbl':
            tbl = Table(child, d)
            rows = []
            for row in tbl.rows:
                cells = []
                prev = None
                for c in row.cells:
                    txt = c.text.strip().replace('\n', ' ')
                    cells.append(txt)
                rows.append(' | '.join(cells))
            parts.append('[TABLE]\n' + '\n'.join(rows) + '\n[/TABLE]')
    open(out, 'w', encoding='utf-8').write('\n'.join(parts))
    print(out, len(parts))

dump(sys.argv[1], sys.argv[2])
