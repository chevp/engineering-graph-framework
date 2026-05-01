---
projection_id: P-2026-05-02-search-p99
projected_at: 2026-05-02
goal_node: N005
query: "alle Knoten, die durch eine Kette aus depends_on/refines/evidence_for/contradicts mit N005 verbunden sind, ohne invalidated"
---

# Projektion: SLO /search p99 < 300ms (N005)

Diese Datei ist **regenerierbar** — sie ist Resultat einer Graph-Traversal, kein Plan-Original.
Bei Änderung am Subgraph einfach neu projizieren, nicht editieren.

## Subgraph (relevant für das Ziel)

```
N005 (spec, production)
  ↑ contradicts ─────────────── N010 (observation, production) ──produced_by──→ A005
  ↑ contradicts                       │ related_to
N001 (observation, production) ───────┘ ──produced_by──→ A002
  ↑ related_to
N009 (hypothesis, exploration) ──supersedes──→ N002 (superseded)
  ↑ depends_on               └── depends_on ──→ N008 (assumption, exploration)
  ↑ evidence_for
N004 (measurement, production) ──produced_by──→ A001
  ↑ depends_on / refines
N003 (decision, context) ──related_to──→ N006 (risk, context)
```

Ausgeklammert: N007 (invalidated, kein Pfad zum Ziel).

Drei Schreibquellen sichtbar: Mensch-erzeugt (N002, N003, N005, N006, N007, N008, N009),
Agent-erzeugt (N001 ← A002, N004 ← A001), Importer-erzeugt (N010 ← A005).

## Topologisch sortierte Ausführungssicht

| # | Knoten | Zustand | Nächster Gate-Schritt | Werkzeug |
|---|--------|---------|------------------------|----------|
| 1 | N008   | exploration  | Aggregation aus `pg_stat_statements` → G2 | manuell / SQL |
| 2 | N006   | context      | Bulk-Import-Replay auf Staging mit Index → G1 | A001 + A002 |
| 3 | N003   | context      | Migration `0042_*.sql` schreiben → G1 | A003 |
| 4 | N003   | exploration  | Staging-Replay zeigt p99 < 300ms → G2 | A002 |
| 5 | N009   | exploration  | wird durch N004 + N003-G2 zu G2 | — |
| 6 | N001   | production   | nach N003-G2 erneut messen, ggf. neu projizieren | A002 |

## Was als nächstes zu tun ist

Position 1 in der Tabelle ist die einzige offene Aktion ohne Vorbedingung im Subgraph:
**Tenant-Verteilung aus `pg_stat_statements` aggregieren**, um N008 nach `production` zu bringen.

Alles weiter rechts hängt von dieser Annahme ab.
