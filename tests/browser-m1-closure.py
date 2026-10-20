"""Guided renderer parity, branch isolation, saved evidence, clipboard and responsive browser gates."""
import json, os, pathlib, socket, subprocess, tempfile, time, shutil, zipfile
from playwright.sync_api import sync_playwright, expect
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('ONE_BROWSER_EVIDENCE_DIR',str(ROOT/'.test-evidence/m1-closure')));OUT.mkdir(parents=True,exist_ok=True)
TMP=pathlib.Path(tempfile.mkdtemp(prefix='m1-closure-'))
with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
base=f'http://127.0.0.1:{port}';env={**os.environ,'HOST':'127.0.0.1','PORT':str(port),'TRAINING_ENGINE_TEST_ACCOUNTS':'1',**{f'TRAINING_ENGINE_{k}_DIR':str(TMP/k.lower()) for k in ['DATA','STORAGE','BACKUP','EXPORT']}}
log=open(TMP/'server.log','w');server=subprocess.Popen(['node','app/server.mjs'],cwd=ROOT,env=env,stdout=log,stderr=log)
checks=[]
try:
 with sync_playwright() as p:
  api=p.request.new_context(base_url=base)
  for _ in range(180):
   try:
    if api.get('/api/health',timeout=1000).ok:break
   except Exception:pass
   time.sleep(.1)
  def req(url,token=None,data=None,method='POST'):
   r=api.fetch(url,method=method if data is not None or method!='POST' else 'GET',headers={'X-Session-Token':token,'X-File-Name':'course.json'} if token else {},**({'data':data} if data is not None else {}));assert r.ok,(url,r.status,r.text()[:300]);return r.json()
  at=req('/api/login',data={'username':'TRAINER','password':'TRAIN1234'})['token'];st=req('/api/login',data={'username':'DEMO01','password':'D1001'});sid=st['user']['id'];token=st['token']
  browser=p.chromium.launch(executable_path=os.environ.get('ONE_BROWSER_EXECUTABLE') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  def context(token,locale,width):
   ctx=browser.new_context(viewport={'width':width,'height':900});ctx.add_init_script('const v='+json.dumps({'token':token,'locale':locale})+';sessionStorage.setItem("training_engine_session",v.token);sessionStorage.setItem("training_engine_session_rotated_at",String(Date.now()));localStorage.setItem("training_engine_locale",v.locale);Object.defineProperty(crypto,"randomUUID",{value:undefined,configurable:true});Object.defineProperty(navigator,"clipboard",{value:{writeText:async text=>{window.copiedText=text}}});');return ctx
  for language,branch,width,mode,theme,ui_locale in [('en',0,1440,'trainer_paced','light','en'),('en',1,390,'participant_paced','dark','en'),('ar',0,390,'trainer_paced','light','ar'),('ar',1,768,'participant_paced','dark','ar'),('en',0,768,'participant_paced','light','ar'),('ar',1,1440,'trainer_paced','dark','en')]:
   fixture=json.loads(subprocess.check_output(['node','--input-type=module','-e',f'import {{completeGuidedExample}} from "./tools/guided-examples.mjs";console.log(JSON.stringify(completeGuidedExample("{language}")))'],cwd=ROOT));fixture['course']['id']+=f'-{branch}-{mode}';mod=fixture['course']['modules'][0];imp=req('/api/courses/import',at,fixture);cid=req('/api/classes',at,{'title':'Full M1 experience','course_version_id':imp['version_id'],'participant_ids':[sid]})['id'];req(f'/api/classes/{cid}/activate',at,{})
   if mode=='participant_paced':req(f'/api/live/{cid}/delivery',at,{'delivery_mode':mode},method='PATCH')
   else:req(f'/api/live/{cid}/practice',at,{'module_id':mod['id'],'workflow_node_id':'practice'})
   ctx=context(token,ui_locale,width);ctx.add_init_script('localStorage.setItem("training_engine_theme",'+json.dumps(theme)+')');page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(base+f'/student?class_id={cid}');page.locator('[data-guided-path]').first.wait_for();assert page.locator('[data-guided-path]').count()==2;page.screenshot(path=str(OUT/f'choice-{language}-{branch}-{width}.png'),full_page=True,animations="disabled");page.locator('[data-guided-path]').nth(branch).click();path=mod['paths'][branch]
   for index,reference in enumerate(path['steps']):
    key=reference['id'];print('M1_STEP',language,branch,key,flush=True);step=mod['step_templates'][reference['use_template']];expect(page.locator('[data-guided-step]')).to_have_attribute('data-guided-step',key);assert page.locator('.guided-activity').get_attribute('dir')==('rtl' if language=='ar' else 'ltr');assert page.evaluate('document.documentElement.lang')==ui_locale;assert ('Cairo' if language=='ar' else 'Montserrat') in page.locator('.guided-activity .live-panel-head h2').evaluate('(e)=>getComputedStyle(e).fontFamily')
    if reference['use_template']=='prepare':
     assert page.locator('.resource-card').count()==3;page.locator('[data-resource-copy]').first.click();assert page.evaluate('window.copiedText')=='https://notebooklm.google.com/'
    if reference['use_template']=='ask':
     page.locator('[data-prompt-editor]').fill('Saved authored response / نص محفوظ');
     with page.expect_response(lambda r:'/api/student/runtime/' in r.url and r.request.method=='PUT') as saved:page.locator('[data-prompt-editor]').blur()
     assert saved.value.ok;page.reload();expect(page.locator('[data-prompt-editor]')).to_have_value('Saved authored response / نص محفوظ');page.locator('[data-content-copy]').focus();page.keyboard.press('Enter');assert page.evaluate('window.copiedText')=='Saved authored response / نص محفوظ';expect(page.locator('[data-copy-status]')).to_have_text('تم النسخ ✓' if ui_locale=='ar' else 'Copied ✓');expect(page.locator('[data-copy-status]')).to_have_text('',timeout=5000)
    if reference['use_template']=='verify':
     prompt=page.locator('.prompt-preview').first;assert prompt.evaluate('(e)=>e.scrollHeight>e.clientHeight');page.locator('[data-content-copy]').focus();page.keyboard.press('Enter');assert page.evaluate('window.copiedText')==prompt.locator('code').inner_text();page.screenshot(path=str(OUT/f'prompt-{language}-{branch}-{width}.png'),full_page=True,animations="disabled")
    if reference['use_template']=='reteach':
     if branch:assert page.locator('.prompt-block').count()==0
     else:assert page.locator('.prompt-block').count()==1
    ids=([step['interaction']] if 'interaction' in step else [])+step.get('interactions',[])
    for ref in ids:
     form=page.locator('[data-guided-interaction="'+ref['activity_id']+'"]');activity=next(a for a in mod['activities'] if a['id']==ref['activity_id']);kind=activity['type']
     if kind in ['rating','confidence']:form.locator('input[name=answer][value="'+str((2 if not branch else 5) if kind=='confidence' else 4)+'"]').check()
     elif kind=='single_choice':form.locator('input[name=answer]').first.check()
     else:form.locator('textarea[name=answer]').fill('Evidence-based learning / تعلم قائم على الدليل')
     try:
      with page.expect_response(lambda r:'/guided/' in r.url and r.url.endswith('/response')) as stored:form.locator('button[type=submit]').click()
     except Exception:
      print('M1_FAILURE',key,form.inner_text(),page.locator('[data-guided-status]').all_text_contents(),errors,flush=True);page.screenshot(path=str(OUT/'failure.png'),full_page=True);raise
     assert stored.value.ok,stored.value.text()
     expect(page.locator('[data-guided-interaction="'+ref['activity_id']+'"] [role=status]')).to_have_text('تم حفظ الإجابة' if ui_locale=='ar' else 'Response saved')
    evidence=page.locator('[data-guided-evidence]')
    if evidence.count():evidence.check()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    if reference['use_template']=='evaluate':page.screenshot(path=str(OUT/f'evaluation-{language}-{branch}-{width}.png'),full_page=True,animations="disabled")
    action=page.locator('[data-guided-nav=finish]') if index==len(path['steps'])-1 else page.locator('[data-guided-nav=next]');expect(action).to_be_enabled();action.click()
   expect(page.locator('.guided-activity')).to_contain_text('اكتمل المسار' if ui_locale=='ar' else 'Path completed');assert not errors,errors;page.screenshot(path=str(OUT/f'completion-{language}-{branch}-{width}.png'),full_page=True,animations="disabled");state=req(f'/api/student/runtime/{cid}',token)['state'];assert state['status']=='finished';assert len([v for v in state['progress']['steps'].values() if v.get('completed_at')])==11;assert state['progress']['steps'][f'm1-{"scholarship" if branch else "sleep"}-reteach']['skipped']==bool(branch);report=req('/api/reports/guided',at);assert len([q for q in report['evaluations'] if q['class_title']=='Full M1 experience' and q['title'] in [a['title'] for a in mod['activities'] if a['id'].startswith('m1-evaluation-')]])>=10
   if mode=='trainer_paced':
    req(f'/api/live/{cid}/practice/close',at,{});flow=req(f'/api/live/{cid}/workflow',at)['workflow'];assert flow['next']['id']=='join';req(f'/api/live/{cid}/workflow/generic',at,{'module_id':mod['id'],'node_id':'join'});req(f'/api/live/{cid}/clear',at,{});flow=req(f'/api/live/{cid}/workflow',at)['workflow'];assert flow['next']['id']=='closing';req(f'/api/live/{cid}/workflow/generic',at,{'module_id':mod['id'],'node_id':'closing'});req(f'/api/live/{cid}/clear',at,{});assert req(f'/api/live/{cid}/workflow',at)['workflow']['modules'][0]['complete']
   ctx.close();checks.append({'language':language,'branch':branch,'width':width,'mode':mode,'theme':theme,'ui_locale':ui_locale,'status':'PASS'});print('FULL_M1_ROUTE_PASS',language,branch,width,mode,flush=True)
  before_revision=req(f'/api/student/runtime/{cid}',token)['state']['revision'];before_report=req('/api/reports/guided',at)
  for branch in [0,1]:
   ctx=context(at,'en',1440);page=ctx.new_page();page.goto(base+'/builder?course_id='+str(imp['course_id']));page.locator('.builder-tabs [data-tab=preview]').click();page.locator('#previewMode').select_option('participant');page.locator('[data-guided-path]').nth(branch).click();path=mod['paths'][branch]
   for index,reference in enumerate(path['steps']):
    key=reference['id'];step=mod['step_templates'][reference['use_template']];expect(page.locator('[data-guided-step]')).to_have_attribute('data-guided-step',key)
    if reference['use_template']=='ask':
     page.locator('[data-prompt-editor]').fill('Preview only authored text');page.locator('[data-prompt-editor]').blur();page.locator('[data-content-copy]').click();assert page.evaluate('window.copiedText')=='Preview only authored text'
    for ref in ([step['interaction']] if 'interaction' in step else [])+step.get('interactions',[]):
     form=page.locator('[data-guided-interaction="'+ref['activity_id']+'"]');activity=next(a for a in mod['activities'] if a['id']==ref['activity_id']);kind=activity['type']
     if kind in ['rating','confidence']:form.locator('input[name=answer][value="'+str((2 if not branch else 5) if kind=='confidence' else 4)+'"]').check()
     elif kind=='single_choice':form.locator('input[name=answer]').first.check()
     else:form.locator('textarea[name=answer]').fill('Preview learning evidence')
     form.locator('button[type=submit]').click();expect(page.locator('[data-guided-interaction="'+ref['activity_id']+'"] [role=status]')).to_have_text('Response saved')
    evidence=page.locator('[data-guided-evidence]')
    if evidence.count():evidence.check()
    action=page.locator('[data-guided-nav=finish]' if index==len(path['steps'])-1 else '[data-guided-nav=next]');expect(action).to_be_enabled();action.click()
   expect(page.locator('.guided-preview')).to_contain_text('Path completed');ctx.close();checks.append({'preview_branch':branch,'status':'PASS'});print('FULL_M1_PREVIEW_PASS',branch,flush=True)
  assert req(f'/api/student/runtime/{cid}',token)['state']['revision']==before_revision;assert req('/api/reports/guided',at)==before_report
  browser.close();api.dispose()
 (OUT/'result.json').write_text(json.dumps({'status':'PASS','checks':checks},indent=2));print('FULL_M1_BROWSER_PASS',len(checks),'complete routes, shared convergence/evaluation/closing, conditional remediation, source copy, exact prompt copy, resume and both delivery modes')
finally:
 server.terminate()
 try:server.wait(timeout=5)
 except subprocess.TimeoutExpired:server.kill();server.wait()
 log.close()
