# Engineering-Graph Project

Erzeugt mit [`egf`](https://github.com/chevp/engineering-graph-framework).

## Idee in einem Satz

Engineering ist nicht eine Sequenz von Tasks, sondern ein wachsender, verlinkter
Wissensgraph. Pläne sind Projektionen dieses Graphen. Lifecycle wandert vom
Task auf den Knoten.

## Struktur

```
nodes/         # alle Knoten (hypothesis, decision, observation, capability, …)
inbox/         # Stage für Importer-Knoten vor G1
projections/   # materialisierte Graph-Sichten (regenerierbar)
docs/
  schema.md    # Format der Markdown-Knoten
  cli.md       # CLI-Referenz
  adr/         # Architecture Decision Records
```

`type=capability`-Knoten bilden den Werkzeug-Katalog (`egf list capabilities`).
Alle Knoten teilen denselben Lifecycle, dieselben Gates und denselben
ID-Raum — siehe [`docs/adr/0003-ein-graph.md`](docs/adr/0003-ein-graph.md).

## Kurzreferenz

```bash
egf node new hypothesis "tenant_id index closes p99 gap"
egf node new capability "k6 load tester"
egf list nodes
egf list capabilities
egf project
egf project <node-id>
egf validate
```

Volle CLI-Doku in [`docs/cli.md`](docs/cli.md), Knoten-Format in
[`docs/schema.md`](docs/schema.md), Hintergrund in
[`docs/adr/`](docs/adr/).
