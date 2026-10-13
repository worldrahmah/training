# Training Engine ONE — User Guide

## 1. Start the Engine

Use Node.js 22.5 or newer. From the source folder run `npm start`. The terminal prints the local Trainer/Projector/Participant links and the preferred LAN address. Keep the host machine on the same local network as classroom devices.

## 2. Super Admin

Open `/admin`. Use this surface for users, courses, classes, platform operations, permissions, audit/history, global search and system-level administration. Do not use it as the live teaching screen.

## 3. Trainer preparation

Open `/trainer`. Prepare courses/classes, enroll participants, assign trainers/assistants, schedule sessions, configure teams, review submissions, manage class evaluations/quizzes/certificates, inspect reports and run readiness checks.

## 4. Dedicated Live Classroom

Open a class and choose the Live action. `/live?class_id=...` is intentionally class-bound. It is the Trainer’s delivery console only. Use Course Flow, presenter notes, participant status, Help Queue, timers, Projector pairing/modes, response controls and class progression here. Broad administration is excluded on purpose.

## 5. Participant

Participants open `/student`, sign in or join an eligible class with its short code. Their learning page shows live activities, personal practice, upcoming sessions, reviewed work, evaluations/quizzes, transcript and certificates.

## 6. Projector

Pair a Projector from the Live Classroom. The Projector is display-only and scoped to the paired class. Special screens include Welcome, Focus, Break, Countdown, Celebration and Blackout. Return to Course restores normal presentation content.

## 7. Course Builder

Open `/builder` from an editable course version. Work in a draft. Use autosave/Undo/Redo, revision history, assets, workflow validation and simulation. Published versions are immutable; create a new draft for changes.

### Private presenter notes

Course activities may contain trainer-only guidance such as cue/explanation, talking points, expected answer, common mistakes and transition notes. ONE displays these in the private Live Classroom. They are not rendered on the Projector or participant surface.

## 8. Backups

Administrators can create and verify local backups. Before restore, ONE makes a safety backup when configured. Encrypted Export produces a `.tebackup` bundle protected by a passphrase of at least 10 characters; keep that passphrase outside the backup file. Imported encrypted backups are verified before they become restorable.

## 9. Certificates and transcripts

A trainer/admin may issue a certificate for an enrolled participant. The Participant can open the printable certificate and use browser Print → Save PDF. Verification codes are public-verifiable without exposing the rest of the participant record. Participant transcripts can be downloaded as CSV.

## 10. Course improvement

Use course Version Impact to compare delivered versions. ONE reports completion, help and class-time deltas and generates data-backed improvement findings. Use these as evidence for the next immutable course version, not as automatic changes to the course.
