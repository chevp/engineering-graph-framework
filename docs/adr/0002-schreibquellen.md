# ADR 0002 — Three write sources: human, agent, importer

**Status:** accepted
**Date:** 2026-05-02
**Context:** builds on [ADR-0001](0001-markdown-als-source-of-truth.md).

## Context

Who writes nodes into the graph? The README describes several modes
(humans create nodes, agent runs write results, external systems deliver
signals) but does not specify whether the CLI offers a unified path for
all three.

## Decision

Three write sources, one shared write model:

1. **Human** — directly in the editor, or via `egf node new hypothesis "title"`.
   Typical node types: `hypothesis`, `assumption`, `decision`, `spec`, `risk`.
   No `produced_by` edge. The author is recorded in the git commit.

2. **Agent** — a `capability` node from the graph executes a run and writes
   the result back as a node. Typical node types: `observation`,
   `measurement`, sometimes `evidence_for` / `evidence_against` edges into
   existing hypotheses. Sets `produced_by: Nxxx` as an edge.

3. **Importer** — a special form of agent: it reads from an external system
   (alert manager, issue tracker, CI, Sentry) and writes the corresponding
   nodes. Tracked as a regular `capability` in the graph. Also sets
   `produced_by: Nxxx`.

**All three write Markdown files.** No one writes directly into SQLite.
Re-indexing happens automatically or via `egf index`.

## Consequences

**Positive**
- A single write path — test setup is trivial: drop a file in, done.
- `produced_by` edges make a node's provenance explicit and queryable
  ("all nodes produced by N011", "all unverified importer nodes").
- Human and agent do not collide: git merge on Markdown is a standard tool.
- Importers are nothing special — no separate interface, no separate model.
  This reduces complexity in the daemon.

**Negative**
- High-frequency importers (one new node per minute) produce many git
  commits. Mitigation: importers may write nodes into an `inbox/` zone
  and only migrate them into `nodes/` after passing G1.
- Human edits to agent-produced nodes are allowed but must be tracked as
  a new version (per the lifecycle rules in the README), not as a mutation.
  Tooling has to enforce that.

## Convention

- A node without a `produced_by` edge is implicitly considered human-authored.
- Multiple `produced_by` edges are allowed (e.g. a pipeline of two agents).
- `produced_by` always targets a `capability` node — never a non-capability node.

## Alternatives

- **Only agents write; humans go through an "author-agent" wrapper.**
  Rejected: artificial indirection with no benefit.
- **A separate `author` field in the frontmatter** instead of the
  `produced_by` edge. Rejected: it duplicates information that git and
  the edge already carry.
