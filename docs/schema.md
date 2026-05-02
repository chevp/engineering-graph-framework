# Schema

Nodes and edges as Markdown files with YAML frontmatter.
One file per node. Edges are declared in the frontmatter of the source node.

## Node frontmatter

```yaml
---
id: N001                    # unique, stable, sequential (N\d+)
type: observation           # observation | hypothesis | assumption | decision | spec | measurement | risk | capability
state: production           # context | exploration | production | superseded | invalidated
title: "Short title"
created: 2026-04-28         # ISO date
version: 1                  # incremented on a gate transition that creates a new version
gates_passed: [G1, G2]      # audit trail
edges:
  - to: N005                # node ID — all nodes share the same ID space
    type: contradicts       # depends_on | refines | supersedes | contradicts | related_to | produced_by | evidence_for | evidence_against
    note: "optional"
---
```

## Node body (convention)

```markdown
## Statement
What is claimed / observed / required. One sentence.

## Success criterion
For hypothesis, decision, spec, capability only. Phrased measurably.

## Evidence / context
References to measurements, tickets, code locations. Free form.

## Notes
What happened on gate transitions. Brief.
```

## Lifecycle rules

- Gate transition → new node version (new node, or incremented `version`).
- `Superseded` and `Invalidated` are visible, not deleted.
- `produced_by` points at a `capability` node — no special handling, just an edge like any other.

## Directories

One folder per node `type` (plural). The `type` frontmatter field is the
source of truth; the folder mirrors it.

- `decisions/`, `specs/`, `observations/`, `hypotheses/`, `assumptions/`,
  `measurements/`, `risks/`, `capabilities/` — knowledge substrate, split
  by type. Type-folders are created lazily by `egf node new <type>`.
- `inbox/` — unverified importer signals before G1
- `projections/` — materialized graph views (query results, regenerable)

The **ID space is global** (`N001`-sequential across all type-folders).
Edges reference nodes by ID — the folder is irrelevant for graph topology.

The legacy single `nodes/` folder is still readable by `egf` for backwards
compatibility, but new repos should use the per-type layout.

## Storage

Markdown files are the canonical form. SQLite is an optional generated
index that speeds up traversals. See [ADR-0001](adr/0001-markdown-als-source-of-truth.md).

## Write sources

Three sources, one path (all of them write Markdown):

| Source     | Recognizable by         | Typical node types                                  |
|------------|-------------------------|-----------------------------------------------------|
| Human      | no `produced_by` edge   | hypothesis, assumption, decision, spec, risk        |
| Capability | `produced_by: Nxxx`     | observation, measurement, evidence_for/against      |
| Importer   | `produced_by: Nxxx`     | observation (from alerts, issues, CI, monitoring)   |

Importers are regular `capability` nodes — no special interface.
See [ADR-0002](adr/0002-schreibquellen.md) and [ADR-0003](adr/0003-ein-graph.md).
