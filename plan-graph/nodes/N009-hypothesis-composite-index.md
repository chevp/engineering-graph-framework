---
id: N009
type: hypothesis
state: exploration
title: "Composite-Index (tenant_id, created_at DESC) löst N001"
created: 2026-04-30
version: 1
gates_passed: [G1]
edges:
  - to: N002
    type: supersedes
    note: "single-column war zu eng"
  - to: N001
    type: related_to
  - to: N008
    type: depends_on
---

## Aussage
Ein composite-Index `(tenant_id, created_at DESC)` eliminiert sowohl Seq-Scan
als auch Sort-Step und bringt p99 unter den SLO aus N005.

## Erfolgskriterium
- EXPLAIN zeigt Index-Only-Scan ohne Sort-Node.
- Staging-Replay reproduziert N001-Last bei p99 < 300ms.

## Evidenz / Kontext
- Stützt sich auf N004 (Seq-Scan-Messung).
- DESC-Reihenfolge des Index passt zu Sort-Reihenfolge der Query.

## Notizen
G2 noch offen: braucht Staging-Messung mit Index aktiv.
N003 ist die ausführbare Form dieser Hypothese.
