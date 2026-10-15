"""Check application/tool/test syntax without modifying source or bytecode caches."""
import ast,json,pathlib,subprocess
root=pathlib.Path(__file__).resolve().parents[1];checked=[]
for folder in ['app','tools','tests']:
 for p in sorted((root/folder).rglob('*')):
  if not p.is_file() or 'vendor' in p.parts:continue
  if p.suffix in ['.mjs','.js']:
   subprocess.run(['node','--check',str(p)],check=True,capture_output=True);checked.append(str(p.relative_to(root)))
  elif p.suffix=='.py':ast.parse(p.read_text(),filename=str(p));checked.append(str(p.relative_to(root)))
print(json.dumps({'status':'PASS','syntax_files':len(checked),'scope':'app excluding unchanged vendored bundle, tools and tests'},indent=2))
