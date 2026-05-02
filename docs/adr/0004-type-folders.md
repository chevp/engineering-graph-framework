# ADR 0004 — Type-folders for the node store

**Status:** accepted
**Date:** 2026-05-02
**Amends:** [ADR-0003](0003-ein-graph.md) — directory layout only.

## Context

ADR-0003 settled the core question: one graph, one ID space, one
validator path. It also decided on a single `nodes/` directory at the
top level, with `type` as a frontmatter field and "subdirectories as
cosmetics" explicitly rejected.

In practice, mixing all node kinds in one directory has friction at the
human-browsing layer:

- Once a graph has more than ~15 nodes, the directory listing becomes a
  scroll-and-grep exercise to find e.g. "all decisions".
- The most-used non-CLI tooling is `ls` and the IDE file tree —
  neither can filter by frontmatter without an extra index.
- ADR-0003 already noted that the file name redundantly encodes the
  type (`N011-spec-state-store-interface.md`); pulling that one level
  outward (`specs/N011-state-store-interface.md`-style, but keeping the
  type in the file name) is mechanical, not architectural.
- `projections/` exists for materialised views, but a per-type filter is
  not a *projection* — it is just the natural shape of how authors look
  for nodes day-to-day.

The "subdirectories as cosmetics" argument in ADR-0003 was correct on
its merits *given* the alternatives at the time (`nodes/plan/`,
`nodes/agents/` — i.e. re-introducing the plan/agent split through the
back door). It does not apply to a per-`type` split, which encodes
information that is *already in the schema*.

## Decision

**One folder per node `type` (plural form), at the top level of the
project.** The `type` field in the frontmatter remains the source of
truth; the folder is a deterministic function of it:

```
decisions/      # type: decision
specs/          # type: spec
observations/   # type: observation
hypotheses/     # type: hypothesis
assumptions/    # type: assumption
measurements/   # type: measurement
risks/          # type: risk
capabilities/   # type: capability
inbox/          # unchanged
projections/    # unchanged
```

Folders are created lazily by `egf node new <type>` — a fresh `egf init`
project ships with `inbox/` and `projections/` only, so the tree stays
empty until it is actually used.

The **invariants from ADR-0003 are preserved unchanged:**

- One global ID space (`N\d+`, sequential across all type-folders).
- One validator path, one edge resolver.
- Edges reference nodes by ID only — the folder is irrelevant for graph
  topology, traversals, or projections.
- No plan/agent split. `produced_by` is still an ordinary edge.

## Consequences

**Positive**

- Browsing by intent works without tooling: open `decisions/` to read
  the project's decisions; open `specs/` for specs.
- The IDE file tree becomes the most basic projection — for free.
- New node types added in the schema get a folder for free
  (the `TYPE_DIR` map is the single source of truth).
- The legacy `nodes/` layout remains readable: `egf` walks both the
  type-folders and `nodes/` when loading the graph, so existing repos
  keep working without migration.

**Negative**

- Two layouts coexist during the migration window. `egf` has to know
  about both. The cost is one constant (`ALL_NODE_DIRS`) and one
  fallthrough in `loadGraph`.
- A node whose `type` is changed (rare — usually a state transition,
  not a type change) requires an `mv` between folders. `egf validate`
  may grow a check for "type frontmatter matches folder" later if this
  drifts in practice; for now it is left as a soft contract.

## Alternatives

- **Keep ADR-0003's single `nodes/`** — rejected: the friction is
  real and `projections/` is not a substitute for the
  default-while-browsing case.
- **Subfolders by lifecycle state** (`context/`, `production/`, …) —
  rejected: state changes far more often than type, so files would
  migrate between folders constantly.
- **A flat `nodes/` plus per-type symlinks** — rejected: symlinks break
  on Windows, complicate Git, and add more moving parts than they save.

## Migration

For an existing repo that uses the legacy `nodes/` layout:

```bash
# move each file into the folder that matches its `type:` frontmatter
mkdir -p decisions specs observations hypotheses capabilities
mv nodes/N*-decision-*.md      decisions/
mv nodes/N*-spec-*.md          specs/
mv nodes/N*-observation-*.md   observations/
mv nodes/N*-hypothesis-*.md    hypotheses/
mv nodes/N*-capability-*.md    capabilities/
# … and so on for the remaining types
rmdir nodes
```

`egf validate` should pass before and after — IDs and edges are unchanged.