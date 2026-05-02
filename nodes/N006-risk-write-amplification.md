---
id: N006
type: risk
state: context
title: "Schreib-Amplifikation durch composite index bei Bulk-Ingest"
created: 2026-05-01
version: 1
gates_passed: []
edges:
  - to: N003
    type: related_to
---

## Aussage
Ein zusätzlicher Index auf `documents (tenant_id, created_at)` erhöht die
Schreibkosten bei nächtlichen Bulk-Imports messbar.

## Erfolgskriterium
Bulk-Import-Latenz steigt um < 15%; sonst ist das Risiko aktiv und blockiert N003.

## Evidenz / Kontext
- Bulk-Import läuft heute in 12 min (Mittel über 30 Tage).
- Tabellen-Größe: ~340M Rows, Wachstum +1.2M/Tag.
- Noch keine Messung mit Index — Annahme aus Erfahrung mit `events`-Tabelle.

## Notizen
G1 nicht bestanden, weil "Erfahrungswissen" keine testbare Aussage ist.
Vor Übergang nach `exploration`: Replay auf Staging mit Index aktiv.
