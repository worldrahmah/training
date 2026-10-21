"""Independent browser repair gates; disposable data, no credentials in artifacts."""
import json, os, pathlib, shutil, socket, subprocess, tempfile, time
from playwright.sync_api import sync_playwright,expect

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('ONE_WORKSPACE_EVIDENCE_DIR',str(ROOT/'.test-evidence/workspace')))
OUT.mkdir(parents=True,exist_ok=True)
TEMP=pathlib.Path(tempfile.mkdtemp(prefix='one-browser-'))
with socket.socket() as sock:sock.bind(('127.0.0.1',0));PORT=sock.getsockname()[1]
BASE=f'http://127.0.0.1:{PORT}'
env={**os.environ,'HOST':'127.0.0.1','PORT':str(PORT),**{f'TRAINING_ENGINE_{k}_DIR':str(TEMP/k.lower()) for k in ['DATA','STORAGE','BACKUP','EXPORT']}}
log=open(TEMP/'server.log','w');server=subprocess.Popen(['node','--no-warnings','app/server.mjs'],cwd=ROOT,env=env,stdout=log,stderr=log)
results=[]
page_errors=[]
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
  def context(token,locale,theme='light',system='light'):
   if token:req('/api/account/preferences',token,{'language':locale,'theme':theme},'PATCH')
   c=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce',color_scheme=system)
   c.on('page',lambda page:page.on('pageerror',lambda error:page_errors.append(str(error))))
   c.route('https://**/*',lambda route:route.abort())
   c.add_init_script('const x='+json.dumps({'token':token or '', 'locale':locale,'theme':theme,'origin':BASE})+';if(location.origin===x.origin){sessionStorage.setItem("training_engine_session",x.token);sessionStorage.setItem("training_engine_session_rotated_at",String(Date.now()));localStorage.setItem("training_engine_locale",x.locale);localStorage.setItem("training_engine_theme",x.theme);}')
   return c
  CONTRAST_JS="()=>{const rgb=s=>{const m=s.match(/rgba?\\(([^)]+)\\)/);if(m)return m[1].split(/[ ,/]+/).filter(Boolean).map(Number);if(s.startsWith('color(srgb')){const a=s.slice(11,-1).trim().split(/[ /]+/).map(Number);return [a[0]*255,a[1]*255,a[2]*255,a[3]??1]}return null},lum=a=>a.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0);let checked=0,skipped=0,failures=[];for(const el of document.querySelectorAll('label,p,h1,h2,h3,h4,small,.one-menu-item,.eyebrow,.stat-label,.stat-value,.btn,.one-kicker,th,td')){if(!el.getClientRects().length||el.closest('[hidden]')||el.disabled||!el.textContent.trim())continue;const style=getComputedStyle(el),fg=rgb(style.color);let bg=null,gradient=false;for(let n=el;n;n=n.parentElement){const st=getComputedStyle(n);if(st.backgroundImage!=='none'){gradient=true;break}const x=rgb(st.backgroundColor);if(x&&((x[3]??1)>.98)){bg=x;break}}if(gradient||!bg||!fg){skipped++;continue}const opacity=Number(style.opacity);if(opacity<.7){skipped++;continue}const f=lum(fg),b=lum(bg),ratio=(Math.max(f,b)+.05)/(Math.min(f,b)+.05),large=parseFloat(style.fontSize)>=24||(parseFloat(style.fontSize)>=18.66&&Number(style.fontWeight)>=700),minimum=large?3:4.5;checked++;if(ratio+1e-9<minimum)failures.push({text:el.textContent.trim().slice(0,90),tag:el.tagName,class:el.className,ratio:Number(ratio.toFixed(2)),minimum,color:style.color,bg:style.backgroundColor})}return {checked,skipped,failures}}"
  adminstaff=req('/api/staff',at,{'username':'WORKSPACEADMIN','password':'WorkspaceTest123!','display_name':'Workspace administrator','staff_role':'administrator'},'POST');admt=req('/api/login',data={'username':'WORKSPACEADMIN','password':'WorkspaceTest123!'},method='POST')['token']
  contrast_evidence=[]
  def bounds(panel):
   r=panel.bounding_box();trigger=panel.page.locator('[popovertarget="'+panel.get_attribute('id')+'"]');a=trigger.bounding_box();assert min(abs(r['y']-(a['y']+a['height'])),abs((r['y']+r['height'])-a['y']))<=12,'Disclosure must stay attached to its actual trigger';assert r and r['x']>=10 and r['y']>=10 and r['x']+r['width']<=panel.page.viewport_size['width']-10 and r['y']+r['height']<=panel.page.viewport_size['height']-10,r
  def contrast(page):
   result=page.evaluate(CONTRAST_JS);contrast_evidence.append(result);assert not result['failures'],result['failures'][:12]
  def check(page,label,screens):
   page.on('dialog',lambda dialog:dialog.accept())
   page.evaluate('async()=>{await document.fonts.ready}')
   for width in screens:
    page.set_viewport_size({'width':width,'height':900 if width==1440 else 1024 if width==768 else 844});page.wait_for_timeout(80);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),label+': overflow';contrast(page);page.screenshot(path=str(OUT/f'{label}-{width}.png'),full_page=True)
   results.append({'view':label,'widths':screens})
  # Every entry surface, including system appearance under both OS preferences.
  for locale in ['en','ar']:
   for theme,system in [('light','light'),('dark','dark'),('system','dark'),('system','light')]:
    for surface in ['admin','trainer','student','builder']:
     c=context(None,locale,theme,system);page=c.new_page();page.goto(BASE+'/'+surface);page.wait_for_selector('#loginForm');check(page,f'entry-{surface}-{locale}-{theme}-{system}',screens=[1440,390]);
     menu=page.locator('.login-card-head .one-menu-trigger');menu.click();panel=page.locator('.one-menu-panel:popover-open');panel.wait_for();assert menu.get_attribute('aria-expanded')=='true';assert panel.locator('#loginLang').is_visible();assert panel.locator('#loginTheme').is_visible();bounds(panel);contrast(page);page.screenshot(path=str(OUT/f'entry-menu-{surface}-{locale}-{theme}-{system}.png'));page.keyboard.press('Escape');assert menu.get_attribute('aria-expanded')=='false';assert menu.evaluate('(b)=>b===document.activeElement');menu.press('ArrowDown');expect(page.locator('#loginLang')).to_be_focused();page.keyboard.press('Escape');c.close()
  # Management navigation: read every actual view in both locales/appearances.
  for locale in ['en','ar']:
   for theme in ['light','dark']:
    for surface,token,views in [('admin',at,['overview','live','courses','classes','staff','people','reports','messages','settings']),('trainer',tt,['home','courses','classes','students','reports','settings'])]:
     c=context(token,locale,theme);page=c.new_page();page.goto(BASE+'/'+surface);page.wait_for_selector('.side');
     for view in views:
      page.locator(f'.side [data-nav="{view}"]').click();page.wait_for_timeout(180);page.locator('#page h1').first.wait_for();check(page,f'{surface}-{view}-{locale}-{theme}',screens=[1440,390]);page.set_viewport_size({'width':1440,'height':900});
     c.close()
  # Real account creation from the actual administrator surface.
  c=context(admt,'en');page=c.new_page();page.goto(BASE+'/admin');page.wait_for_selector('.side');assert page.locator('.side [data-nav="staff"]').is_visible();page.locator('.side [data-nav="staff"]').click();page.wait_for_selector('[data-discovery-toolbar="admin-staff"]');page.locator('[data-action="add-trainer"]').click();dialog=page.get_by_role('dialog');dialog.locator('[name="name"]').fill('Created in Admin');dialog.locator('[name="username"]').fill('UICREATED');dialog.locator('[name="email"]').fill('ui@example.test');dialog.locator('[name="password"]').fill('WorkspaceTest123!');dialog.locator('[name="role"]').select_option('trainer');dialog.locator('[data-confirm]').click();dialog.wait_for(state='detached');created=req('/api/login',data={'username':'UICREATED','password':'WorkspaceTest123!'},method='POST');assert created['user']['staff_role']=='trainer';check(page,'admin-created-staff',screens=[1440]);c.close()
  # Preview opens the actual selected authorized version inside a shared-session frame.
  c=context(at,'en');page=c.new_page();page.goto(BASE+'/admin');page.wait_for_selector('.side');page.locator('.side [data-nav="courses"]').click();page.locator(f'[data-action="manage-course"][data-id="{imp["course_id"]}"]').click();page.get_by_role('dialog').locator(f'[data-course-preview="{imp["version_id"]}"]').click();frame=page.frame_locator('.course-preview-frame');frame.locator('.preview-activity').wait_for();assert frame.locator('.cue').count()==1;frame.locator('[data-preview-mode="participant"]').click();assert frame.locator('.cue').count()==0;assert frame.locator('.preview-response-note').is_visible();frame.locator('[data-preview-mode="projector"]').click();frame.locator('[data-preview-theme]').select_option('light');frame.locator('[data-projector-theme="light"]').wait_for();page.screenshot(path=str(OUT/'authorized-course-preview.png'));page.keyboard.press('Escape');c.close()
  # Search is a real scoped drill-down, rather than a browser prompt or dead result.
  c=context(at,'en');page=c.new_page();page.goto(BASE+'/admin');page.wait_for_selector('.side');page.locator('.topbar .workspace-search').click();page.locator('[data-workspace-query]').fill('Classroom Studio');page.locator('[data-search-index]').first.wait_for();page.locator('.workspace-search-result').filter(has=page.locator('.badge',has_text='Course')).first.click();page.get_by_role('dialog').locator('[name="title"]').wait_for();assert page.get_by_role('dialog').locator('[name="title"]').input_value()=='Classroom Studio';page.keyboard.press('Escape');c.close()
  # Mandatory temporary-password onboarding must be usable, not a generic 428 dead end.
  tempstaff=req('/api/staff',at,{'username':'TEMPWORKSPACE','password':'WorkspaceTest123!','display_name':'Temporary account','staff_role':'trainer','must_change_password':True},'POST');c=context(None,'en');page=c.new_page();page.goto(BASE+'/trainer');page.locator('[name="username"]').fill('TEMPWORKSPACE');page.locator('[name="password"]').fill('WorkspaceTest123!');page.locator('#loginForm [type="submit"]').click();page.wait_for_selector('#temporaryCurrent');assert page.locator('.side').count()==0;page.locator('#temporaryCurrent').fill('WorkspaceTest123!');page.locator('#temporaryNew').fill('PersonalWorkspace123!');page.locator('#temporaryConfirm').fill('PersonalWorkspace123!');page.locator('#loginForm [type="submit"]').click();page.wait_for_selector('.side');check(page,'password-onboarding-complete',screens=[1440]);c.close()
  # Ordinary trainer has scoped courses, no staff provisioning and no creation controls.
  c=context(tt,'en');page=c.new_page();page.goto(BASE+'/trainer');page.wait_for_selector('.side');assert page.locator('.side [data-nav="team"]').count()==0;page.locator('.side [data-nav="classes"]').click();page.locator('[data-discovery-toolbar="trainer-classes"]').wait_for();assert page.locator('[data-action="new-class"]').count()==0;c.close()
  # Builder: actual disclosure actions, saved IDs/content, undo and private publishing policy.
  for locale in ['en','ar']:
   for theme in ['light','dark']:
    c=context(at,locale,theme);page=c.new_page();page.goto(BASE+f'/builder?course_id={imp["course_id"]}');page.wait_for_selector('.tree-module');check(page,f'builder-flow-{locale}-{theme}',screens=[1440,768,390]);page.set_viewport_size({'width':1440,'height':900});trigger=page.locator('.tree-node .one-menu-trigger').first;trigger.click();panel=page.locator('.one-menu-panel:popover-open');panel.wait_for();bounds(panel);contrast(page);page.screenshot(path=str(OUT/f'builder-item-menu-{locale}-{theme}.png'));page.keyboard.press('Escape');assert trigger.evaluate('(b)=>b===document.activeElement');page.locator('.tree-module-head [popovertarget]').first.click();page.locator('.one-menu-panel:popover-open [data-add="activity"]').click();page.wait_for_selector('#actTitle');page.locator('#actTitle').fill('A deliberate new activity');page.locator('[data-a="apply-activity"]').click();page.locator('[data-a="save"]').click();page.wait_for_timeout(250);page.reload();page.wait_for_selector('.tree-module');assert page.locator('.tree-node-title').filter(has_text='A deliberate new activity').count()==1
    # Undo test was covered by Node/Builder tests; keep this published sample stable for next browser pass.
    title=page.locator('.tree-node').filter(has_text='A deliberate new activity');title.locator('.one-menu-trigger').click();page.locator('.one-menu-panel:popover-open [data-del]').click();page.wait_for_timeout(100);page.locator('[data-a="save"]').click();page.wait_for_timeout(180);c.close()
  req(f'/api/staff/{staff["id"]}/permissions',at,{'permissions':[{'resource_type':'course','resource_id':str(imp['course_id']),'action':'edit'}]},'PUT');c=context(tt,'en');page=c.new_page();page.goto(BASE+f'/builder?course_id={imp["course_id"]}');page.wait_for_selector('.tree-module');assert page.locator('[data-a="publish"]').is_disabled();c.close()
  # Unsent form input survives locale/SSE redraw; queued responses replay once on reconnect.
  c=context(st,'en');page=c.new_page();page.goto(BASE+f'/student?class_id={cid}');page.wait_for_selector('select[data-key="p1"]');page.locator('select[data-key="p1"]').select_option('Processor');page.locator('select[data-key="p2"]').select_option('Memory');page.locator('.student-top .one-menu-trigger').click();page.locator('.one-menu-panel:popover-open [data-action="language"]').click();assert page.locator('select[data-key="p1"]').input_value()=='Processor';assert page.locator('select[data-key="p2"]').input_value()=='Memory';c.set_offline(True);page.locator('#responseForm [type="submit"]').click();page.wait_for_timeout(250);queue=page.evaluate('JSON.parse(localStorage.getItem("training_engine_response_queue_v1")||"[]")');assert len(queue)==1 and queue[0]['student_id']==learner['user']['id'],queue;c.set_offline(False)
  for _ in range(40):
   queue=page.evaluate('JSON.parse(localStorage.getItem("training_engine_response_queue_v1")||"[]")')
   if not queue:break
   page.wait_for_timeout(100)
  assert not queue,'Reconnect must replay and acknowledge the saved answer';page.locator('.response-saved-state').wait_for();assert req(f'/api/student/dashboard?class_id={cid}',st)['active']['personal_response']['submitted']
  # A permanent rejection stays reviewable; another identity's row is never replayed.
  iid=req(f'/api/student/dashboard?class_id={cid}',st)['active']['instance']['id'];page.evaluate('rows=>localStorage.setItem("training_engine_response_queue_v1",JSON.stringify(rows))',[{'student_id':learner['user']['id'],'instance_id':9999999,'answer':'retain me','status':'pending','queue_id':'rejected','queued_at':'2026-10-13T00:00:00Z'},{'student_id':9999998,'instance_id':iid,'answer':'another account','status':'pending','queue_id':'another','queued_at':'2026-10-13T00:00:00Z'}]);page.evaluate('dispatchEvent(new Event("online"))')
  for _ in range(20):
   queue=page.evaluate('JSON.parse(localStorage.getItem("training_engine_response_queue_v1")||"[]")')
   if queue[0].get('status')=='failed':break
   page.wait_for_timeout(100)
  assert len(queue)==2 and queue[0]['status']=='failed' and queue[1]['status']=='pending',queue;page.locator('.student-top .one-menu-trigger').click();page.locator('.one-menu-panel:popover-open [data-action="response-queue"]').click();assert page.get_by_role('dialog').locator('.queue-response').count()==1;check(page,'response-recovery',screens=[1440,390]);page.keyboard.press('Escape');c.close()
  # Arabic UI copy within an English course: verify visual glyph order of the final dot.
  req(f'/api/live/{cid}/clear',tt,{},'POST')
  for locale in ['en','ar']:
   for theme in ['light','dark']:
    c=context(st,locale,theme);page=c.new_page();page.goto(BASE+f'/student?class_id={cid}');page.wait_for_selector('.student-hero p');check(page,f'student-waiting-{locale}-{theme}',screens=[1440,768,390]);
    if locale=='ar':
     para=page.locator('.student-hero p');assert para.get_attribute('dir')=='auto';assert para.evaluate('(p)=>getComputedStyle(p).direction')=='rtl';positions=para.evaluate('''p=>{const node=p.firstChild,s=node.textContent;const dot=document.createRange(),last=document.createRange();dot.setStart(node,s.length-1);dot.setEnd(node,s.length);last.setStart(node,s.length-2);last.setEnd(node,s.length-1);return {dot:dot.getBoundingClientRect().x,last:last.getBoundingClientRect().x,text:s}}''');assert positions['text'].endswith('.');assert positions['dot']<positions['last'],positions
    page.locator('.student-top .one-menu-trigger').click();bounds(page.locator('.one-menu-panel:popover-open'));contrast(page);page.screenshot(path=str(OUT/f'student-account-menu-{locale}-{theme}.png'));page.keyboard.press('Escape');
    page.locator('[data-class-workspace]').click();page.locator('#your-learning').wait_for()
    section=page.locator('.student-disclosure').filter(has=page.locator('.learning-card')).first
    if section.count() and section.get_attribute('open') is None:section.locator('summary').click()
    with page.expect_download() as download:page.locator('.learning-card a[href*="calendar.ics"]').first.click()
    file=download.value;file.save_as(str(OUT/f'calendar-{locale}-{theme}.ics'));assert 'BEGIN:VCALENDAR' in pathlib.Path(file.path()).read_text();c.close()
  # Locale switching changes actual computed typography, not just font availability.
  c=context(st,'en');page=c.new_page();page.goto(BASE+'/student');page.wait_for_selector('.student-top');page.locator('.student-top .one-menu-trigger').click();page.locator('.one-menu-panel:popover-open [data-action="language"]').click();assert page.evaluate('document.documentElement.lang')=='ar';assert 'Cairo' in page.locator('body').evaluate('(e)=>getComputedStyle(e).fontFamily');c.close()
  # Live interaction disclosures in both themes/locales; the Projector remains display-only.
  for locale in ['en','ar']:
   for theme in ['light','dark']:
    c=context(tt,locale,theme);page=c.new_page();page.goto(BASE+f'/live?class_id={cid}');page.wait_for_selector('.one-live-header');check(page,f'live-console-{locale}-{theme}',screens=[1440,768,390]);page.locator('.one-live-head-actions .one-menu-trigger').click();bounds(page.locator('.one-menu-panel:popover-open'));contrast(page);page.screenshot(path=str(OUT/f'live-tools-menu-{locale}-{theme}.png'));c.close()
  assert not page_errors,page_errors;browser.close();summary={'status':'PASS','visits':results,'contrast':contrast_evidence,'checks':['32 entry/theme/locale variants','all Admin/Trainer navigation views EN/AR light/dark','actual Admin staff creation','mandatory password onboarding','ordinary-trainer boundaries','Builder menu actions and persisted content','Arabic final-dot glyph order in LTR course','authenticated calendar download','computed Cairo after locale switch','Live disclosure tools','authorized course preview','input preservation and offline replay/ownership/rejection retention'],'page_errors':page_errors};(OUT/'WORKSPACE_RESULT.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2));print(f'BROWSER_WORKSPACE_PASS {len(results)} recorded screen/view checks; contrast, menus, actual writes, onboarding, RTL punctuation, calendar, role boundaries')
finally:
 server.terminate()
 try:server.wait(timeout=5)
 except subprocess.TimeoutExpired:server.kill();server.wait()
 log.close();shutil.rmtree(TEMP,ignore_errors=True)
