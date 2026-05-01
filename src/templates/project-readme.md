# Engineering-Graph Project

Erzeugt mit [`egf`](https://github.com/chevp/engineering-graph-framework).

## Idee in einem Satz

Engineering ist nicht eine Sequenz von Tasks, sondern ein wachsender, verlinkter
Wissensgraph. Pläne sind Projektionen dieses Graphen. Lifecycle wandert vom
Task auf den Knoten.

## Struktur

```
plan-graph/
  nodes/         # Wissens-Substrat (hypothesis, decision, observation, ...)
  inbox/         # Stage für Importer-Knoten vor G1
agent-graph/
  capabilities/  # Werkzeug-Katalog (Lasttest, Analyzer, Importer, ...)
projections/     # materialisierte Plan-Sichten (regenerierbar)
docs/
  schema.md      # Format der Markdown-Knoten
  cli.md         # CLI-Referenz
  adr/           # Architecture Decision Records
```

## Kurzreferenz

```bash
egf node new hypothesis "tenant_id index closes p99 gap"
egf capability new "k6 load tester"
egf list nodes
egf project
```

Volle CLI-Doku in [`docs/cli.md`](docs/cli.md), Knoten-Format in
[`docs/schema.md`](docs/schema.md), Hintergrund in
[`docs/adr/`](docs/adr/).
