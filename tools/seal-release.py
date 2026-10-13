"""Reproducible clean candidate packaging; exact-byte tests remain a separate gate."""
import argparse, hashlib, json, pathlib, shutil, subprocess, zipfile

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def sums(root,paths,target):
    (root/target).write_text(''.join(f'{sha(root/p)}  {p}\n' for p in sorted(paths) if p!=target),encoding='utf-8')

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);parser.add_argument('--screenshots');args=parser.parse_args()
    root=pathlib.Path(__file__).resolve().parents[1];out=pathlib.Path(args.output).resolve();out.mkdir(parents=True,exist_ok=True)
    version=json.loads((root/'release/version.json').read_text());name=version['release_name'];stage=out/(name+'_source');archive=out/(name+'.zip')
    if stage.exists() or archive.exists():raise SystemExit('Refusing to overwrite an existing candidate; use a new output directory.')
    paths=subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().split('\0');paths=[x for x in paths if x]
    forbidden={'data','storage','backups','exports','node_modules','.git','.test-evidence'}
    for rel in paths:
        p=pathlib.PurePosixPath(rel)
        # GitHub distribution artifacts are companions, not nested application files.
        if p.parts[0]=='releases':continue
        if p.is_absolute() or '..' in p.parts or p.parts[0] in forbidden:raise SystemExit('Unsafe/unexpected tracked distribution path: '+rel)
        source=root/rel
        if source.is_symlink():raise SystemExit('Symlink distribution path: '+rel)
        target=stage/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
    if args.screenshots:
        source=pathlib.Path(args.screenshots);target=stage/'docs/verification/browser'
        target.mkdir(parents=True,exist_ok=True)
        for p in source.iterdir():
            if p.suffix in {'.png','.csv','.json'} and p.is_file() and not p.is_symlink():shutil.copy2(p,target/p.name)
    commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
    manifest=json.loads((stage/'RELEASE_MANIFEST.json').read_text());manifest['source_commit']=commit;manifest['exact_zip_verification']='See companion seal report created after fresh-extraction tests; archive is immutable.'
    (stage/'RELEASE_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    scope=stage/'docs/verification/SEAL_SCOPE.md'
    scope.write_text('# Seal evidence boundary\n\nThis archive contains the complete candidate application, working-tree test/browser evidence, screenshots, upgrade notes, limitations and owner checklist. Exact ZIP SHA-256 and fresh-extraction test outcomes are attested in the companion seal report after this immutable ZIP is produced. A ZIP cannot contain its own final SHA-256 without changing that hash. Do not substitute source-tree tests for exact-ZIP verification.\n\nSource commit: '+commit+'\nStatus: OWNER_ACCEPTANCE_CANDIDATE_NOT_FINAL.\n')
    handoff=stage/'course-authoring-handoff';sums(stage,[p.relative_to(stage).as_posix() for p in handoff.rglob('*') if p.is_file()],'course-authoring-handoff/SHA256SUMS.txt')
    # Handoff checksums convention uses paths relative to the handoff directory.
    sums(handoff,[p.relative_to(handoff).as_posix() for p in handoff.rglob('*') if p.is_file()],'SHA256SUMS.txt')
    files=[p.relative_to(stage).as_posix() for p in stage.rglob('*') if p.is_file()]
    sums(stage,files,'SHA256SUMS.txt')
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for rel in sorted(files):z.write(stage/rel,rel)
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        assert len(z.namelist())==len(set(z.namelist()))
        for line in z.read('SHA256SUMS.txt').decode().splitlines():
            expected,rel=line.split('  ',1);assert hashlib.sha256(z.read(rel)).hexdigest()==expected,rel
    digest=sha(archive);(out/(name+'.zip.sha256')).write_text(digest+'  '+archive.name+'\n')
    print(json.dumps({'archive':str(archive),'stage':str(stage),'files':len(files),'sha256':digest,'source_commit':commit,'status':'SEALED_PENDING_FRESH_EXTRACTION_TESTS'},indent=2))

if __name__=='__main__':main()
