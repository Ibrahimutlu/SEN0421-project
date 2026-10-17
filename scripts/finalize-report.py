from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree
from pathlib import Path
src=Path('tmp/report-with-note.docx'); dst=Path('reports/SDS-09_Progress_Report_R01.docx')
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
w='{'+ns['w']+'}'
with ZipFile(src) as z: parts={item.filename:z.read(item.filename) for item in z.infolist()}
for part in ['word/document.xml','word/footnotes.xml']:
    x=etree.fromstring(parts[part])
    for ref in x.xpath('//w:footnoteRef|//w:footnoteReference',namespaces=ns):
        run=ref.getparent(); props=run.find(w+'rPr')
        if props is None: props=etree.Element(w+'rPr');run.insert(0,props)
        align=etree.SubElement(props,w+'vertAlign');align.set(w+'val','superscript')
    if part.endswith('footnotes.xml'):
        for note in x.xpath('//w:footnote[@w:id="1"]/w:p',namespaces=ns):
            props=etree.Element(w+'pPr'); spacing=etree.SubElement(props,w+'spacing');spacing.set(w+'after','0');spacing.set(w+'line','220');note.insert(0,props)
            for run in note.findall(w+'r'):
                rp=run.find(w+'rPr')
                if rp is None: rp=etree.Element(w+'rPr');run.insert(0,rp)
                size=etree.SubElement(rp,w+'sz');size.set(w+'val','18')
            for text in note.findall('.//'+w+'t'):text.set('{http://www.w3.org/XML/1998/namespace}space','preserve')
    parts[part]=etree.tostring(x,xml_declaration=True,encoding='UTF-8',standalone=True)
with ZipFile(dst,'w',ZIP_DEFLATED) as z:
    for name,data in parts.items():z.writestr(name,data)
