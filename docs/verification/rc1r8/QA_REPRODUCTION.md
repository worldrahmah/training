# RC1R8 QA reproduction

Application runtime: Node 22.5+ (verified Node 24.19.0). Runtime requires no npm install; fonts and PDF dependencies are bundled and checksummed. Preserve real data and use the tests' disposable directories.

Run npm test (54 commands / 53 test programs plus canonical contract synchronization). Set ONE_PDF_EVIDENCE_DIR to an external directory to retain seven EN/AR report samples and twenty paired-font samples. Run npm run test:browser with Python Playwright 1.62.0 and Chromium. Four suites cover role repair, all existing workspace views, actual new workflows and 640 global font/layout cases across eight surfaces. Use ONE_BROWSER_EVIDENCE_DIR, ONE_WORKSPACE_EVIDENCE_DIR, ONE_WORKSPACE_UPGRADE_EVIDENCE_DIR and ONE_FONT_EVIDENCE_DIR for separate external evidence directories; ONE_BROWSER_EXECUTABLE selects a custom Chromium.

Independently verify generated PDFs with:
python tests/pdf-render-acceptance.py --pdf-dir /path/to/generated-pdfs --output /path/to/result.json --render-dir /path/to/rendered-pages
This QA check uses PyMuPDF 1.26.6, PDFium through pypdfium2 and Poppler pdfinfo, not classroom runtime services. It checks reader parsing, real logo presence, text bounds and actual raster rendering. Final acceptance also includes manual inspection of representative rendered PDFs/screens.

Static checks: node --check on every app/tool/test JavaScript module; ESLint 9.39.1 with globals 16.5.0 and no-undef on application/tool modules. Third-party bundled source is checked by provenance/root checksums and pinned dependency audit rather than pretending it was exhaustively hand-reviewed.

Seal a clean committed source with python tools/seal-release.py --output /new/candidate/directory. Never overwrite an existing candidate. Verify and freshly extract exact bytes with python tools/verify-release.py --archive /candidate.zip --extract /new/extraction --output /integrity.json --expected-version 3.5.0-rc.1.8. Run the full Node, four browser suites and PDF reader checks from that extraction again. Rehash the immutable ZIP and inspect source-file changes; only the existing four certification outputs may refresh their generated timestamps. Repair, rerun and reseal when a gate fails. Companion attestation holds the final ZIP SHA and exact-byte outcomes; the archive cannot contain its own final hash.
