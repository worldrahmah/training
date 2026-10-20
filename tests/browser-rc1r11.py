"""Guided renderer parity, branch isolation, saved evidence, clipboard and responsive browser gates."""
import json, os, pathlib, socket, subprocess, tempfile, time, shutil
from playwright.sync_api import sync_playwright, expect
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('ONE_BROWSER_EVIDENCE_DIR',str(ROOT/'.test-evidence/rc1r11')));OUT.mkdir(parents=True,exist_ok=True)
TMP=pathlib.Path(tempfile.mkdtemp(prefix='rc11-browser-'))
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
   ctx=browser.new_context(viewport={'width':width,'height':900});ctx.add_init_script('const v='+json.dumps({'token':token,'locale':locale})+';sessionStorage.setItem("training_engine_session",v.token);sessionStorage.setItem("training_engine_session_rotated_at",String(Date.now()));localStorage.setItem("training_engine_locale",v.locale);Object.defineProperty(navigator,"clipboard",{value:{writeText:async text=>{window.copiedText=text}}});');return ctx
  for locale,branch,width in [('en',0,1440),('en',1,390),('ar',0,390),('ar',1,768)]:
   fixture=json.loads(subprocess.check_output(['node','--input-type=module','-e',f'import {{guidedExample}} from "./tools/guided-examples.mjs";console.log(JSON.stringify(guidedExample("{locale}")))'],cwd=ROOT));fixture['course']['id']+=f'-{branch}-{width}'
   imp=req('/api/courses/import',at,fixture);cid=req('/api/classes',at,{'title':'Guided browser','course_version_id':imp['version_id'],'participant_ids':[sid]})['id'];req(f'/api/classes/{cid}/activate',at,{});req(f'/api/live/{cid}/practice',at,{'module_id':'m1-guided','workflow_node_id':'practice'})
   ctx=context(token,locale,width);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(base+f'/student?class_id={cid}');page.locator('[data-guided-path]').first.wait_for();assert page.locator('.student-class-focus').count()==1;assert page.locator('details.student-disclosure').count()==4;assert page.locator('details.student-disclosure[open]').count()==0;page.locator('details.student-disclosure summary').first.focus();page.keyboard.press('Enter');expect(page.locator('details.student-disclosure').first).to_have_attribute('open','');page.reload();page.locator('[data-guided-path]').first.wait_for();assert page.locator('[data-guided-path]').count()==2
   selected=fixture['course']['modules'][0]['paths'][branch];page.locator('[data-guided-path]').nth(branch).click();page.locator('[data-guided-step]').wait_for();expect(page.locator('[data-guided-step]')).to_have_attribute('data-guided-step',selected['steps'][0]['id']);assert page.locator('[data-guided-path]').count()==0
   expect(page.locator('[data-guided-nav="next"]')).to_be_disabled();page.locator('[data-content-copy]').first.click();expect(page.locator('[data-copy-status]').first).to_have_text('تم النسخ ✓' if locale=='ar' else 'Copied ✓');assert page.evaluate('window.copiedText')==page.locator('.prompt-preview code').first.inner_text()
   page.locator('[data-guided-evidence]').check();expect(page.locator('[data-guided-nav="next"]')).to_be_enabled();page.locator('[data-guided-nav="next"]').click();expect(page.locator('[data-guided-step]')).to_have_attribute('data-guided-step',selected['steps'][1]['id']);page.locator('[data-prompt-editor]').fill('My edited prompt / الأمر المعدل');
   with page.expect_response(lambda r:'/api/student/runtime/' in r.url and r.request.method=='PUT') as saved:page.locator('[data-prompt-editor]').blur()
   assert saved.value.ok,saved.value.text()
   page.reload();expect(page.locator('[data-prompt-editor]')).to_have_value('My edited prompt / الأمر المعدل');page.locator('[data-content-copy]').click();assert page.evaluate('window.copiedText')=='My edited prompt / الأمر المعدل';page.locator('[data-prompt-reset]').click();expect(page.locator('[data-prompt-editor]')).not_to_have_value('My edited prompt / الأمر المعدل')
   for index in range(1,9):
    expect(page.locator('[data-guided-step]')).to_have_attribute('data-guided-step',selected['steps'][index]['id'])
    if index==2:
     page.wait_for_function('()=>{const el=document.querySelector(".prompt-preview");return el&&el.scrollHeight>el.clientHeight&&el.clientHeight>0}')
    if index!=5:page.locator('[data-guided-evidence]').check()
    page.locator('[data-guided-nav="next"]').click()
   expect(page.locator('[data-guided-step]')).to_have_attribute('data-guided-step',selected['steps'][9]['id']);assert page.locator('[data-guided-interaction]').count()==10;expect(page.locator('[data-guided-nav="finish"]')).to_be_disabled()
   for form in page.locator('[data-guided-interaction]').all():
    if form.locator('input[type=number]').count():form.locator('input[type=number]').fill('4')
    elif form.locator('input[type=radio]').count():form.locator('input[type=radio]').first.check()
    else:form.locator('textarea').fill('Useful learning / تعلم مفيد')
    form.locator('button[type=submit]').click();expect(form.locator('[role=status]')).to_have_text('تم حفظ الإجابة' if locale=='ar' else 'Response saved')
   page.reload();expect(page.locator('[data-guided-nav="finish"]')).to_be_enabled();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.screenshot(path=str(OUT/f'guided-{locale}-{branch}-{width}.png'),full_page=True);page.locator('[data-guided-nav="finish"]').click();expect(page.locator('.guided-activity')).to_contain_text('اكتمل المسار' if locale=='ar' else 'Path completed');assert not errors,errors;ctx.close();checks.append({'locale':locale,'branch':branch,'width':width,'status':'PASS'});print('GUIDED_BROWSER_GROUP_PASS',locale,branch,width,flush=True)
   req(f'/api/classes/{cid}/lifecycle',at,{'status':'completed'})
  # The Builder executes the same renderer with isolated temporary state.
  ctx=context(at,'en',1440);page=ctx.new_page();page.goto(base+f'/builder?course_id={imp["course_id"]}');page.locator('[data-tab=preview]').click();page.locator('#previewMode').select_option('participant');page.locator('[data-guided-path]').first.click();page.locator('[data-content-copy]').first.click();assert page.evaluate('window.copiedText');page.locator('[data-guided-evidence]').check();page.locator('[data-guided-nav=next]').click();page.locator('[data-prompt-editor]').fill('Preview only');page.locator('[data-prompt-editor]').blur();page.wait_for_timeout(100);page.locator('#guidedWidth').select_option('phone');expect(page.locator('[data-prompt-editor]')).to_have_value('Preview only');checks.append({'creator_shared_renderer':'PASS'});
  page.locator('[data-tab=tree]').click();page.locator('[data-select=path]').first.click();page.locator('#guidedStepPreset').select_option('prompt_task');page.locator('[data-a=add-path-step]').click();assert page.locator('[data-guided-editor]').count()==11;page.locator('[data-guided-editor]').last.locator('[data-block-body]').fill('Authored prompt from visual editor');page.locator('[data-a=apply-path]').click();page.locator('[data-a=save]').click();page.wait_for_timeout(400);versions=req('/api/courses/'+str(imp['course_id']),at)['versions'];draft=next(v for v in versions if v['status']=='draft');saved=req('/api/course-versions/'+str(draft['id'])+'/draft',at)['content']['course']['modules'][0]['paths'][0];assert len(saved['steps'])==11;assert saved['steps'][-1]['content']['blocks'][0]['prompt']=='Authored prompt from visual editor';assert saved['steps'][0]['id']==fixture['course']['modules'][0]['paths'][0]['steps'][0]['id'];checks.append({'creator_visual_step_save':'PASS'});ctx.close()
  # Discoverable deletion, confirmation, visible archive state and restoration remain separate.
  ctx=context(at,'en',1440);page=ctx.new_page();page.goto(base+'/admin');page.locator('.side [data-nav=reports]').click();page.get_by_role('button',name='Guided learning report',exact=True).click();report=page.get_by_role('dialog');expect(report).to_contain_text('Evaluation');
  with page.expect_download() as exported:report.get_by_role('button',name='Export CSV',exact=True).click()
  assert 'Question' in pathlib.Path(exported.value.path()).read_text(encoding='utf-8-sig');page.keyboard.press('Escape');checks.append({'guided_report_export':'PASS'});page.locator('.side [data-nav=classes]').click();button=page.locator(f'[data-action=delete-class][data-id="{cid}"]');button.click();dialog=page.get_by_role('dialog');expect(dialog).to_contain_text('History and responses will be preserved');dialog.get_by_role('button',name='Delete class',exact=True).click();expect(page.locator(f'[data-action=delete-class][data-id="{cid}"]')).to_have_count(0);checks.append({'delete_class_confirmation':'PASS'});ctx.close();browser.close();api.dispose()
 (OUT/'result.json').write_text(json.dumps({'status':'PASS','checks':checks},indent=2));print('RC1R11_BROWSER_PASS',len(checks),'groups')
finally:
 server.terminate()
 try:server.wait(timeout=5)
 except subprocess.TimeoutExpired:server.kill();server.wait()
 log.close()
