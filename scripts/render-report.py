from pathlib import Path
import importlib.util, os
from pypdf import PdfReader
root=Path('.').resolve()
pdf=root/'reports/SDS-09_Progress_Report_R01.pdf'
renderer_path=Path(r'C:\Users\ibrah\.codex\plugins\cache\openai-primary-runtime\documents\26.1015.12040\skills\documents\render_docx.py')
os.environ['PATH']=r'C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin'+os.pathsep+os.environ['PATH']
spec=importlib.util.spec_from_file_location('document_renderer',renderer_path)
renderer=importlib.util.module_from_spec(spec);spec.loader.exec_module(renderer)
renderer.convert_to_pdf=lambda *args,**kwargs:(str(pdf),'DOCX rendered using installed Microsoft Word because bundled LibreOffice is unavailable on Windows.')
paths=renderer.rasterize(str(root/'reports/SDS-09_Progress_Report_R01.docx'),str(root/'tmp/report-render'),130,False,False)
reader=PdfReader(pdf)
for i,page in enumerate(reader.pages):
    text=page.extract_text()
    print(f'Page {i+1}: {len(text)} characters; {text[:95]!r}')
assert '[[FN]]' not in ''.join(page.extract_text() for page in reader.pages)
assert 'Instructor reporting requirement' in reader.pages[0].extract_text()
print('Rendered pages:',len(paths))
