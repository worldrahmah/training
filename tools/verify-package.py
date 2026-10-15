"""Verify immutable release bytes before extraction; no credential/runtime files allowed."""
import argparse,hashlib,json,pathlib,stat,zipfile
p=argparse.ArgumentParser();p.add_argument('archive');p.add_argument('--extract');p.add_argument('--expected-sha256');a=p.parse_args();archive=pathlib.Path(a.archive);digest=hashlib.sha256(archive.read_bytes()).hexdigest()
if a.expected_sha256:assert digest==a.expected_sha256,'ZIP SHA-256 mismatch'
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None,'CRC failure'
 names=z.namelist();assert len(names)==len(set(names))==len(set(n.casefold() for n in names)),'duplicate/case-colliding paths'
 forbidden={'data','storage','backups','exports','node_modules','.git','.test-evidence'}
 for info in z.infolist():
  name=info.filename;rel=pathlib.PurePosixPath(name)
  assert name and '\\' not in name and not rel.is_absolute() and '..' not in rel.parts and ':' not in name and rel.parts[0] not in forbidden,('unsafe path',name)
  assert not stat.S_ISLNK(info.external_attr>>16),('symlink',name)
  assert not name.endswith('INITIAL_ADMIN_PASSWORD.txt'),('private bootstrap state',name)
 checked=0
 for manifest in ['SHA256SUMS.txt','course-authoring-handoff/SHA256SUMS.txt','course-creator-kit/SHA256SUMS.txt']:
  prefix=pathlib.PurePosixPath(manifest).parent
  for line in z.read(manifest).decode().splitlines():
   expected,name=line.split('  ',1);full=str(prefix/name)
   assert hashlib.sha256(z.read(full)).hexdigest()==expected,('file checksum',full);checked+=1
 if a.extract:
  target=pathlib.Path(a.extract);assert not target.exists(),'Refusing to overwrite extraction';target.mkdir(parents=True);z.extractall(target)
 print(json.dumps({'status':'PASS','archive':archive.name,'sha256':digest,'files':len(names),'checksum_entries':checked,'crc':'PASS','safe_paths':'PASS','unique_paths':'PASS','symlinks':'none','private_runtime_state':'none','extraction':str(a.extract) if a.extract else None},indent=2))
