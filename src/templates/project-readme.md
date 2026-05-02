# Engineering-Graph

Wissens-Substrat dieses Projekts: Knoten und Kanten als Markdown-Files,
verwaltet mit [`egf`](https://github.com/chevp/engineering-graph-framework).

## Idee in einem Satz

Engineering ist nicht eine Sequenz von Tasks, sondern ein wachsender,
verlinkter Wissensgraph. Pläne sind Projektionen dieses Graphen. Lifecycle
wandert vom Task auf den Knoten.

## Struktur

```
decisions/      # type: decision
specs/          # type: spec
observations/   # type: observation
hypotheses/     # type: hypothesis    (lazy — entsteht beim ersten Knoten)
assumptions/    # type: assumption    (lazy)
measurements/   # type: measurement   (lazy)
risks/          # type: risk          (lazy)
capabilities/   # type: capability    (lazy)
inbox/          # Stage für Importer-Knoten vor G1
projections/    # materialisierte Graph-Sichten (regenerierbar)
```

Pro Knotentyp ein Verzeichnis. **ID-Raum bleibt global** (`N001`-fortlaufend
über alle Type-Dirs hinweg) — Edges referenzieren nur die ID, der Pfad ist
egal. `type=capability`-Knoten bilden den Werkzeug-Katalog
(`egf list capabilities`). Alle Knoten teilen denselben Lifecycle und
dieselben Gates.

## Kurzreferenz

```bash
egf node new decision "Java/Spring für Server"
egf node new spec "StateStore-Interface trennt SQLite von Postgres"
egf node new hypothesis "tenant_id index closes p99 gap"
egf list nodes              # alles aggregiert
egf list decisions          # nur ein Type-Dir
egf list capabilities
egf project
egf project <node-id>
egf validate
```

## Doku zum Framework

Schema, CLI-Referenz und ADRs zum EGF selbst leben im Framework-Repo —
nicht in diesem Verzeichnis:

- [Knoten-Schema](https://github.com/chevp/engineering-graph-framework/blob/main/docs/schema.md)
- [CLI-Referenz](https://github.com/chevp/engineering-graph-framework/blob/main/docs/cli.md)
- [Framework-ADRs](https://github.com/chevp/engineering-graph-framework/tree/main/docs/adr)