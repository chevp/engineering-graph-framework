# `egf` — CLI reference

Engineering-Graph Framework command line interface.

## Installation

```bash
# global (recommended)
npm install -g @chevp/egf

# or locally from the repo
git clone https://github.com/chevp/engineering-graph-framework
cd engineering-graph-framework
npm install -g .
```

Verify:

```bash
egf --version
egf --help
```

## Commands at a glance

| Command                                          | Effect                                                      |
|---------------------------------------------------|-------------------------------------------------------------|
| `egf init`                                        | Create the default folder structure in CWD                  |
| `egf node new <type> "<title>"`                   | Create a node (`N001`, `N002`, …) under `<type>s/`          |
| `egf list [nodes\|<type-plural>\|inbox]`          | Tabular overview — `nodes` aggregates all                   |
| `egf project`                                     | Graph statistics (counts per state / type)                  |
| `egf project <node-id>`                           | Subgraph projection from `<node-id>`, topologically sorted  |
| `egf validate`                                    | Check frontmatter and edge targets against the schema       |
| `egf --help`                                      | Help                                                        |
| `egf --version`                                   | Version                                                     |

All commands except `init` find the repo root by walking upward looking for
any of the type directories (`decisions/`, `specs/`, …), `inbox/`, or the
legacy `nodes/` — so you can call them from any subdirectory.

---

## `egf init`

Creates the minimal scaffold in `pwd`:

```
inbox/
projections/
README.md
.gitignore
inbox/README.md
projections/README.md
```

Type-folders (`decisions/`, `specs/`, `observations/`, `hypotheses/`, …)
are **not** pre-created. They appear lazily the first time you run
`egf node new <type> ...` for that type. This keeps the tree empty
until you actually use it.

Existing files are **not** overwritten (`skip` in the output).
Use `--force` to write templates over existing files.

```bash
mkdir my-graph && cd my-graph
egf init
```

---

## `egf node new <type> "<title>"`

Creates a new node. The ID is auto-assigned globally (`N001`, `N002`, …
across all type-folders); the file name is `N<NNN>-<type>-<slug>.md` under
the type-folder for `<type>` (e.g. `decisions/`, `specs/`). The folder is
created on demand.

**Types:**

| Type          | Initial state | Meaning                                                         |
|---------------|---------------|-----------------------------------------------------------------|
| `observation` | `production`  | Fact (log, metric, observation) — directly usable               |
| `measurement` | `production`  | Measurement result — directly usable                            |
| `hypothesis`  | `context`     | Testable claim — needs G1 (success criterion)                   |
| `assumption`  | `context`     | Unquestioned premise                                            |
| `decision`    | `context`     | Decision — should move to Production with evidence              |
| `spec`        | `context`     | Specification, acceptance criterion                             |
| `risk`        | `context`     | Identified risk                                                 |
| `capability`  | `context`     | Tool / agent / importer — needs G1+G2 before Production         |

```bash
egf node new hypothesis "tenant_id index closes p99 gap"
egf node new observation "search p99 = 4.2s since deploy on 2026-04-25"
egf node new decision "switch to composite index (tenant_id, created_at)"
egf node new capability "k6 load tester"
```

The frontmatter and body are pre-populated as a TODO skeleton — continue
in your editor and declare edges in `edges:` (see
[`schema.md`](schema.md)).

---

## `egf list [nodes|<type-plural>|inbox]`

Prints a table. Default is `nodes` (aggregates across **all** type-folders
plus the legacy `nodes/`).

```
$ egf list nodes
ID    TYPE         STATE        TITLE
----  -----------  -----------  -------------------------------------------
N001  observation  production   /search p99 = 1.8s in prod
N002  hypothesis   superseded   Missing index on documents.tenant_id
...
N011  capability   production   postgres-explain-analyzer
```

Per-type filtering: `egf list <type-plural>` reads only that folder.

```
egf list decisions
egf list specs
egf list observations
egf list capabilities       # alias: egf list caps
```

`egf list inbox` shows nodes in `inbox/` (importer signals before G1).

---

## `egf project`

**Without an argument** — single-screen overview of the graph:

```
$ egf project
egf project — /Users/me/my-graph

nodes:         15
  by state:    context: 2  exploration: 3  invalidated: 1  production: 8  superseded: 1
  by type:     assumption: 1  capability: 5  decision: 1  hypothesis: 3  measurement: 1  observation: 2  risk: 1  spec: 1
inbox:         0
capabilities:  5  (subset of nodes where type=capability)
```

**With a node ID** — subgraph projection from the given node,
topologically sorted (prerequisites first). The traversal follows
`depends_on`, `refines`, `evidence_for`, `supersedes` — weak edges
(`related_to`, `contradicts`) are ignored to avoid cycles.

```bash
egf project N003
```

---

## `egf validate`

Checks all nodes across the type-folders, the legacy `nodes/`, and `inbox/`
against the schema. Errors cause the command to exit with code 1.
Warnings (e.g. `state=production` without G2 in `gates_passed`) are
displayed but do not fail the command.

```
$ egf validate
egf validate — 15 files

WARN  hypotheses/N002-hypothesis-tenant-id-index.md
  (warn) state=superseded but G2 missing from gates_passed
  (warn) state=superseded but G3 missing from gates_passed

summary: 15 files — 14 ok, 1 warning, 0 errors
```

Checks performed:

- Required frontmatter fields (`id`, `type`, `state`, `title`, `created`,
  `version`, `gates_passed`, `edges`).
- Values against enums (`type`, `state`, `gates_passed`, `edges[].type`).
- ID format (`/^N\d+$/`) and match with the file name.
- `gates_passed` ascending.
- Edge targets exist as nodes in the graph.
- Consistency between `state` and `gates_passed` (as a warning).

---

## Typical flow

```bash
mkdir search-perf-graph && cd $_
egf init

# first observation
egf node new observation "search p99 = 4.2s after deploy 2026-04-25"

# formulate a hypothesis
egf node new hypothesis "missing index on tenant_id is the cause"
$EDITOR hypotheses/N002-*.md      # fill in success criterion + edges → N001

# register a tool
egf node new capability "postgres explain analyzer"

# check the state
egf list nodes               # aggregated across type-folders
egf list decisions           # only decisions/
egf project
egf project N002             # prerequisites for N002 as a linear plan
egf validate
```

Node format and lifecycle: [`schema.md`](schema.md).
Background decisions: [`adr/`](adr/).
