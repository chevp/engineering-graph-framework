# ADR 0003 — One graph, no plan/agent split

**Status:** accepted
**Date:** 2026-05-02
**Context:** builds on [ADR-0001](0001-markdown-als-source-of-truth.md) and
[ADR-0002](0002-schreibquellen.md).

## Context

The original README described two separate graphs: a plan graph
(`plan-graph/nodes/`, IDs `N***`) as the knowledge substrate, and an agent
graph (`agent-graph/capabilities/`, IDs `A***`) as the tool catalog. The
rationale: different rates of change and a semver-style versioning for
agents.

In the implementation, that distinction has disappeared:

- Both node kinds carry the same lifecycle (`context` / `exploration` /
  `production` / `superseded` / `invalidated`) and the same gates (G1/G2/G3).
- Both use integer versions, not semver.
- Both share the same frontmatter schema.
- `produced_by` as a cross-graph edge is a structural special case
  (its own ID resolver, its own validator path).
- The third interaction mode in the README ("an agent is itself the
  subject of plan nodes — bootstrapping is native") explicitly demands
  that agents appear in the plan graph — which contradicts the split.

## Decision

**A single graph in `nodes/` (top level).** The node kind is distinguished
solely by the `type` field in the frontmatter:

```
nodes/N011-capability-k6-load-tester.md      # type: capability
nodes/N002-hypothesis-tenant-id-index.md     # type: hypothesis
```

The "tool catalog" view becomes a **projection**: filtering by
`type=capability` produces a tool list without maintaining a separate
data structure for it.

`inbox/` remains as a top-level directory for unverified importer nodes
before G1.

## Consequences

**Positive**

- One ID space, one validator path, one edge resolver (~30 lines of code gone).
- `produced_by` is just an ordinary edge with no special handling.
- Bootstrapping is mechanically trivial: plan nodes *about* a capability
  point at it via `refines` / `evidence_for` / etc., the same as any other node.
- Cross-references ("which capability produced which observations?") are
  a simple graph traversal, not a cross-store join.

**Negative**

- Capabilities and other nodes share the ID space (`N\d+`). The
  "I-can-tell-what-it-is-from-the-prefix" effect is gone — in exchange,
  the `type` field carries that information, and the file name contains
  the type explicitly.
- Migration of the existing A0xx IDs: A001–A005 → N011–N015,
  edges in N001/N004/N010 carry over.
- The "Two graphs" section of the README becomes "One graph with two views".
- The cross-graph edge form `agent:Axxx` goes away — edges now reference
  IDs without a prefix.

## Alternatives

- **Keep the status quo** — rejected: structural asymmetry without a data
  difference, plus special cases in the code, with no clear benefit.
- **Subdirectories as cosmetics** (`nodes/plan/`, `nodes/agents/`) —
  rejected: doesn't resolve the special cases, just moves them from the
  directory into the path.
- **A real semver lifecycle for capabilities only** — rejected: it would
  justify two lifecycle machines, but it isn't reflected in the data and
  would be its own design effort, retroactively giving weight to the
  original rationale.

## Migration

1. `agent-graph/capabilities/A0xx-*.md` → `nodes/N0yy-capability-*.md`,
   IDs renumbered (A001=N011, A002=N012, A003=N013, A004=N014, A005=N015).
2. Edges in plan nodes (`to: agent:A0xx`) → `to: N0yy`.
3. `plan-graph/nodes/` → `nodes/`, `plan-graph/inbox/` → `inbox/`.
4. `findRepoRoot` looks for `nodes/` instead of `plan-graph/` + `agent-graph/`.
5. `egf capability new` is dropped in favor of `egf node new capability "<title>"`.
