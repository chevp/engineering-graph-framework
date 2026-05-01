---
id: A001
type: capability
state: production
title: "postgres-explain-analyzer"
created: 2026-01-15
version: 2
gates_passed: [G1, G2]
edges: []
---

## Aussage
Fähigkeit, gegen eine PostgreSQL-Verbindung `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`
auszuführen und das Ergebnis als strukturierten Plan-Knoten (`type: measurement`)
in den Plan-Graph zu schreiben.

## Schnittstelle
- Input: Connection-String, SQL-Query, optionaler Plan-Knoten-Kontext.
- Output: neuer `measurement`-Knoten mit `produced_by: agent:A001`.

## Notizen
Version 2: produziert jetzt auch `evidence_for`-Kanten gegen offene Hypothesen,
deren Erfolgskriterium ein Index-Scan-Plan voraussetzt.
