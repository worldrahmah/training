# RC1R9 owner acceptance checklist / قائمة قبول صاحب النظام

Status: OWNER_ACCEPTANCE_CANDIDATE_NOT_FINAL. Automated gates are documented in docs/verification/rc1r9 and the companion immutable seal report. This checklist records remaining real operator/classroom acceptance; unchecked items are not claimed passed.

## Package and continuity

- Compare the downloaded application ZIP with its exact external SHA-256. Freshly extract to a new folder; verify internal manifest and no runtime/private data. Review the companion fresh-extraction report and known limits.
- On the owner's Windows machine, run the supported launcher with Node >=22.5. Confirm stop/restart targets the intended instance and preserves configured DATA/STORAGE/BACKUP/EXPORT paths.
- Create/verify a complete RC1R8 backup, upgrade a copy of populated owner state, confirm existing users/hashes, published versions, class enrollment, responses, reports, assets and backups. Rehearse documented rollback on a copy; approve the effect of reverting to an older backup.
- Fresh production: initial password is random/private, changing it is required, no demo participants/courses exist. Legacy unchanged defaults are locally gated; replace them through supported controls and verify real-user access. Never enable QA fixtures on production.

## Identity, language and design

- Replace the logo using authorized Settings; check sign-in, Admin, Trainer, Student, Course Editor, Builder, Profile, Preview, Live, Certificate, physical Projector and new professional PDF. Remove/re-add the mark and restore a backup containing it. Previously reviewed reports retain original branding by design.
- Confirm no sign-in shows demo credentials. Test EN/AR, light/dark/system, actual owner fonts/logo, phone/tablet/desktop and 16:9 Projector; inspect Arabic punctuation/mixed-direction text, contrast, tables/charts, scrolling, touch controls, keyboard focus and dialog/menu dismissal.
- Check all 36 activity names and settings headings in both UI languages. IDs/authored English/Arabic course text must not change with interface language.

## Roles, teaching and evidence

- Use separate Admin, managing/assigned Trainer, unassigned Trainer, isolated Course Editor and two Participant accounts. Confirm denied operations have no partial write and private information is not disclosed.
- Request admission with a registered account and class code; verify Pending, authorized approval/decline, capacity conflict, roster removal/re-add and retained progress. Guest admission stays denied.
- Import each supplied sample, inspect validated assets, create a Draft, validate/simulate/publish, create a class and rehearse the appropriate complete workflow. An editable Draft has independent asset bytes; published original stays intact.
- Teach representative scored/unscored/moderated/file/image/video/team/personal-path activities. Check correct/incorrect responses, close/reveal/explain, no pre-reveal answer/score leakage, private Trainer cues, actual paired Projector, completion/convergence, restart/reconnect and reporting evidence.
- Read the role guide in your language and perform the documented core tasks. Run guided Course Creator intake and author/accept only one milestone before the next. Review generated material independently; record CORE CAPABILITY GAP items.
- Review seven professional report templates, EN/AR multi-page PDF, actual logo/font, chart/table/zero/no-data meanings, scoped downloads and backup restore. Verify required assistive technology with real users.

## Owner decision

Record operator/device/browser/OS/network, exact package hash, accepted requirements, reproducible defects, workaround/data/security impact, retest evidence and owner/date/sign-off. Keep status candidate until the required real browser/classroom/Windows/physical Projector visual checks are accepted. No automated suite alone grants FINAL status.

تحقق من البصمة والحزمة والترقية وبيانات المؤسسة على نسخة آمنة، ثم اختبر الشعار والكلمات الأولية والأدوار والخصوصية والانضمام والأنشطة والمسارات والتقارير وإعادة الاتصال بالعربية والإنجليزية وعلى الأجهزة الفعلية. اقبل محطة تأليف واحدة قبل التالية. سجّل الأجهزة والنتائج والعيوب والبصمة وقرار صاحب النظام؛ لا تمنح الحالة النهائية بمجرد النجاح الآلي.
