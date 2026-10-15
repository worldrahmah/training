# RC1R10 owner workflow repair candidate / مرشح إصلاحات سير العمل

Continues delivered RC1R9 without resetting data. Status: OWNER_ACCEPTANCE_CANDIDATE_NOT_FINAL. Core schema 3.2 and course schemas 1.0/1.1/2.0 remain unchanged; 36 activities and 68 result-view cases remain required.

1. Menu/workspace avatars fetch the authorized saved photo, update after upload and invalidate across tabs. Initials remain the fallback.
2. Admission explains registered account → code → Pending → authorized Trainer/Admin approval. Existing notifications now have a visible Trainer inbox.
3. Student main class/task renders before optional transcript/tools/inbox calls; profile report mounting no longer blocks profile controls.
4. Trainer desktop/mobile bell offers unread counts, messages and admission navigation. Read receipts require audience authorization.
5. Messages support System (Admin), scoped Trainers/Participants, classes and class roles, groups and teams. Server resolves active recipients, deduplicates overlaps and treats retries idempotently.
6. Teams can be renamed and membership moved atomically, preserving IDs/history. Historical team responses prevent destructive deletion/regeneration. Student profiles show membership.
7. Custom Trainer permission choices cover view/edit/publish/archive, class operations and workspace sections. Restriction markers override assignment defaults; legacy behavior remains until customized. Course Editor isolation remains.
8. Attendance saves explicit per-session statuses/notes, leaves unmarked students unrecorded, validates complete batches and reports real saved counts.
9. Pointer follows mouse/touch continuously without persistent audit floods. Declarative handwriting supports colors, widths, undo, clear ink/all and restart persistence. Projector receives live motion and saved strokes.
10. Analytics begins with default scoped cards/charts and accessible tables. Existing PDF/report/chart tools follow. Export chooses dataset/scope and CSV or reviewed PDF.

See the six current EN/AR role guides for exact steps. Earlier branding/account/security protections and historical release ZIPs are preserved. No owner classroom/Windows/physical stylus acceptance is claimed by automated checks.

يتابع الإصدار RC1R9 دون تصفير البيانات. يعالج الصور والرجوع لمساحة الطالب وإشعارات المدرب والمستلمين المتنوعين وإدارة الفرق والصلاحيات والحضور والكتابة باللمس والتحليلات والتصدير. لا تتغير معرفات الأنشطة أو الإصدارات المنشورة. يبقى مرشح قبول حتى اختبار صاحب النظام الفعلي للصفوف وWindows وشاشة العرض واللمس.
