"""Independent browser repair gates; disposable data, no credentials in artifacts."""
import json, os, pathlib, shutil, socket, subprocess, tempfile, time
from playwright.sync_api import sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('ONE_BROWSER_EVIDENCE_DIR',str(ROOT/'.test-evidence/browser')))
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
  for locale in ['en','ar']:
   for name,url,token in [('admin','/admin',at),('trainer','/trainer',tt),('builder',f'/builder?course_id={imp["course_id"]}',at),('live',f'/live?class_id={cid}',tt),('student',f'/student?class_id={cid}',st),('projector',f'/present?class_id={cid}&pair={pair}',None)]:
    if name=='student' and locale=='ar':
     req(f'/api/live/{cid}/clear',tt,{},'POST');req(f'/api/live/{cid}/launch',tt,{'module_id':'m','activity_id':'match','override':True},'POST')
    c=context(token,locale);page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+url);page.locator('h1,h2').first.wait_for();page.wait_for_timeout(350)
    page.evaluate('async()=>{await document.fonts.load("600 16px Montserrat");await document.fonts.load("600 16px Cairo");await document.fonts.ready;}')
    assert page.evaluate('[...document.fonts].filter(f=>f.status==="loaded").length')>=2,'Offline official fonts must actually load'
    if name=='admin':
     page.locator('.side [data-nav="people"]').click();page.wait_for_selector('[data-discovery-toolbar="admin-participants"]')
     search=page.locator('[data-discovery-toolbar="admin-participants"] [data-discovery-search]');search.fill('No such learner');assert page.locator('[data-discovery-scope="admin-participants"] [data-discovery-item]:visible').count()==0
     page.locator('[data-discovery-toolbar="admin-participants"] [data-discovery-reset]').click();assert page.locator('[data-discovery-scope="admin-participants"] [data-discovery-item]:visible').count()>0
     trigger=page.locator('[data-action="add-participant"]');trigger.click();dialog=page.get_by_role('dialog');dialog.wait_for()
     for _ in range(18):page.keyboard.press('Tab');assert dialog.evaluate('(d)=>d.contains(document.activeElement)')
     page.keyboard.press('Escape');assert page.get_by_role('dialog').count()==0;assert trigger.evaluate('(b)=>document.activeElement===b')
     page.screenshot(path=str(OUT/f'admin-people-{locale}-desktop.png'),full_page=True)
     page.locator('.side [data-nav="reports"]').click();page.wait_for_selector('[data-chart-dataset]')
     page.locator('[data-chart-dataset]').select_option(label='Course performance' if locale=='en' else 'أداء الدورة')
     assert page.locator('[data-chart-stage] .report-bar-row').count()>20,'Returned chart rows must not be silently capped'
     assert page.locator('[data-chart-type] option[value="pie"]').get_attribute('disabled') is not None, page.locator('[data-chart-type]').evaluate('(s)=>s.outerHTML');assert page.locator('[data-chart-type] option[value="line"]').get_attribute('disabled') is not None
     page.locator('[data-chart-filter]').fill('Review course 23');assert page.locator('[data-chart-stage] .report-bar-row').count()==1;page.locator('[data-chart-filter]').fill('')
     page.locator('[data-analytics-export]').click()
     with page.expect_download() as download:page.locator('[data-download-csv]').click()
     page.get_by_role('dialog').locator('[data-close]').first.click()
     d=download.value;d.save_as(str(OUT/f'admin-export-{locale}.csv'));assert 'Review course 23' in pathlib.Path(d.path()).read_text(encoding='utf-8-sig')
    if name=='trainer':
     page.locator('.side [data-nav="reports"]').click();page.wait_for_selector('[data-chart-dataset]')
    if name=='student':
     assert page.locator('select[name="match"]').count()==2
     page.locator('select[data-key="p1"]').select_option('Processor');page.locator('select[data-key="p2"]').select_option('Memory')
     page.locator('#responseForm button[type="submit"]').click();page.locator('.response-saved-state').wait_for();assert page.locator('select[data-key="p1"]').input_value()=='Processor'
     current=req(f'/api/student/dashboard?class_id={cid}',st)['active'];assert 'trainer' not in current['item'];assert 'right' not in current['item']['matching']['pairs'][0]
    page.screenshot(path=str(OUT/f'{name}-{locale}-desktop.png'),full_page=True)
    for width,height in [(768,1024),(390,844)]:
     page.set_viewport_size({'width':width,'height':height});page.wait_for_timeout(120)
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),f'{name}/{locale}: document overflow at {width}'
     page.screenshot(path=str(OUT/f'{name}-{locale}-{width}.png'),full_page=True)
    assert not errors,(name,locale,errors);results.append({'surface':name,'locale':locale,'widths':[1440,768,390],'offline_fonts':'PASS','page_errors':errors});c.close()
  # Real chart semantic cases including zero totals, ordered data and all table rows.
  c=context(at,'en','dark');page=c.new_page();page.goto(BASE+'/admin');page.wait_for_selector('.side');
  page.evaluate('async()=>{const {mountReportChartWorkspace}=await import("/report-charts.js");const el=document.createElement("section");el.id="chart-fixture";el.className="card report-chart-workspace";document.querySelector("#page").replaceChildren(el);mountReportChartWorkspace(el,[{label:"Ordered",ordered:true,labelKey:"label",rows:[{label:"Day 1",value:0},{label:"Day 2",value:2}],metrics:[{key:"value",label:"Responses"}]},{label:"Distribution",partition:true,labelKey:"label",rows:[{label:"Present",value:0},{label:"Absent",value:0}],metrics:[{key:"value",label:"Attendance",additive:true}]}]);}')
  page.locator('[data-chart-type]').select_option('line');assert page.locator('[data-chart-stage] .report-chart-svg path').count()==1
  page.locator('[data-chart-dataset]').select_option(label='Distribution');page.locator('[data-chart-type]').select_option('pie');assert page.locator('.pie-total').text_content()=='0'
  page.screenshot(path=str(OUT/'chart-dark-zero.png'),full_page=True);c.close()
  # Projector theme variants at a true 16:9 viewport.
  for theme in ['dark','light','high_contrast']:
   req(f'/api/live/{cid}/projector-theme',tt,{'theme':theme},'POST');c=context(None,'en');page=c.new_page();page.set_viewport_size({'width':1600,'height':900});page.goto(BASE+f'/present?class_id={cid}&pair={pair}');page.wait_for_selector(f'[data-projector-theme="{theme}"]');page.screenshot(path=str(OUT/f'projector-{theme}-16x9.png'));c.close()
  browser.close();api.dispose()
 (OUT/'result.json').write_text(json.dumps({'status':'PASS','role_locale_visits':len(results),'surfaces':results,'gates':['Admin Participants search/reset','dialog keyboard/focus return','authenticated CSV export','26-row charts/filter/compatibility','real matching submission without solution mapping','offline Montserrat/Cairo','EN/AR desktop/tablet/mobile','dark chart zero totals','Projector 16:9 three themes']},indent=2))
 print('BROWSER_REPAIR_PASS 12 role/locale visits; desktop/tablet/mobile, offline fonts, keyboard, export, matching, charts, Projector themes')
finally:
 server.terminate()
 try:server.wait(timeout=5)
 except subprocess.TimeoutExpired:server.kill();server.wait()
 log.close();shutil.rmtree(TEMP)
