"""RC1R9 shared branding, current activity labels and private-data UI checks."""
import json,os,pathlib,shutil,socket,subprocess,tempfile,time,hashlib
from playwright.sync_api import sync_playwright,expect
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('ONE_RC9_BROWSER_EVIDENCE_DIR',str(ROOT/'.test-evidence/rc1r9')));OUT.mkdir(parents=True,exist_ok=True)
TEMP=pathlib.Path(tempfile.mkdtemp(prefix='one-rc9-browser-'))
with socket.socket() as sock:sock.bind(('127.0.0.1',0));PORT=sock.getsockname()[1]
BASE=f'http://127.0.0.1:{PORT}'
env={**os.environ,'HOST':'127.0.0.1','PORT':str(PORT),'TRAINING_ENGINE_TEST_ACCOUNTS':'1',**{f'TRAINING_ENGINE_{k}_DIR':str(TEMP/k.lower()) for k in ['DATA','STORAGE','BACKUP','EXPORT']}}
log=open(TEMP/'server.log','w');server=subprocess.Popen(['node','app/server.mjs'],cwd=ROOT,env=env,stdout=log,stderr=log);results=[]
try:
 with sync_playwright() as p:
  api=p.request.new_context(base_url=BASE)
  for _ in range(200):
   try:
    if api.get('/api/health',timeout=1000).ok:break
   except Exception:pass
   time.sleep(.05)
  def req(url,token=None,data=None,method='GET',headers=None):
   h={**(headers or {}),**({'X-Session-Token':token} if token else {})};kw={'headers':h}
   if data is not None:kw['data']=data
   r=api.fetch(url,method=method,**kw);assert r.ok,(url,r.status);return r.json()
  admin=req('/api/login',data={'username':'TRAINER','password':'TRAIN1234'},method='POST');at=admin['token']
  student=req('/api/login',data={'username':'DEMO01','password':'D1001'},method='POST');st=student['token']
  req('/api/staff',at,{'username':'RC9EDITOR','display_name':'Editor RC9','password':'Editor-RC9-Test!','staff_role':'course_editor'},'POST')
  et=req('/api/login',data={'username':'RC9EDITOR','password':'Editor-RC9-Test!'},method='POST')['token']
  imp=req('/api/courses/import',at,(ROOT/'course-creator-kit/examples/catalog-en.course.zip').read_bytes(),'POST',{'X-File-Name':'catalog-en.course.zip'})
  dr=req(f'/api/courses/{imp["course_id"]}/drafts',at,{'source_version_id':imp['version_id'],'version':'1.1-browser'},'POST')
  cl=req('/api/classes',at,{'course_version_id':imp['version_id'],'title':'RC9 Branding Laboratory','participant_ids':[student['user']['id']]},'POST');cid=cl['id'];req(f'/api/classes/{cid}/activate',at,{},'POST')
  pair=req(f'/api/live/{cid}/projector-pair',at,{},'POST')['pair_token'];req(f'/api/live/{cid}/launch',at,{'module_id':'m1','activity_id':'a_presentation'},'POST')
  req('/api/workspace/branding/logo',at,(ROOT/'tests/fixtures/report-logo.png').read_bytes(),'PUT')
  expected_logo=hashlib.sha256((ROOT/'tests/fixtures/report-logo.png').read_bytes()).hexdigest()
  assert hashlib.sha256(api.get('/api/system-logo').body()).hexdigest()==expected_logo
  browser=p.chromium.launch(executable_path=os.environ.get('ONE_BROWSER_EXECUTABLE') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  def context(locale,theme,token=None):
   c=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce',color_scheme='dark' if theme=='system' else theme)
   c.route('https://**/*',lambda route:route.abort())
   c.add_init_script('const x='+json.dumps({'token':token or '', 'locale':locale,'theme':theme})+';sessionStorage.setItem("training_engine_session",x.token);sessionStorage.setItem("training_engine_session_rotated_at",String(Date.now()));localStorage.setItem("training_engine_locale",x.locale);localStorage.setItem("training_engine_theme",x.theme);')
   return c
  for locale in ['en','ar']:
   for theme in ['light','dark','system']:
    for surface in ['admin','trainer','student','editor','profile','builder','preview']:
     c=context(locale,theme);page=c.new_page();page.goto(BASE+'/'+surface+(f'?version_id={imp["version_id"]}' if surface=='preview' else ''));page.locator('#loginForm').wait_for()
     assert 'TRAIN1234' not in page.locator('body').inner_text();assert 'D1001' not in page.locator('body').inner_text()
     logo=page.locator('.system-logo:visible').first;expect(logo).to_be_visible();page.wait_for_function("document.querySelector('.system-logo').naturalWidth>0")
     assert page.locator('html').get_attribute('dir')==('rtl' if locale=='ar' else 'ltr')
     for w,h in [(1440,900),(768,1024),(390,844)]:
      page.set_viewport_size({'width':w,'height':h});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(surface,locale,theme,w)
     if surface=='admin':page.screenshot(path=str(OUT/f'sign-in-{locale}-{theme}-mobile.png'),full_page=True)
     results.append({'surface':surface+' sign-in','locale':locale,'theme':theme,'widths':[1440,768,390],'logo':'PASS','no_demo_credentials':'PASS'});c.close()
  registry=json.loads((ROOT/'registry/activity-component-registry.json').read_text())
  for locale in ['en','ar']:
   c=context(locale,'light',at);page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE+f'/builder?course_id={imp["course_id"]}&version_id={dr["version_id"]}');page.locator('[data-select="activity"]').first.click();page.locator('#actType').wait_for()
   labels=page.locator('#actType option').all_text_contents();assert labels==[a['label_ar' if locale=='ar' else 'label'] for a in registry['activities']],(locale,labels)
   values=page.locator('#actType option').evaluate_all('(xs)=>xs.map(x=>x.value)');assert values==[a['id'] for a in registry['activities']]
   assert page.locator('.activity-type-settings h3').inner_text()==('إعدادات عرض تقديمي' if locale=='ar' else 'Presentation Settings');assert page.locator('#actTitle').input_value()=='Presentation','Authored course text must not be translated by UI locale'
   page.screenshot(path=str(OUT/f'builder-labels-{locale}.png'),full_page=True);assert not errors,errors;c.close();results.append({'surface':'Builder','locale':locale,'activity_labels':36,'stable_ids':'PASS','authored_text_preserved':'PASS'})
  for surface,url,token in [('admin','/admin',at),('trainer','/trainer',at),('student','/student',st),('editor','/editor',et),('profile','/profile',st),('preview',f'/preview?version_id={imp["version_id"]}',at),('live',f'/live?class_id={cid}',at),('projector',f'/present?class_id={cid}&pair={pair}',None)]:
   c=context('ar','dark',token);page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE+url);expect(page.locator('.system-logo:visible').first).to_be_visible();page.wait_for_function("document.querySelector('.system-logo').naturalWidth>0")
   if surface=='projector':page.set_viewport_size({'width':1600,'height':900})
   page.screenshot(path=str(OUT/f'{surface}-shared-logo.png'),full_page=True);assert not errors,(surface,errors);results.append({'surface':surface,'locale':'ar','theme':'dark','owner_logo':'PASS','page_errors':errors});c.close()
  browser.close();api.dispose()
 (OUT/'result.json').write_text(json.dumps({'status':'PASS','visits':len(results),'checks':results},ensure_ascii=False,indent=2)+'\n');print('RC1R9_BROWSER_PASS',len(results),'visits; all entry screens EN/AR themes widths, 36 bilingual labels/stable IDs/authored text, owner logo on role surfaces')
finally:
 server.terminate()
 try:server.wait(timeout=5)
 except subprocess.TimeoutExpired:server.kill();server.wait()
 log.close();shutil.rmtree(TEMP)
