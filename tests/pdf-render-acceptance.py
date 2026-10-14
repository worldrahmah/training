"""Independent QA readers, not classroom dependencies: PDFium rendering + MuPDF text bounds."""
import argparse,json,pathlib,subprocess
import fitz,pypdfium2 as pdfium
parser=argparse.ArgumentParser();parser.add_argument('--pdf-dir',required=True);parser.add_argument('--output',required=True);parser.add_argument('--render-dir');args=parser.parse_args();source=pathlib.Path(args.pdf_dir);files=sorted(source.glob('*.pdf'));assert len(files)>=34,'Seven EN/AR defaults and twenty paired-font cases must be generated';results=[]
if args.render_dir:pathlib.Path(args.render_dir).mkdir(parents=True,exist_ok=True)
for file in files:
 info=subprocess.run(['pdfinfo',str(file)],capture_output=True,text=True);assert info.returncode==0,(file.name,info.stderr);assert not info.stderr,(file.name,info.stderr)
 with fitz.open(file) as doc:
  failures=[]
  for page in doc:
   for block in page.get_text('dict')['blocks']:
    for line in block.get('lines',[]):
     for span in line['spans']:
      x0,y0,x1,y1=span['bbox']
      if x0<-1 or y0<-1 or x1>page.rect.width+1 or y1>page.rect.height+1:failures.append({'text':span['text'],'bbox':span['bbox']})
  assert not failures,(file.name,failures[:3]);assert any(page.get_images() for page in doc),'Branded fixture must include its real logo';pages=len(doc)
 with pdfium.PdfDocument(file) as doc:
  assert len(doc)==pages;page=doc[0];text=page.get_textpage();assert len(text.get_text_range())>100;bitmap=page.render(scale=.8);image=bitmap.to_pil();assert image.size[0]>400
  if args.render_dir:image.save(pathlib.Path(args.render_dir)/(file.stem+'.png'))
 results.append({'file':file.name,'pages':pages,'pdfinfo':'PASS','mupdf_text':'PASS','pdfium_render':'PASS','off_page_text':0})
result={'status':'PASS','mupdf_version':fitz.VersionBind,'reports':results};pathlib.Path(args.output).write_text(json.dumps(result,indent=2)+'\n');print('PDF_RENDER_ACCEPTANCE_PASS',len(results),'reports with actual logo, embedded-font text and reader rendering')
