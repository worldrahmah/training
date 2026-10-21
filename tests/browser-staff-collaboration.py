"""Staff collaboration, genuine peer media, own notes and scalable selection UI."""
import os,json,pathlib,socket,subprocess,tempfile,time,shutil,sqlite3
from playwright.sync_api import sync_playwright,expect
ROOT=pathlib.Path(__file__).resolve().parents[1];TMP=pathlib.Path(tempfile.mkdtemp(prefix='one-collab-browser-'));OUT=pathlib.Path(os.environ.get('ONE_COLLAB_EVIDENCE_DIR',str(ROOT/'.test-evidence/staff-collaboration')));OUT.mkdir(parents=True,exist_ok=True)
with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
base=f'http://127.0.0.1:{port}';env={**os.environ,'HOST':'127.0.0.1','PORT':str(port),'TRAINING_ENGINE_TEST_ACCOUNTS':'1',**{f'TRAINING_ENGINE_{k}_DIR':str(TMP/k.lower())for k in ['DATA','STORAGE','BACKUP','EXPORT']}};log=open(TMP/'server.log','w');server=subprocess.Popen(['node','app/server.mjs'],cwd=ROOT,env=env,stdout=log,stderr=log);
class Checks(list):
 def append(self,v):super().append(v);print('PASS',v,flush=True)
checks=Checks();turn=None;turnlog=None
turnbin=os.environ.get('ONE_TURN_SERVER_BIN')or shutil.which('turnserver')
if turnbin:
 with socket.socket() as sock:sock.bind(('127.0.0.1',0));turnport=sock.getsockname()[1]
 turnlog=open(TMP/'turn.log','w');turn=subprocess.Popen([turnbin,'-n','--no-cli','--no-tls','--no-dtls','--lt-cred-mech','--realm=training-engine-qa','--user=qa-browser:qa-only-not-production','--listening-ip=127.0.0.1','--relay-ip=127.0.0.1','--allow-loopback-peers','--no-multicast-peers','--min-port=45000','--max-port=45100','--listening-port='+str(turnport),'--pidfile='+str(TMP/'turn.pid'),'--userdb='+str(TMP/'turn.sqlite'),'--log-file=stdout'],stdout=turnlog,stderr=turnlog)
try:
 with sync_playwright() as p:
  api=p.request.new_context(base_url=base)
  for _ in range(180):
   try:
    if api.get('/api/health',timeout=1000).ok:break
   except Exception:pass
   time.sleep(.1)
  def req(path,token=None,data=None,method=None):
   r=api.fetch(path,method=method or ('POST' if data is not None else 'GET'),headers={'X-Session-Token':token,'X-File-Name':'course.json'}if token else {},**({'data':data}if data is not None else {}));assert r.ok,(path,r.status,r.text());return r.json()
  admin=req('/api/login',data={'username':'TRAINER','password':'TRAIN1234'});at=admin['token'];req('/api/staff',at,{'username':'CHATSTAFF','password':'ChatBrowser123!','display_name':'Operations colleague','staff_role':'trainer'});staff=req('/api/login',data={'username':'CHATSTAFF','password':'ChatBrowser123!'});tt=staff['token'];student=req('/api/login',data={'username':'DEMO01','password':'D1001'});st=student['token']
  if turnbin:
   req('/api/staff-tools/settings',at,{'ice_servers':[{'urls':f'turn:127.0.0.1:{turnport}?transport=tcp','username':'qa-browser','credential':'qa-only-not-production'}]},'PATCH')
  cid=req('/api/staff-tools/conversations',at,{'member_ids':[staff['user']['id']]})['id']
  course={'format':'training-engine-course','schema_version':'2.0','course':{'id':'collab-browser','version':'1.0','title':'Class notes','language':'en','direction':'ltr','modules':[{'id':'m1','title':'Learning','activities':[{'id':'welcome','type':'presentation','title':'Welcome','content':{'blocks':[{'type':'hero','title':'Welcome'}]}}],'missions':[],'paths':[]}]}}
  imp=req('/api/courses/import',at,course);cl=req('/api/classes',at,{'title':'Notes classroom','course_version_id':imp['version_id'],'participant_ids':[student['user']['id']],'trainers':[{'user_id':admin['user']['id'],'assignment_role':'lead'}]});req(f'/api/classes/{cl["id"]}/activate',at,{})
  browser=p.chromium.launch(executable_path=os.environ.get('ONE_BROWSER_EXECUTABLE')or shutil.which('chromium'),headless=True,args=['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']);errors=[]
  def context(token,width=1440,timezone='UTC'):
   c=browser.new_context(timezone_id=timezone,viewport={'width':width,'height':1000},permissions=['camera','microphone'],reduced_motion='reduce');c.add_init_script('window.__qaPeers=[];const NativePeer=window.RTCPeerConnection;window.RTCPeerConnection=class extends NativePeer{constructor(...args){super(...args);window.__qaPeers.push(this)}};');c.add_init_script('sessionStorage.setItem("training_engine_session",'+json.dumps(token)+');sessionStorage.setItem("training_engine_session_rotated_at",String(Date.now()));localStorage.setItem("training_engine_locale","en");');return c
  def page(c,path):
   pg=c.new_page();pg.on('pageerror',lambda e:errors.append(str(e)));pg.goto(base+path);return pg
  ac=context(at);tc=context(tt);ap=page(ac,'/staff#chat');tp=page(tc,'/staff#chat')
  for pg in [ap,tp]:pg.locator(f'[data-conversation="{cid}"]').click();pg.locator('.chat-composer').wait_for()
  ap.locator('[name=body]').fill('Safe <img src=x onerror=alert(1)> message');ap.locator('.chat-composer [type=submit]').click();expect(tp.locator('.chat-text')).to_contain_text('Safe <img',timeout=15000);assert tp.locator('.chat-bubble img').count()==0;checks.append('staff text delivered incrementally and escaped')
  ap.locator('[data-chat-file]').set_input_files({'name':'meeting.txt','mimeType':'text/plain','buffer':b'Attachment evidence'});tp.get_by_role('button',name='Download file',exact=False).wait_for(timeout=15000)
  with tp.expect_download() as dl:tp.get_by_role('button',name='Download file',exact=False).click()
  assert pathlib.Path(dl.value.path()).read_bytes()==b'Attachment evidence';checks.append('authenticated file uploaded and downloaded by peer')
  ap.locator('[data-record-voice]').click();expect(ap.locator('[data-record-voice]')).to_have_text('Stop and send voice note');ap.wait_for_timeout(1250);ap.locator('[data-record-voice]').click();tp.get_by_role('button',name='Play voice note',exact=False).wait_for(timeout=15000);tp.get_by_role('button',name='Play voice note',exact=False).click();tp.locator('audio[controls]').wait_for();checks.append('real MediaRecorder voice note saved and playable')
  for kind in ['audio','video']:
   ap.locator(f'[data-start-call="{kind}"]').click();tp.locator('[data-accept-call]').wait_for(timeout=20000);tp.locator('[data-accept-call]').click();
   try:expect(ap.locator('[data-call-status]')).to_have_text('Connected',timeout=35000)
   except Exception:
    print('CALL_DEBUG',kind,'errors',errors,flush=True)
    for pg in [ap,tp]:print(pg.evaluate('window.__qaPeers.map(p=>({connection:p.connectionState,ice:p.iceConnectionState,gather:p.iceGatheringState,signal:p.signalingState,local:!!p.localDescription,remote:!!p.remoteDescription,localCandidates:(p.localDescription?.sdp.match(/a=candidate/g)||[]).length,remoteCandidates:(p.remoteDescription?.sdp.match(/a=candidate/g)||[]).length,senders:p.getSenders().map(s=>s.track?.kind),transceivers:p.getTransceivers().map(t=>({dir:t.direction,current:t.currentDirection}))}))'),flush=True)
    raise
   expect(tp.locator('[data-call-status]')).to_have_text('Connected',timeout=35000)
   assert ap.locator('[data-local-video]').evaluate('(v)=>v.srcObject.getAudioTracks()[0].readyState')=='live'
   if kind=='video':assert tp.locator('[data-remote-video]').evaluate('(v)=>v.srcObject.getVideoTracks()[0].readyState')=='live'
   ap.locator('[data-mute-call]').click();expect(ap.locator('[data-mute-call]')).to_have_text('Unmute microphone');ap.locator('[data-end-call]').click();expect(tp.locator('[data-call-host]')).to_be_empty(timeout=12000);checks.append('actual '+kind+' peer connection, live tracks, mute and hangup')
  ap.locator('[data-tab=tasks]').click();ap.locator('[data-new-task]').click();dialog=ap.get_by_role('dialog');dialog.locator('[name=title]').fill('Prepare classroom');dialog.locator('[name=due_at]').fill('2026-10-21T13:00');dialog.locator('[data-checklist-text]').fill('Check projector');dialog.locator('[data-checklist-add]').click();dialog.locator('[data-directory-search]').fill('Operations colleague');dialog.locator('[data-directory-id="'+str(staff['user']['id'])+'"]').check();dialog.locator('[data-confirm]').click();expect(ap.locator('[data-task-id]')).to_have_text('Prepare classroom');tp.locator('[data-tab=tasks]').click();tp.locator('[data-task-id]').click();dialog=tp.get_by_role('dialog');dialog.locator('[data-check-index]').check();dialog.locator('[name=status]').select_option('done');dialog.locator('[data-confirm]').click();expect(tp.locator('.task-card .badge').first).to_have_text('Done');checks.append('administrator assigns task, assignee completes checklist and status')
  ap.locator('[data-tab=calendar]').click();ap.locator('[data-calendar-date]').fill('2026-10-21');ap.locator('[data-calendar-date]').blur();ap.locator('[data-calendar-day="2026-10-21"]').wait_for();expect(ap.locator('[data-calendar-day="2026-10-21"] strong')).to_have_text('1');ap.locator('[data-calendar-day="2026-10-21"]').click();expect(ap.locator('[data-calendar-period]')).to_have_value('day');req('/api/staff-tools/tasks',at,{'title':'Late-night local planning','due_at':'2026-10-20T21:30:00Z'});beirut=context(at,390,'Asia/Beirut');bp=page(beirut,'/staff#calendar');bp.locator('[data-calendar-date]').fill('2026-10-21');bp.locator('[data-calendar-date]').blur();expect(bp.locator('[data-calendar-day="2026-10-21"] strong')).to_have_text('2');bp.locator('[data-calendar-day="2026-10-21"]').click();expect(bp.locator('[data-task-list]')).to_contain_text('Late-night local planning');beirut.close();checks.append('calendar complete local-day counts, Beirut midnight and day drilldown')
  sp=page(context(st,390),f'/student/class?class_id={cl["id"]}');sp.locator('[data-class-notes]').click();sp.get_by_role('dialog').locator('[data-new-note]').click();dialog=sp.get_by_role('dialog').last;dialog.locator('[name=title]').fill('My learning note');dialog.locator('[name=body]').fill('Evidence from this class');dialog.locator('[data-confirm]').click();expect(sp.locator('[data-notes-list]')).to_contain_text('My learning note')
  with sp.expect_download()as dl:sp.locator('[data-export-notes]').click()
  assert b'Evidence from this class'in pathlib.Path(dl.value.path()).read_bytes();checks.append('participant class note saved and exported on mobile')
  sp.get_by_role('dialog').locator('[data-close]').first.click();sp.screenshot(path=str(OUT/'participant-class-notes.png'),full_page=True)
  # A thousand accounts remain a bounded table with persistent selection across pages.
  db=sqlite3.connect(TMP/'data/training-engine.sqlite');h=db.execute("SELECT password_hash FROM users WHERE username='DEMO01'").fetchone()[0]
  db.executemany("INSERT INTO users(username,password_hash,role,display_name,active) VALUES(?,?,'student',?,1)",[(f'PICK{i:04}',h,f'Picker participant {i:04}')for i in range(1000)]);db.commit()
  template=db.execute('SELECT content_json,source_manifest_json,checksum FROM course_versions LIMIT 1').fetchone();scaled_version=None
  for i in range(100):
   course_id=db.execute('INSERT INTO courses(slug,title,language,direction) VALUES(?,?,?,?)',(f'picker-course-{i:03}',f'Picker course {i:03}','en','ltr')).lastrowid
   version=db.execute("INSERT INTO course_versions(course_id,version,status,content_json,source_manifest_json,checksum) VALUES(?,'1.0','published',?,?,?)",(course_id,*template)).lastrowid
   if i==99:scaled_version=version
  db.commit();db.close()
  gp=page(ac,'/admin');gp.locator('[data-nav=workspace-groups]').first.click();gp.locator('[data-new-group]').click();dialog=gp.get_by_role('dialog');dialog.locator('[name=group-name]').fill('Large selection');picker=dialog.locator('.scalable-picker').first;expect(picker.locator('tbody tr')).to_have_count(25);picker.locator('tbody input').first.check();picker.locator('[data-picker-next]').click();picker.locator('tbody input').first.check();expect(picker.locator('[data-picker-count]')).to_contain_text('2 selected');picker.locator('[data-picker-selected]').check();expect(picker.locator('tbody tr')).to_have_count(2);dialog.locator('[data-confirm]').click();checks.append('1000 account picker bounded to 25 rows, cross-page selections retained')
  gp.locator('[data-nav=classes]').first.click();gp.locator('[data-action=add-class]').click();dialog=gp.get_by_role('dialog').last;version_picker=dialog.locator('select[name=version] + div .scalable-picker');version_picker.locator('[data-picker-query]').fill('Picker course 099');expect(version_picker.locator('tbody tr')).to_have_count(1);version_picker.locator('tbody input').check();expect(dialog.locator('[name=version]')).to_have_value(str(scaled_version));dialog.locator('[name=title]').fill('Scaled course selection');dialog.locator('[data-confirm]').click();expect(dialog).not_to_be_visible();gp.get_by_role('dialog').last.locator('[data-close]').first.click();checks.append('100 course searchable version table selects and creates actual class')

  for route in ['/admin','/trainer']:
   hp=page(ac,route);hp.locator('[data-dashboard-history] [data-history-size]').wait_for();hp.locator('[data-dashboard-history] [data-history-size]').select_option('25');hp.locator('[data-activity-detail]').first.click();expect(hp.get_by_role('dialog')).to_contain_text('Activity details');hp.get_by_role('dialog').locator('[data-close]').first.click();hp.locator('[data-audit-class]').first.click();hp.get_by_role('dialog').wait_for();hp.get_by_role('dialog').locator('[data-close]').first.click();checks.append(route+' overview uses full history filters, detail dialog and working Open class')
  hero=page(ac,'/admin');hero.locator('.admin-hero').wait_for();old_background=hero.locator('.admin-hero').evaluate('(e)=>getComputedStyle(e).backgroundImage')
  req('/api/account/preferences',at,{'language':'ar','theme':'dark','accent':'rose'},'PATCH');hero.reload();hero.locator('.admin-hero').wait_for();expect(hero.locator('html')).to_have_attribute('data-panel-color','rose');assert hero.locator('.admin-hero').evaluate('(e)=>getComputedStyle(e).backgroundImage')!=old_background;checks.append('live operations hero follows personal color and theme');ap.reload();ap.locator('[data-tab=calendar]').click();expect(ap.locator('html')).to_have_attribute('dir','rtl');ap.screenshot(path=str(OUT/'staff-calendar-ar-dark.png'),full_page=True)
  for width in [390,768,1440]:
   ap.set_viewport_size({'width':width,'height':960});assert ap.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),width
  checks.append('Arabic RTL dark personal color and 390/768/1440 responsive staff calendar')
  assert not errors,errors
  (OUT/'RESULT.json').write_text(json.dumps({'ok':True,'journeys':checks,'page_errors':errors},indent=2));print('BROWSER_STAFF_COLLABORATION_PASS',len(checks),'journeys, including real fake-device audio/video peer streams');browser.close()
finally:
 server.terminate()
 try:server.wait(timeout=6)
 except subprocess.TimeoutExpired:server.kill();server.wait()
 if turn:
  turn.terminate()
  try:turn.wait(timeout=5)
  except subprocess.TimeoutExpired:turn.kill();turn.wait()
  turnlog.close()
 log.close();shutil.rmtree(TMP,ignore_errors=True)
