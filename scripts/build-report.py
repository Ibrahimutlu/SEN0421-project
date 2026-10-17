from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import re

root=Path('.')
source=root/'reports/SDS-09_Progress_Report_R01.md'
out=root/'reports/SDS-09_Progress_Report_R01.docx'
doc=Document()
section=doc.sections[0]
section.page_width=Inches(8.2677); section.page_height=Inches(11.6929)
section.top_margin=section.bottom_margin=Inches(.65)
section.left_margin=section.right_margin=Inches(.7)
section.footer_distance=Inches(.3)
for name in ['Normal','Title','Subtitle','Heading 1','Heading 2','Heading 3','Footer','Footnote Text']:
    try: style=doc.styles[name]
    except KeyError: continue
    style.font.name='Arial'; style.font.color.rgb=RGBColor(0,0,0)
    style._element.get_or_add_rPr().append(OxmlElement('w:lang'))
    style._element.rPr[-1].set(qn('w:val'),'en-US')
normal=doc.styles['Normal']; normal.font.size=Pt(10.5)
normal.paragraph_format.line_spacing=1.10
normal.paragraph_format.space_after=Pt(7)
for name,size in [('Title',24),('Heading 1',15),('Heading 2',11.5)]:
    doc.styles[name].font.size=Pt(size)
    doc.styles[name].paragraph_format.space_before=Pt(12 if name!='Title' else 0)
    doc.styles[name].paragraph_format.space_after=Pt(7)
    doc.styles[name].font.bold=name!='Title'
widths=[
    [.48,2.18,4.2], [1.35,3.65,1.86], [1.6,3.0,2.26],
    [1.4,3.55,1.91], [3.38,1.15,1.15,1.18], [1.4,1.1,4.36], [2.35,1.45,1.9,1.16]
]

def cell_style(cell,header,rowindex):
    tcPr=cell._tc.get_or_add_tcPr()
    borders=OxmlElement('w:tcBorders')
    for name in ['top','left','bottom','right']:
        side=OxmlElement('w:'+name); side.set(qn('w:val'),'single'); side.set(qn('w:sz'),'4'); side.set(qn('w:color'),'D9D9D9'); borders.append(side)
    tcPr.append(borders)
    margins=OxmlElement('w:tcMar')
    for name,val in [('top','85'),('bottom','85'),('left','95'),('right','95')]:
        margin=OxmlElement('w:'+name); margin.set(qn('w:w'),val); margin.set(qn('w:type'),'dxa'); margins.append(margin)
    tcPr.append(margins)
    shading=OxmlElement('w:shd'); shading.set(qn('w:fill'),'203B50' if header else ('F1F4F6' if rowindex%2==0 else 'FFFFFF'));tcPr.append(shading)
    cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
    for p in cell.paragraphs:
        p.paragraph_format.line_spacing=1.04;p.paragraph_format.space_after=Pt(0)
        for run in p.runs:
            run.font.name='Arial';run.font.size=Pt(9.2);run.font.bold=header
            run.font.color.rgb=RGBColor(255,255,255) if header else RGBColor(0,0,0)

lines=source.read_text(encoding='utf-8').splitlines(); i=0; tableindex=0
while i<len(lines):
    line=lines[i].strip()
    if not line: i+=1;continue
    if line=='<!-- pagebreak -->': doc.add_page_break();i+=1;continue
    if line.startswith('|'):
        rows=[]
        while i<len(lines) and lines[i].strip().startswith('|'):
            cells=[x.strip() for x in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r'[:\-\s]+',x) for x in cells): rows.append(cells)
            i+=1
        table=doc.add_table(rows=len(rows),cols=len(rows[0]));table.alignment=WD_TABLE_ALIGNMENT.CENTER;table.autofit=False
        chosen=widths[tableindex];tableindex+=1
        for column,width in zip(table.columns,chosen): column.width=Inches(width)
        for rowindex,row in enumerate(rows):
            trPr=table.rows[rowindex]._tr.get_or_add_trPr()
            avoid=OxmlElement('w:cantSplit');trPr.append(avoid)
            if rowindex==0: repeat=OxmlElement('w:tblHeader');trPr.append(repeat)
            for colindex,text in enumerate(row):
                cell=table.cell(rowindex,colindex);cell.width=Inches(chosen[colindex]);cell.text=text;cell_style(cell,rowindex==0,rowindex)
                if colindex>0 and tableindex in [5,7]: cell.paragraphs[0].alignment=WD_ALIGN_PARAGRAPH.CENTER
        spacer=doc.add_paragraph();spacer.paragraph_format.space_after=Pt(2);spacer.paragraph_format.space_before=Pt(0);spacer.paragraph_format.line_spacing=Pt(3)
        continue
    if line.startswith('# '): doc.add_paragraph(line[2:],'Title')
    elif line.startswith('## '): doc.add_paragraph(line[3:],'Heading 1')
    elif line.startswith('### '): doc.add_paragraph(line[4:],'Heading 2')
    else:
        p=doc.add_paragraph(line)
        if line.startswith(('SEN0421 |','17 October','Team leader:')):
            for run in p.runs: run.font.size=Pt(10)
        if re.match(r'^\d\. ',line) and 'https://' in line:
            p.paragraph_format.space_after=Pt(5)
            for run in p.runs: run.font.size=Pt(8.5)
    i+=1
footer=section.footer.paragraphs[0]; footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT
footer.add_run('SDS-09  |  R01  |  ')
field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');footer._p.append(field)
for run in footer.runs:run.font.name='Arial';run.font.size=Pt(8)
doc.core_properties.title='Accessibility Platform Progress Report'
doc.core_properties.subject='SEN0421 SDS-09 stages 1 through 5'
doc.core_properties.author='SDS-09 team'
doc.core_properties.keywords='WCAG 2.1, SDLC, progress report, SDS-09'
for border in list(doc.styles.element.xpath('.//w:pBdr')): border.getparent().remove(border)
for border in list(doc.element.xpath('.//w:pBdr')): border.getparent().remove(border)
doc.save(out)
print(out)
