# Bug Reporting & Test Management — Learning Roadmap

Finding a bug is half the job. The other half is **communicating** it so it gets fixed, and giving the
organization a clear picture of quality so it can decide whether to release.

```
16-Bug-Reporting-and-Test-Management/
├── tools/
│   ├── defect-metrics.mjs   ✅ RUNNABLE: turns a defect list into a release report
│   └── sample-defects.json  14 sample defects to analyze
├── 01-Effective-Bug-Reports/
├── 02-Defect-Lifecycle-and-Triage/
├── 03-Test-Management-Tools/
├── 04-Communicating-Quality/
├── 05-Templates/            test summary report · RCA · triage agenda · release readiness
└── 06-Exercises/
```

## Try the tool
```powershell
cd tools
node defect-metrics.mjs
```
```
🚨 Release blockers (open Critical/Major): 2
Defect Detection Percentage (DDP): 85.7%   ⚠️ too many escapes
Reopened at least once: 14.3%              ⚠️ fixes not verified before "done"
Defect clustering: checkout ██████ 6 (42.9%)
❌ NO-GO: 2 open Critical/Major defect(s) must be fixed or formally accepted.
```

## Checklist
- [ ] `01-Effective-Bug-Reports/lesson.md`: anatomy, RIMGEA, severity vs priority, common mistakes
- [ ] `02-Defect-Lifecycle-and-Triage/lesson.md`: workflow, triage, duplicates, root cause analysis
- [ ] `03-Test-Management-Tools/lesson.md`: Jira, Xray/Zephyr/TestRail, traceability, CI integration
- [ ] `04-Communicating-Quality/lesson.md`: metrics, reports, go/no-go, talking to stakeholders
- [ ] `05-Templates/` — use them for real
- [ ] `06-Exercises/exercises.md`
