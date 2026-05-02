---
id: N001
type: observation
state: production
title: "/search p99 = 1.8s in Prod"
created: 2026-04-28
version: 1
gates_passed: [G1, G2]
edges:
  - to: N005
    type: contradicts
    note: "verletzt SLO um Faktor 6"
  - to: N012
    type: produced_by
---

## Aussage
Der Endpoint `/search` hat in Produktion eine p99-Latenz von 1.8s, gemessen über 24h.

## Evidenz / Kontext
- k6-Lauf vom 2026-04-28, 5k VUs, 30 min Sustained.
- Datasource: Prometheus `http_request_duration_seconds{route="/search"}`.
- p50 = 220ms, p95 = 1.1s, p99 = 1.8s.

## Notizen
G2 bestanden, da Messung reproduzierbar (drei Läufe, Streuung < 8%).
Knoten ist stabile Tatsache und darf von Hypothesen referenziert werden.
