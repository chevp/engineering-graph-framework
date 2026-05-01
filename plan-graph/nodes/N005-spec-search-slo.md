---
id: N005
type: spec
state: production
title: "/search SLO: p99 < 300ms"
created: 2026-02-10
version: 1
gates_passed: [G1, G2]
edges: []
---

## Aussage
Der Endpoint `/search` muss eine p99-Latenz unter 300ms halten,
gemittelt über rollierende 7 Tage, gemessen am Edge.

## Erfolgskriterium
- Burn-Rate-Alert bei p99 > 300ms für > 5% der 7-Tages-Buckets.
- Fehlerbudget: 0.5% Verletzungsrate pro Quartal.

## Evidenz / Kontext
Spec aus dem SLO-Review Q1/2026 (Dokument outside-graph).
Stabil seit drei Monaten, mehrfach referenziert.

## Notizen
Wird durch N001 aktuell verletzt — die `contradicts`-Kante steht auf N001-Seite.
