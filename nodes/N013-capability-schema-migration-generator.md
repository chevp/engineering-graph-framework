---
id: N013
type: capability
state: production
title: "schema-migration-generator"
created: 2026-02-20
version: 1
gates_passed: [G1, G2]
edges:
  - to: N011
    type: depends_on
    note: "nutzt EXPLAIN-Plan zur Folgenabschätzung"
---

## Aussage
Fähigkeit, aus einem `decision`-Knoten mit Indexspezifikation eine
idempotente SQL-Migration zu generieren, inkl. `CREATE INDEX CONCURRENTLY`
und Rollback-Pfad.

## Schnittstelle
- Input: `decision`-Knoten-ID mit Index-Definition im Frontmatter.
- Output: Migration-Datei + neuer `decision`-Knoten (Version+1) mit
  `produced_by: N013`-Kante.

## Notizen
Konsumiert N011 implizit, weil eine Migration ohne Plan-Folgenabschätzung
nicht generiert wird. Verweigert die Generierung bei fehlendem EXPLAIN.
