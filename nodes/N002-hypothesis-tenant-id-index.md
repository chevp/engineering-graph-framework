---
id: N002
type: hypothesis
state: superseded
title: "Fehlender Index auf documents.tenant_id"
created: 2026-04-28
version: 1
gates_passed: [G1]
edges:
  - to: N001
    type: related_to
    note: "Versuch, N001 zu erklären"
---

## Aussage
Die Latenz aus N001 wird durch fehlenden B-Tree-Index auf `documents.tenant_id` verursacht.

## Erfolgskriterium
EXPLAIN ANALYZE zeigt Index-Scan statt Seq-Scan; p99 fällt unter 500ms.

## Evidenz / Kontext
- `\d documents` zeigt nur PK-Index.
- Hot-Tenant-Queries laufen über tenant_id + Sortierung nach created_at.

## Notizen
Durch N009 verfeinert: ein einspaltiger Index löst das Sortier-Problem nicht.
Knoten bleibt sichtbar, weil die Lehre (single-column reicht nicht) Wert behält.
