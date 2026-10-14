"""Independent exact-byte distribution verification; extracts only after all gates pass."""
import argparse,collections,hashlib,json,ntpath,pathlib,re,stat,unicodedata,zipfile
parser=argparse.ArgumentParser();parser.add_argument('--archive',required=True);parser.add_argument('--extract',required=True);parser.add_argument('--output',required=True);parser.add_argument('--expected-version',default='3.5.0-rc.1.8');args=parser.parse_args()
archive=pathlib.Path(args.archive);dest=pathlib.Path(args.extract)
if dest.exists():raise SystemExit('Refusing to overwrite an extraction directory.')
reserved={'CON','PRN','AUX','NUL',*[f'COM{i}' for i in range(1,10)],*[f'LPT{i}' for i in range(1,10)]}
with zipfile.ZipFile(archive) as z:
 infos=z.infolist();names=[i.filename for i in infos];folded=[]
 assert len(names)==len(set(names)),'Duplicate archive path'
 for info in infos:
  name=info.filename;p=pathlib.PurePosixPath(name)
  assert not p.is_absolute() and not ntpath.splitdrive(name)[0] and '\\' not in name and not any(ord(c)<32 for c in name),name
  assert all(part not in ['.','..'] and not part.endswith((' ','.')) and ':' not in part and part.split('.')[0].upper() not in reserved for part in p.parts),name
  assert not (info.flag_bits&1),'Encrypted distribution entry'
  assert not stat.S_ISLNK(info.external_attr>>16),'Symlink distribution entry'
  folded.append(unicodedata.normalize('NFC',name).casefold())
 assert len(folded)==len(set(folded)),'Case/normalization collision'
 assert z.testzip() is None,'ZIP CRC failure'
 manifests=[]
 for name in names:
  if pathlib.PurePosixPath(name).name!='SHA256SUMS.txt':continue
  count=0;parent=pathlib.PurePosixPath(name).parent
  for line in z.read(name).decode().splitlines():
   expected,rel=line.split('  ',1);assert re.fullmatch('[a-f0-9]{64}',expected);key=(parent/pathlib.PurePosixPath(rel)).as_posix();assert key in names,key
   assert hashlib.sha256(z.read(key)).hexdigest()==expected,key;count+=1
  manifests.append({'path':name,'verified_entries':count,'status':'PASS'})
 assert any(x['path']=='SHA256SUMS.txt' for x in manifests)
 assert any(x['path']=='course-authoring-handoff/SHA256SUMS.txt' for x in manifests)
 manifest=json.loads(z.read('RELEASE_MANIFEST.json'));pkg=json.loads(z.read('package.json'));assert pkg['version']==manifest['app_version']==args.expected_version
 assert not any(pathlib.PurePosixPath(n).parts[0] in ['data','storage','backups','exports','.git','node_modules'] for n in names),'Owner/runtime state included'
 nested=[]
 for name in names:
  if name.lower().endswith(('.zip','.pptx')):
   import io
   with zipfile.ZipFile(io.BytesIO(z.read(name))) as inner:
    assert inner.testzip() is None,name+' nested CRC';assert len(inner.namelist())==len(set(inner.namelist())),name+' nested duplicate'
    nested.append({'path':name,'crc':'PASS','duplicates':'PASS'})
 hashes={i.filename:hashlib.sha256(z.read(i.filename)).hexdigest() for i in infos if not i.is_dir()}
 dest.mkdir(parents=True);z.extractall(dest)
result={'status':'PASS','archive':str(archive),'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'bytes':archive.stat().st_size,'files':len(hashes),'crc':'PASS','path_safety':'PASS','duplicates':'PASS','case_collisions':'PASS','current_checksum_manifests':manifests,'nested_archives':nested,'version':pkg['version'],'source_commit':manifest.get('source_commit'),'fresh_extraction':str(dest),'initial_file_hashes':hashes}
pathlib.Path(args.output).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='initial_file_hashes'},indent=2))
