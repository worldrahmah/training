"""Independent browser repair gates; disposable data, no credentials in artifacts."""
import json, os, pathlib, shutil, socket, subprocess, tempfile, time
from playwright.sync_api import sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('ONE_FONT_EVIDENCE_DIR',str(ROOT/'.test-evidence/font-matrix')))
OUT.mkdir(parents=True,exist_ok=True)
TEMP=pathlib.Path(tempfile.mkdtemp(prefix='one-browser-'))
with socket.socket() as sock:sock.bind(('127.0.0.1',0));PORT=sock.getsockname()[1]
BASE=f'http://127.0.0.1:{PORT}'
env={**os.environ,'HOST':'127.0.0.1','PORT':str(PORT),**{f'TRAINING_ENGINE_{k}_DIR':str(TEMP/k.lower()) for k in ['DATA','STORAGE','BACKUP','EXPORT']}}
log=open(TEMP/'server.log','w');server=subprocess.Popen(['node','--no-warnings','app/server.mjs'],cwd=ROOT,env=env,stdout=log,stderr=log)
results=[]
try:
 with sync_playwright() as p:
  api=p.request.new_context(base_url=BASE)
  for _ in range(150):
   try:
    if api.get('/api/health',timeout=1000).ok:break
   except Exception:pass
   time.sleep(.1)
  def req(url,token=None,data=None,method='GET'):
   kwargs={'headers':{'X-Session-Token':token} if token else {}}
   if data is not None:kwargs['data']=data
   r=api.fetch(url,method=method,**kwargs);assert r.ok,(url,r.status,r.text()[:200]);return r.json()
  admin=req('/api/login',data={'username':'TRAINER','password':'TRAIN1234'},method='POST');at=admin['token']
  learner=req('/api/login',data={'username':'DEMO01','password':'D1001'},method='POST');st=learner['token']
  staff=req('/api/staff',at,{'username':'BROWSERTRAIN','password':'BrowserTest123!','display_name':'Browser Trainer','staff_role':'trainer'},'POST')
  trainer=req('/api/login',data={'username':'BROWSERTRAIN','password':'BrowserTest123!'},method='POST');tt=trainer['token']
  course={'format':'training-engine-course','schema_version':'2.0','course':{'id':'browser-repair','version':'1','title':'Classroom Studio','language':'en','direction':'ltr','modules':[{'id':'m','title':'Make connections','activities':[{'id':'match','type':'matching','title':'Connect each idea','trainer':{'cue':'PRIVATE-BROWSER-CUE'},'content':{'question':'Connect each idea'},'matching':{'pairs':[{'id':'p1','left':'CPU','right':'Processor'},{'id':'p2','left':'RAM','right':'Memory'}]},'score':{'correct':10},'results_display':'assessment'}]}]}}
  r=api.post('/api/courses/import',headers={'X-Session-Token':at,'X-File-Name':'studio.course.json'},data=json.dumps(course).encode());assert r.status==201,r.text();imp=r.json()
  cl=req('/api/classes',at,{'course_version_id':imp['version_id'],'title':'Studio Classroom','participant_ids':[learner['user']['id']]},'POST');cid=cl['id']
  req(f'/api/classes/{cid}/trainers',at,{'trainers':[{'user_id':staff['id'],'assignment_role':'lead'}]},'POST');req(f'/api/classes/{cid}/activate',tt,{},'POST');req(f'/api/live/{cid}/launch',tt,{'module_id':'m','activity_id':'match'},'POST')
  pair=req(f'/api/live/{cid}/projector-pair',tt,{},'POST')['pair_token']
  for i in range(24):req('/api/courses',at,{'title':f'Review course {i:02d}'},'POST')
  executable=os.environ.get('ONE_BROWSER_EXECUTABLE') or shutil.which('chromium') or shutil.which('google-chrome')
  browser=p.chromium.launch(**({'executable_path':executable} if executable else {}),headless=True,args=['--no-sandbox'])
  def context(token,locale,theme='light'):
   c=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce')
   c.route('https://**/*',lambda route:route.abort())
   c.add_init_script('const x='+json.dumps({'token':token or '', 'locale':locale,'theme':theme,'origin':BASE})+';if(location.origin===x.origin){sessionStorage.setItem("training_engine_session",x.token);sessionStorage.setItem("training_engine_session_rotated_at",String(Date.now()));localStorage.setItem("training_engine_locale",x.locale);localStorage.setItem("training_engine_theme",x.theme);}')
   return c
  editor=req('/api/staff',at,{'username':'FONTEDITOR','display_name':'Course Editor','staff_role':'course_editor','password':'FontTest123!'},'POST');et=req('/api/login',data={'username':'FONTEDITOR','password':'FontTest123!'},method='POST')['token'];req(f'/api/staff/{editor["id"]}/permissions',at,{'permissions':[{'resource_type':'course','resource_id':str(imp['course_id']),'action':'edit'},{'resource_type':'course','resource_id':str(imp['course_id']),'action':'publish'}]},'PUT')
  catalog=json.loads((ROOT/'app/public/font-catalog.json').read_text());en=[f for f in catalog['families'] if f['language']=='en'];ar=[f for f in catalog['families'] if f['language']=='ar'];checks=[];errors=[]
  for locale in ['en','ar']:
   for name,url,token in [('admin','/admin',at),('trainer','/trainer',tt),('builder',f'/builder?course_id={imp["course_id"]}',at),('live',f'/live?class_id={cid}',tt),('student',f'/student?class_id={cid}',st),('projector',f'/present?class_id={cid}&pair={pair}',None),('profile','/profile',st),('editor','/editor',et)]:
    c=context(token,locale);page=c.new_page();page.on('pageerror',lambda error:errors.append(str(error)));page.goto(BASE+url)
    for index in range(20):
     english,arabic=en[index],ar[index];req('/api/typography',at,{'en':english['id'],'ar':arabic['id']},'POST');page.reload();page.locator('h1,h2').first.wait_for();page.wait_for_function('(ids)=>document.documentElement.dataset.fontEnglish===ids.en&&document.documentElement.dataset.fontArabic===ids.ar',arg={'en':english['id'],'ar':arabic['id']});page.evaluate('async()=>await document.fonts.ready')
     for width,height in ([(1600,900),(1280,720)] if name=='projector' else [(1440,900),(390,844)]):
      page.set_viewport_size({'width':width,'height':height});page.wait_for_timeout(35)
      failures=page.evaluate("()=>{const bad=[];if(document.documentElement.scrollWidth>innerWidth+1)bad.push('document overflow');for(const el of document.querySelectorAll('.btn,.one-menu-trigger,input,select,h1,h2')){if(!el.getClientRects().length||el.closest('[hidden]'))continue;const rect=el.getBoundingClientRect();if(rect.width>innerWidth+2)bad.push('oversized control');if(el.matches('input,select,.btn,.one-menu-trigger')&&el.scrollHeight>el.clientHeight+2)bad.push('clipped control: '+el.tagName);}return bad}");assert not failures,(name,locale,english['id'],arabic['id'],width,failures);checks.append({'surface':name,'locale':locale,'english':english['id'],'arabic':arabic['id'],'width':width,'status':'PASS'})
      if index in [0,7,19] and width in [390,1600]:page.screenshot(path=str(OUT/f'{name}-{locale}-{english["id"]}-{arabic["id"]}-{width}.png'),full_page=True)
    c.close()
  assert not errors,errors;browser.close();api.dispose();(OUT/'FONT_MATRIX_RESULT.json').write_text(json.dumps({'status':'PASS','checks':checks,'page_errors':errors},indent=2));print('FONT_MATRIX_BROWSER_PASS',len(checks),'actual global-font layout cases across 8 surfaces, EN/AR and mobile/desktop or 16:9')
finally:
 server.terminate()
 try:server.wait(timeout=5)
 except subprocess.TimeoutExpired:server.kill();server.wait()
 log.close();shutil.rmtree(TEMP)
