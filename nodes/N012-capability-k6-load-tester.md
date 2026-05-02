---
id: N012
type: capability
state: production
title: "k6-load-tester"
created: 2025-11-03
version: 3
gates_passed: [G1, G2]
edges: []
---

## Aussage
Fähigkeit, ein k6-Skript gegen einen Endpoint auszuführen und Latenz-Perzentile
als `observation`-Knoten in den Graph zu schreiben.

## Schnittstelle
- Input: Skript-Pfad, Ziel-URL, VU-Profil, Dauer.
- Output: `observation`-Knoten mit p50/p95/p99-Werten und `produced_by: N012`.

## Notizen
Version 3: liefert deterministische Reproduzierbarkeitsmetrik (Streuung über N Läufe),
damit G2-Übergang automatisch beurteilbar wird.
