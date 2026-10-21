"""Guided renderer parity, branch isolation, saved evidence, clipboard and responsive browser gates."""
import json, os, pathlib, socket, subprocess, tempfile, time, shutil, zipfile
from playwright.sync_api import sync_playwright, expect
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('ONE_BROWSER_EVIDENCE_DIR',str(ROOT/'.test-evidence/guided-persistence')));OUT.mkdir(parents=True,exist_ok=True)
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
  fixture=json.loads(subprocess.check_output(['node','--input-type=module','-e','import {persistenceExample} from "./tools/guided-persistence-fixture.mjs";console.log(JSON.stringify(persistenceExample()))'],cwd=ROOT));mod=fixture['course']['modules'][0]
  package=subprocess.check_output(['node','--input-type=module','-e','import {persistenceExample} from "./tools/guided-persistence-fixture.mjs";import{packageFiles}from"./tools/package-course.mjs";process.stdout.write(packageFiles(new Map([["course.json",Buffer.from(JSON.stringify(persistenceExample()))]])))'],cwd=ROOT)
  r=api.post(base+'/api/courses/import',headers={'X-Session-Token':at,'X-File-Name':'GUIDED_PERSISTENCE_ACCEPTANCE.course.zip'},data=package);assert r.ok,r.text();imp=r.json()
  matrix=[];faults=[];traces=[]
  def queue(page):return page.evaluate('JSON.parse(localStorage.getItem("training_engine_guided_outbox_v1")||"[]")')
  def clear_queue(page):page.wait_for_function('()=>JSON.parse(localStorage.getItem("training_engine_guided_outbox_v1")||"[]").length===0',timeout=30000)
  def runtime(cid):return req(f'/api/student/runtime/{cid}',token)['state']
  def start(branch,title):
   cid=req('/api/classes',at,{'title':title,'course_version_id':imp['version_id'],'participant_ids':[sid]})['id'];req(f'/api/classes/{cid}/activate',at,{});req(f'/api/live/{cid}/practice',at,{'module_id':mod['id'],'workflow_node_id':'practice'});ctx=context(token,'en',390 if branch else 1440);page=ctx.new_page();page.goto(base+f'/student/class?class_id={cid}');page.locator('[data-guided-path]').first.wait_for();page.reload();page.locator('[data-guided-path]').nth(branch).click();page.locator('[data-guided-step]').wait_for();page.reload();page.locator('[data-guided-step]').wait_for();return cid,ctx,page
  def fill(form,kind,changed=False):
   if kind in ['single_choice','reaction','true_false']:form.locator('input[name=answer]').nth(1 if changed else 0).check()
   elif kind in ['multiple_choice','checklist']:
    for box in form.locator('input[name=answer]').all():box.uncheck()
    form.locator('input[name=answer]').nth(1 if changed else 0).check()
   elif kind in ['rating','confidence']:form.locator('input[name=answer][value="'+('2' if changed else '4')+'"]').check()
   elif kind=='numeric_answer':form.locator('input[name=answer]').fill('2' if changed else '3')
   else:form.locator('textarea[name=answer]').fill('Changed confirmed evidence' if changed else 'Online confirmed evidence')
  for branch in ([] if os.environ.get('ONE_GUIDED_RECOVERY_ONLY')=='1' else [0,1]):
   cid,ctx,page=start(branch,'All types technical path '+str(branch));path=mod['paths'][branch]
   for index,reference in enumerate(path['steps']):
    key=reference['id'];step=mod['step_templates'][reference['use_template']];kind=step['completion']['type'];print('PERSISTENCE_STEP',branch,key,flush=True);expect(page.locator('[data-guided-step]')).to_have_attribute('data-guided-step',key)
    evidence=page.locator('[data-guided-evidence]');upload=page.locator('[data-guided-upload]')
    if reference['use_template']=='prepare':assert page.locator('.resource-card a').first.get_attribute('href')=='https://chatgpt.com/';assert ('sleep' if branch==0 else 'scholarship') in page.locator('[data-prompt-editor]').input_value()
    if kind in ['acknowledge','external']:evidence.check()
    elif kind in ['text','url']:evidence.fill('https://example.com/evidence' if kind=='url' else 'My online evidence');evidence.blur()
    elif kind=='checklist':
     for box in page.locator('[data-guided-check]').all():box.check()
    elif kind in ['file','image']:
     file=ROOT/'tests/fixtures/report-logo.png' if kind=='image' else TMP/'evidence.txt';
     if kind=='file':file.write_text('Canonical evidence file')
     ctx.set_offline(True);upload.set_input_files(str(file));expect(page.locator('[data-guided-upload-status]')).to_contain_text('A connection to the server is required.');assert 'Saved' not in page.locator('[data-guided-upload-status]').inner_text();assert not queue(page);ctx.set_offline(False);upload.set_input_files([])
     upload.set_input_files(str(file))
    activity=next((a for a in mod['activities'] if a['id']==step.get('interaction',{}).get('activity_id')),None)
    if activity:
     form=page.locator('[data-guided-interaction="'+activity['id']+'"]');fill(form,activity['type'])
     with page.expect_response(lambda r:'/guided/' in r.url and r.url.endswith('/response')) as stored:form.locator('button[type=submit]').click()
     assert stored.value.ok,stored.value.text();assert stored.value.json()['code']=='CONFIRMED'
    next_button=page.locator('[data-guided-nav]:last-child');expect(next_button).to_be_enabled();clear_queue(page);page.reload();expect(page.locator('[data-guided-step]')).to_have_attribute('data-guided-step',key)
    before=runtime(cid)
    if page.locator('[data-prompt-editor]').count():
     ctx.set_offline(True);page.locator('[data-prompt-editor]').fill('Offline draft '+key);page.locator('[data-prompt-editor]').blur()
     if kind in ['acknowledge','external']:page.locator('[data-guided-evidence]').uncheck();page.locator('[data-guided-evidence]').check()
     elif kind in ['text','url']:page.locator('[data-guided-evidence]').fill('https://example.com/offline' if kind=='url' else 'My offline evidence');page.locator('[data-guided-evidence]').blur()
     elif kind=='checklist':page.locator('[data-guided-check]').first.uncheck();page.locator('[data-guided-check]').first.check()
     if activity:
      form=page.locator('[data-guided-interaction="'+activity['id']+'"]');fill(form,activity['type'],True);form.locator('button[type=submit]').click();page.wait_for_function('()=>JSON.parse(localStorage.getItem("training_engine_guided_outbox_v1")||"[]").some(x=>x.kind==="response")')
     else:page.wait_for_function('()=>JSON.parse(localStorage.getItem("training_engine_guided_outbox_v1")||"[]").length>0')
     expect(page.locator('[data-guided-nav]:last-child')).to_be_disabled();pending=queue(page);assert all(row['user_id']==sid and row['payload']['expected_step_id']==key for row in pending);assert runtime(cid)['revision']==before['revision'];traces.append({'class_id':cid,'path':path['id'],'step':key,'offline_pending':pending})
     ctx.set_offline(False);clear_queue(page);expect(page.locator('[data-guided-nav]:last-child')).to_be_enabled();expect(page.locator('[data-prompt-editor]')).to_have_value('Offline draft '+key);page.reload();expect(page.locator('[data-prompt-editor]')).to_have_value('Offline draft '+key)
     confirmed_state=runtime(cid);confirmed_evidence=confirmed_state['progress']['steps'][key]['evidence'];traces.append({'class_id':cid,'path':path['id'],'step':key,'confirmed_revision':confirmed_state['revision'],'server_evidence':confirmed_evidence,'server_prompts':confirmed_state['progress']['steps'][key]['prompts']})
     if kind in ['acknowledge','external']:assert confirmed_evidence['acknowledged'] is True
     elif kind in ['text','url']:assert confirmed_evidence['text']==('https://example.com/offline' if kind=='url' else 'My offline evidence')
     elif kind=='checklist':assert sorted(confirmed_evidence['checked'])==[0,1]
     elif kind in ['file','image']:assert confirmed_evidence['submission_id']==before['progress']['steps'][key]['evidence']['submission_id']
     if activity:
      dash=req(f'/api/student/dashboard?focused=1&class_id={cid}',token);value=dash['active']['guided_responses'][activity['id']]['value'];expected=False if activity['type']=='true_false' else ['Two'] if activity['type']=='multiple_choice' else ['Verify'] if activity['type']=='checklist' else 2 if activity['type'] in ['rating','confidence','numeric_answer'] else 'Two' if activity['type'] in ['single_choice','reaction'] else 'Changed confirmed evidence';assert value==expected,(activity['type'],value,expected)
    matrix.append({'path':path['id'],'step':key,'area':activity['type'] if activity else kind,'online':'PASS','offline':'PASS' if page.locator('[data-prompt-editor]').count() else 'NOT_APPLICABLE','reconnect':'PASS' if page.locator('[data-prompt-editor]').count() else 'NOT_APPLICABLE','refresh':'PASS','binary_offline':'NOT_SUPPORTED' if kind in ['file','image'] else 'NOT_APPLICABLE','offline_upload_honesty':kind in ['file','image'],'result':'PASS'})
    page.locator('[data-guided-nav]:last-child').click()
   expect(page.locator('.guided-activity')).to_contain_text('Path completed');page.reload();expect(page.locator('.guided-activity')).to_contain_text('Path completed');assert not queue(page)
   req(f'/api/live/{cid}/practice/close',at,{});req(f'/api/live/{cid}/workflow/generic',at,{'module_id':mod['id'],'node_id':'join'});req(f'/api/live/{cid}/clear',at,{});req(f'/api/live/{cid}/workflow/generic',at,{'module_id':mod['id'],'node_id':'closing'});req(f'/api/live/{cid}/clear',at,{});assert req(f'/api/live/{cid}/workflow',at)['workflow']['modules'][0]['complete'];ctx.close()
  cid,ctx,page=start(0,'Online errors classification')
  for status,content,code in ([] if os.environ.get('ONE_GUIDED_RECOVERY_ONLY')=='1' else [(500,'html','SERVER_ERROR'),(500,'json','SERVER_ERROR'),(422,'html','VALIDATION_ERROR'),(422,'json','VALIDATION_ERROR'),(401,'json','UNAUTHORIZED'),(403,'json','FORBIDDEN'),(404,'html','NOT_FOUND'),(409,'json','CONFLICT'),(200,'html','CLIENT_RUNTIME_ERROR')]):
   page.route('**/api/student/runtime/*',lambda route:route.fulfill(status=status,content_type='text/html' if content=='html' else 'application/json',body='<h1>Failure</h1>' if content=='html' else json.dumps({'ok':False,'message':'Synthetic API rejection'})) if route.request.method=='PUT' else route.continue_())
   page.locator('[data-guided-evidence]').check();page.wait_for_function('code=>JSON.parse(localStorage.getItem("training_engine_guided_outbox_v1")||"[]").some(x=>x.last_error?.code===code)',arg=code);assert page.evaluate('navigator.onLine');assert 'Reconnect' not in page.locator('[data-guided-status]').inner_text();expect(page.locator('[data-guided-nav=next]')).to_be_disabled();faults.append({'status':status,'body':content,'code':code,'result':'PASS'});generic=page.evaluate('''async url=>{try{await (await import('/core.js')).api(url,{method:'PUT',json:{}});return null}catch(error){return {status:error.status,code:error.code}}}''',f'/api/student/runtime/{cid}') if status!=200 else None
   if generic:assert generic=={'status':status,'code':code},generic
   page.unroute('**/api/student/runtime/*');page.wait_for_timeout(300)
   # Review and retry the real pending item; it must disappear only on confirmation.
   page.get_by_role('button',name='Review saved guided changes').wait_for(timeout=10000);page.get_by_role('button',name='Review saved guided changes').click();page.locator('[data-guided-retry]').click();clear_queue(page);page.keyboard.press('Escape');page.reload();expect(page.locator('[data-guided-evidence]')).to_be_checked();page.locator('[data-guided-evidence]').uncheck();page.wait_for_timeout(300);clear_queue(page)
  ctx.close()
  # Refresh while disconnected: the server page cannot load offline, but its durable
  # changes survive and replay on the next authenticated online page load.
  cid,ctx,page=start(0,'Offline refresh and lost acknowledgement')
  storage_page=ctx.new_page();storage_page.goto(base+'/api/health');ctx.set_offline(True);page.locator('[data-guided-evidence]').check();page.wait_for_function('()=>JSON.parse(localStorage.getItem("training_engine_guided_outbox_v1")||"[]").length>0')
  try:page.reload(timeout=5000,wait_until='domcontentloaded')
  except Exception:pass
  assert queue(storage_page),'The pending origin-scoped outbox must survive the failed fresh page load'
  ctx.set_offline(False);page.goto(base+f'/student/class?class_id={cid}');clear_queue(page);expect(page.locator('[data-guided-evidence]')).to_be_checked();expect(page.locator('[data-guided-nav=next]')).to_be_enabled();faults.append({'offline_refresh_reconnect':'PASS'});page.reload();expect(page.locator('[data-guided-evidence]')).to_be_checked()
  # Drop a real response after the server commits. The exact mutation replays once.
  dropped=[]
  def lose_reply(route):
   if route.request.method!='PUT' or dropped:return route.continue_()
   reply=route.fetch();assert reply.ok;dropped.append({'request':route.request.post_data_json,'reply':reply.json()});route.abort('failed')
  page.route('**/api/student/runtime/*',lose_reply);page.locator('[data-guided-evidence]').uncheck();page.wait_for_timeout(500);page.wait_for_function('()=>JSON.parse(localStorage.getItem("training_engine_guided_outbox_v1")||"[]").some(x=>x.last_error?.code==="REQUEST_FAILED")');assert page.evaluate('navigator.onLine');assert 'Reconnect' not in page.locator('[data-guided-status]').inner_text();committed=runtime(cid)['revision'];page.unroute('**/api/student/runtime/*');clear_queue(page);assert runtime(cid)['revision']==committed;page.reload();expect(page.locator('[data-guided-evidence]')).not_to_be_checked();faults.append({'lost_reply_after_commit':'PASS'});traces.extend(dropped)
  # Two tabs with live events unavailable retain a stale revision, and must conflict.
  stale=ctx.new_page();stale.route('**/api/events**',lambda route:route.abort());stale.goto(base+f'/student/class?class_id={cid}');expect(stale.locator('[data-guided-evidence]')).not_to_be_checked()
  page.locator('[data-guided-evidence]').check();expect(page.locator('[data-guided-nav=next]')).to_be_enabled();newer=runtime(cid)['revision'];stale.locator('[data-guided-evidence]').check();stale.wait_for_function('()=>JSON.parse(localStorage.getItem("training_engine_guided_outbox_v1")||"[]").some(x=>x.status==="conflict")');assert runtime(cid)['revision']==newer;faults.append({'same_participant_two_tab_stale_write':'PASS'});ctx.close()
  faults.append({'refresh_before_and_after_path_selection':'PASS'})
  cid,ctx,page=start(1,'Refresh during unacknowledged request');held=[];held_routes=[]
  def hold_confirmation(route):
   if route.request.method!='PUT' or held:return route.continue_()
   reply=route.fetch();assert reply.ok;held.append(reply.json());held_routes.append(route)
   # Leave this intercepted request unresolved; reloading destroys the old document.
  page.route('**/api/student/runtime/*',hold_confirmation);page.locator('[data-guided-evidence]').check();page.wait_for_function('()=>JSON.parse(localStorage.getItem("training_engine_guided_outbox_v1")||"[]").some(x=>x.attempted&&x.status==="replaying")');page.wait_for_timeout(300);assert held;committed=runtime(cid)['revision'];page.reload();clear_queue(page);expect(page.locator('[data-guided-evidence]')).to_be_checked();expect(page.locator('[data-guided-nav=next]')).to_be_enabled();assert runtime(cid)['revision']==committed;faults.append({'refresh_while_save_pending_after_commit':'PASS'});
  for held_route in held_routes:
   try:held_route.abort('failed')
   except Exception:pass
  ctx.close()
  cid,ctx,page=start(0,'Two-tab offline conflict');peer=ctx.new_page();peer.goto(base+f'/student/class?class_id={cid}');peer.locator('[data-prompt-editor]').wait_for();ctx.set_offline(True)
  page.locator('[data-prompt-editor]').fill('Offline document A');page.locator('[data-prompt-editor]').blur();page.wait_for_function('()=>JSON.parse(localStorage.getItem("training_engine_guided_outbox_v1")||"[]").length===1')
  peer.locator('[data-prompt-editor]').fill('Offline document B');peer.locator('[data-prompt-editor]').blur();peer.wait_for_function('()=>JSON.parse(localStorage.getItem("training_engine_guided_outbox_v1")||"[]").length===2');assert len({r['origin_instance']for r in queue(page)})==2
  ctx.set_offline(False);page.wait_for_function('()=>JSON.parse(localStorage.getItem("training_engine_guided_outbox_v1")||"[]").some(x=>x.status==="conflict")',timeout=30000)
  assert runtime(cid)['progress']['steps']['a-prepare']['prompts']['prompt']=='Offline document A';assert any(r['payload']['step_data']['prompts']['prompt']=='Offline document B'for r in queue(peer));faults.append({'different_tab_offline_chain_never_rebased':'PASS'});ctx.close()
  if os.environ.get('ONE_GUIDED_RECOVERY_ONLY')=='1':OUT=OUT/'recovery';OUT.mkdir(exist_ok=True)
  (OUT/'matrix.json').write_text(json.dumps(matrix,indent=2));(OUT/'faults.json').write_text(json.dumps(faults,indent=2));(OUT/'trace.json').write_text(json.dumps(traces,indent=2));browser.close();api.dispose()
 (OUT/'result.json').write_text(json.dumps({'status':'PASS','matrix_rows':len(matrix),'fault_cases':len(faults)},indent=2));print('GUIDED_PERSISTENCE_BROWSER_PASS',len(matrix),'both-path mode checks;',len(faults),'online failure cases')
finally:
 server.terminate()
 try:server.wait(timeout=5)
 except subprocess.TimeoutExpired:server.kill();server.wait()
 log.close()
