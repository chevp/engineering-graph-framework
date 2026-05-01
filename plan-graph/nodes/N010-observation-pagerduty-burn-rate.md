---
id: N010
type: observation
state: production
title: "PagerDuty: SLO burn-rate alert /search (2026-04-25 03:14 UTC)"
created: 2026-04-25
version: 1
gates_passed: [G1, G2]
edges:
  - to: N005
    type: contradicts
    note: "Alert-Bedingung des SLO direkt verletzt"
  - to: N001
    type: related_to
    note: "drei Tage später durch k6-Lauf quantitativ bestätigt"
  - to: agent:A005
    type: produced_by
---

## Aussage
PagerDuty-Incident `PD-INC-77a4`: Burn-Rate-Alert für `/search`-SLO ausgelöst,
2026-04-25 03:14 UTC, ack durch oncall, auto-resolved nach 22 min.

## Evidenz / Kontext
- Quelle: PagerDuty-Service `search-api`, Policy `slo-burn-fast`.
- Trigger-Bedingung: 14.4× Budget-Burn über 5 min.
- Importer-Lauf: 2026-04-25 03:15 UTC, A005 v1.
- Inbox-Migration nach `nodes/`: 2026-04-25 09:40 durch oncall (G1-Schritt).

## Notizen
Erstes Signal des Latenz-Problems — drei Tage vor dem gezielten k6-Lauf (N001).
Zeigt den Wert von Importer-Knoten: Probleme tauchen im Graph auf,
bevor jemand bewusst danach sucht.
