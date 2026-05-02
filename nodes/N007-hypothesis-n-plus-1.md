---
id: N007
type: hypothesis
state: invalidated
title: "N+1-Queries in Result-Hydration verursachen Latenz"
created: 2026-04-28
version: 1
gates_passed: [G1]
edges:
  - to: N001
    type: related_to
    note: "war Erklärungsversuch für N001"
  - to: N004
    type: evidence_against
    note: "EXPLAIN zeigt EINE Query, kein N+1"
---

## Aussage
Die Latenz aus N001 entsteht durch eine N+1-Query in der Result-Hydration
(`document.permissions` lazy-loaded pro Treffer).

## Erfolgskriterium
- Trace zeigt > 10 sequenzielle Folge-Queries pro Request.
- Eager-Loading senkt p99 unter 500ms.

## Evidenz / Kontext
- Trace aus OTel (2026-04-29): zeigt eine einzige DB-Query, danach Memcache-Hits.
- Hydration nutzt bereits `select_related`-Äquivalent.
- N004 zeigt: Bottleneck ist die EINE Query selbst, nicht ihre Multiplizität.

## Notizen
Invalidiert nach drei Stunden — eine schnelle, billige Hypothese.
Bleibt im Graph: zukünftige Latenz-Untersuchungen wissen jetzt,
dass die Hydration-Pfad bereits einmal sauber überprüft wurde.
