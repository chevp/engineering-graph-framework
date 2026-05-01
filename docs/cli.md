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

| Befehl                                 | Wirkung                                                  |
|----------------------------------------|----------------------------------------------------------|
| `egf init`                             | Default-Ordnerstruktur in CWD anlegen                    |
| `egf node new <type> "<title>"`        | Plan-Graph-Knoten anlegen (`N001`, `N002`, …)            |
| `egf capability new "<title>"`         | Agent-Graph-Capability anlegen (`A001`, `A002`, …)       |
| `egf list [nodes\|capabilities\|inbox]` | Übersicht als Tabelle                                    |
| `egf project`                          | Statistik des Graphen (Counts pro State / Type)          |
| `egf --help`                           | Hilfe                                                    |
| `egf --version`                        | Version                                                  |

Alle Befehle außer `init` suchen den Repo-Root, indem sie aufwärts nach
`plan-graph/` + `agent-graph/` schauen — du kannst sie also aus jedem
Unterordner aufrufen.

---

## `egf init`

Legt in `pwd` die Default-Struktur an:

```
plan-graph/nodes/
plan-graph/inbox/
agent-graph/capabilities/
projections/
docs/adr/
README.md
.gitignore
docs/schema.md
docs/cli.md
docs/adr/README.md
docs/adr/0001-markdown-als-source-of-truth.md
docs/adr/0002-schreibquellen.md
```

Existierende Dateien werden **nicht** überschrieben (`skip` in der Ausgabe).
Mit `--force` werden Templates über bestehende Dateien geschrieben.

```bash
mkdir my-graph && cd my-graph
egf init
```

---

## `egf node new <type> "<title>"`

Legt einen neuen Plan-Graph-Knoten an. ID wird auto-vergeben (`N001`, `N002`, …),
Dateiname ist `N<NNN>-<type>-<slug>.md` unter `plan-graph/nodes/`.

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

```bash
egf node new hypothesis "tenant_id index closes p99 gap"
egf node new observation "search p99 = 4.2s seit deploy am 2026-04-25"
egf node new decision "switch to composite index (tenant_id, created_at)"
```

Frontmatter und Body sind als TODO-Skeleton vorbefüllt — danach im Editor
weiterarbeiten und Kanten in `edges:` deklarieren (siehe
[`schema.md`](schema.md)).

---

## `egf capability new "<title>"`

Legt einen Agent-Graph-Knoten an. ID-Schema `A001`, `A002`, … unter
`agent-graph/capabilities/`.

```bash
egf capability new "k6 load tester"
egf capability new "postgres explain analyzer"
```

Capabilities sind niederfrequent — versioniere sie wie eine Package-Registry.

---

## `egf list [nodes|capabilities|inbox]`

Druckt eine Tabelle. Default ist `nodes`.

```
$ egf list nodes
ID    TYPE         STATE        TITLE
----  -----------  -----------  -------------------------------------------
N001  observation  production   search p99 = 4.2s seit deploy am 2026-04-25
N002  hypothesis   exploration  tenant_id index closes p99 gap
...
```

Aliase: `caps` für `capabilities`.

---

## `egf project`

Eine-Bildschirm-Übersicht über den Graphen:

```
$ egf project
egf project — /Users/me/my-graph

plan-graph/nodes:        10
  by state:   exploration: 3  invalidated: 1  production: 5  superseded: 1
  by type:   assumption: 1  decision: 1  hypothesis: 3  measurement: 1  observation: 2  risk: 1  spec: 1
plan-graph/inbox:        0
agent-graph/capabilities: 5
```

---

## Typischer Flow

```bash
mkdir search-perf-graph && cd $_
egf init

# erste Beobachtung
egf node new observation "search p99 = 4.2s nach deploy 2026-04-25"

# Hypothese formulieren
egf node new hypothesis "fehlender index auf tenant_id ist die ursache"
$EDITOR plan-graph/nodes/N002-*.md      # Erfolgskriterium + edges → N001 ausfüllen

# Werkzeug registrieren
egf capability new "postgres explain analyzer"

# Stand prüfen
egf list nodes
egf project
```

Knoten-Format und Lifecycle: [`schema.md`](schema.md).
Hintergrund-Entscheidungen: [`adr/`](adr/).
