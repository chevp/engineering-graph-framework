---
id: N003
type: decision
state: context
title: "Migration 0042: composite index (tenant_id, created_at DESC)"
created: 2026-05-01
version: 1
gates_passed: []
edges:
  - to: N009
    type: depends_on
    note: "umsetzbare Form von N009"
  - to: N009
    type: refines
  - to: N006
    type: related_to
    note: "Risiko explizit getrackt"
---

## Aussage
Wir legen die Migration `0042_documents_tenant_created_idx.sql` an, die einen
zusammengesetzten Index `(tenant_id, created_at DESC)` auf `documents` erzeugt.

## Erfolgskriterium
- Migration ist idempotent und nutzt `CREATE INDEX CONCURRENTLY`.
- Staging-Replay zeigt p99 < 300ms (siehe N005).
- Schreiblast bleibt im Toleranzband aus N006.

## Evidenz / Kontext
Noch keine Evidenz — Knoten ist im Zustand `context`, sammelt Annahmen.
Vor G1 muss eine messbare Erfolgsdefinition stehen (siehe oben — bereits formuliert,
aber Migration noch nicht geschrieben, daher kein Übergang nach `exploration`).

## Notizen
Sobald Migration existiert und auf Staging läuft → G1 → `exploration`.
