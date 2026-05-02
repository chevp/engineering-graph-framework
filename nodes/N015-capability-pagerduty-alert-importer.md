---
id: N015
type: capability
state: production
title: "pagerduty-alert-importer"
created: 2026-03-12
version: 1
gates_passed: [G1, G2]
edges: []
---

## Aussage
Importer-Capability: liest aus der PagerDuty-API getriggerte Incidents und
schreibt sie als `observation`-Knoten in den Graph. Setzt automatisch
`contradicts`-Kanten gegen `spec`-Knoten, deren SLO-Label dem Alert entspricht.

## Schnittstelle
- Input: PagerDuty-Service-ID, Zeitfenster, optional Service→Spec-Mapping.
- Output: ein `observation`-Knoten pro Incident, `produced_by: N015`,
  ggf. `contradicts`-Kanten gegen passende `spec`-Knoten.

## Notizen
Knoten landen zunächst in `inbox/` und müssen einen G1-Schritt
passieren (Mensch oder Agent prüft Relevanz), bevor sie nach `nodes/` migriert
werden. Verhindert, dass jeder Alarm die `nodes/`-Hauptzone flutet.

Importer ist keine Sonderform — strukturell identisch zu N011/N012,
erzeugt nur Knoten aus externen Signalen statt aus aktiven Messungen.
