---
id: N004
type: measurement
state: production
title: "EXPLAIN ANALYZE: Seq Scan auf documents bei /search-Query"
created: 2026-04-29
version: 1
gates_passed: [G1, G2]
edges:
  - to: N009
    type: evidence_for
  - to: N002
    type: evidence_for
    note: "stützt auch die alte Hypothese; Form irrelevant"
  - to: N011
    type: produced_by
---

## Aussage
Die /search-Query führt einen `Seq Scan on documents (cost=0.00..184321.42)` aus,
mit Filter auf `tenant_id` und Sort auf `created_at DESC`.

## Evidenz / Kontext
- Query: `SELECT ... FROM documents WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 50`.
- Plan: Seq Scan + Sort, ~340k rows scanned pro Request.
- Plan vom 2026-04-29 12:14 UTC, Staging-Replikat mit Prod-Snapshot.

## Notizen
Direkte Messung, keine Interpretation. Stützt jede Indexhypothese,
unabhängig von der konkreten Spaltenwahl.
