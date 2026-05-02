# `egf` — CLI-Referenz

Engineering-Graph Framework Command Line Interface.

## Installation

```bash
# global (empfohlen)
npm install -g @chevp/egf

# oder lokal aus dem Repo
git clone https://github.com/chevp/engineering-graph-framework
cd engineering-graph-framework
npm install -g .
```

Prüfen:

```bash
egf --version
egf --help
```

## Befehle im Überblick

| Befehl                                  | Wirkung                                                     |
|-----------------------------------------|-------------------------------------------------------------|
| `egf init`                              | Default-Ordnerstruktur in CWD anlegen                       |
| `egf node new <type> "<title>"`         | Knoten anlegen (`N001`, `N002`, …)                          |
| `egf list [nodes\|capabilities\|inbox]` | Übersicht als Tabelle                                       |
| `egf project`                           | Statistik des Graphen (Counts pro State / Type)             |
| `egf project <node-id>`                 | Subgraph-Projektion ab `<node-id>`, topologisch sortiert    |
| `egf validate`                          | Frontmatter und Edge-Targets gegen Schema prüfen            |
| `egf --help`                            | Hilfe                                                       |
| `egf --version`                         | Version                                                     |

Alle Befehle außer `init` suchen den Repo-Root, indem sie aufwärts nach
`nodes/` schauen — du kannst sie also aus jedem Unterordner aufrufen.

---

## `egf init`

Legt in `pwd` die Default-Struktur an:

```
nodes/
inbox/
projections/
docs/adr/
README.md
.gitignore
docs/schema.md
docs/cli.md
docs/adr/README.md
docs/adr/0001-markdown-als-source-of-truth.md
docs/adr/0002-schreibquellen.md
docs/adr/0003-ein-graph.md
```

Existierende Dateien werden **nicht** überschrieben (`skip` in der Ausgabe).
Mit `--force` werden Templates über bestehende Dateien geschrieben.

```bash
mkdir my-graph && cd my-graph
egf init
```

---

## `egf node new <type> "<title>"`

Legt einen neuen Knoten an. ID wird auto-vergeben (`N001`, `N002`, …),
Dateiname ist `N<NNN>-<type>-<slug>.md` unter `nodes/`.

**Typen:**

| Typ           | Initialer State | Bedeutung                                                  |
|---------------|-----------------|------------------------------------------------------------|
| `observation` | `production`    | Faktum (Log, Metrik, Beobachtung) — direkt nutzbar         |
| `measurement` | `production`    | Messergebnis — direkt nutzbar                              |
| `hypothesis`  | `context`       | testbare Aussage — braucht G1 (Erfolgskriterium)           |
| `assumption`  | `context`       | unhinterfragte Annahme                                     |
| `decision`    | `context`       | Entscheidung — sollte mit Evidenz nach Production wandern  |
| `spec`        | `context`       | Spezifikation, Akzeptanzkriterium                          |
| `risk`        | `context`       | erkanntes Risiko                                           |
| `capability`  | `context`       | Werkzeug / Agent / Importer — braucht G1+G2 vor Production |

```bash
egf node new hypothesis "tenant_id index closes p99 gap"
egf node new observation "search p99 = 4.2s seit deploy am 2026-04-25"
egf node new decision "switch to composite index (tenant_id, created_at)"
egf node new capability "k6 load tester"
```

Frontmatter und Body sind als TODO-Skeleton vorbefüllt — danach im Editor
weiterarbeiten und Kanten in `edges:` deklarieren (siehe
[`schema.md`](schema.md)).

---

## `egf list [nodes|capabilities|inbox]`

Druckt eine Tabelle. Default ist `nodes`.

`egf list capabilities` filtert auf `type=capability`. Aliase: `caps`.
`egf list inbox` zeigt Knoten in `inbox/` (Importer-Signale vor G1).

---

## `egf project`

**Ohne Argument** — Eine-Bildschirm-Übersicht über den Graphen
(Counts pro State / Type, Subset Capabilities).

**Mit Knoten-ID** — Subgraph-Projektion ab dem angegebenen Knoten,
topologisch sortiert (Voraussetzungen zuerst). Zugkanten sind
`depends_on`, `refines`, `evidence_for`, `supersedes` — schwache Kanten
(`related_to`, `contradicts`) werden ignoriert, um Zyklen zu vermeiden.

```bash
egf project N003
```

---

## `egf validate`

Prüft alle Knoten in `nodes/` und `inbox/` gegen das Schema. Errors brechen
mit Exit 1 ab. Warnungen (z. B. `state=production` ohne G2) werden gezeigt,
schlagen aber nicht fehl.

Geprüft wird: Pflichtfelder, Enum-Werte, ID-Format, `gates_passed` aufsteigend,
Edge-Targets existieren, State/Gates-Konsistenz (Warnung).

---

## Typischer Flow

```bash
mkdir search-perf-graph && cd $_
egf init

egf node new observation "search p99 = 4.2s nach deploy 2026-04-25"
egf node new hypothesis "fehlender index auf tenant_id ist die ursache"
$EDITOR nodes/N002-*.md      # Erfolgskriterium + edges → N001 ausfüllen
egf node new capability "postgres explain analyzer"

egf list nodes
egf project
egf project N002             # Voraussetzungen für N002 als linearer Plan
egf validate
```

Knoten-Format und Lifecycle: [`schema.md`](schema.md).
Hintergrund-Entscheidungen: [`adr/`](adr/).
