---
id: N008
type: assumption
state: exploration
title: "Tenant-Query-Verteilung ist hinreichend gleichmässig"
created: 2026-04-30
version: 1
gates_passed: [G1]
edges:
  - to: N009
    type: related_to
    note: "wenn falsch, ist composite-Index möglicherweise nicht ausreichend"
---

## Aussage
Die Query-Last verteilt sich so über Tenants, dass ein composite-Index
auf `(tenant_id, created_at)` für > 90% der Tenants effektiv ist
(d.h. kein einzelner Tenant macht > 50% der Last).

## Erfolgskriterium
Aggregation der letzten 7 Tage `pg_stat_statements`: kein Tenant über 50% Anteil.

## Evidenz / Kontext
Noch zu messen. Annahme stützt sich auf Sales-Daten (top-Kunde ~22% MRR-Anteil).

## Notizen
Bewusst als eigener Knoten geführt, weil mehrere Hypothesen darauf bauen.
Wenn invalidiert, müssen N009 und N003 neu geprüft werden.
