# ADR 0001 — Markdown is source of truth, SQLite is index

**Status:** accepted
**Date:** 2026-05-02

## Context

The framework needs persistent storage for its graph. The obvious option is
SQLite: installable through the CLI (Node module via `better-sqlite3`),
no server component required, good query characteristics for traversals.

Open question: is SQLite the canonical form of the data, or just a derived index?

SQLite's behavior is not a problem here — the file is not "fully loaded";
it is read on-demand through the page cache and mmap. Each CLI invocation
takes a few milliseconds, even without a daemon.

## Decision

**The Markdown files under `nodes/` are the canonical form of the data.**
SQLite is a generated index that accelerates traversals, projections, and
queries.

- Writing means: create or change a Markdown file, followed by re-indexing.
- Reading for queries: against SQLite. Reading for humans / diff / review:
  against the Markdown.
- `egf index` parses all node and edge files and rebuilds the SQLite index.
- In file-watch mode the index is updated incrementally.

## Consequences

**Positive**
- Git versions the truth; diffs are readable; code review works on nodes.
- Editor workflow stays trivial: a node is a file.
- SQLite is disposable — on a schema change just rebuild it.
- Capability runs and human edits go through the same path (write a file),
  which makes the graph in [ADR-0002](0002-schreibquellen.md) symmetric.

**Negative**
- Sync overhead: after every change the index has to be updated.
- Drift is possible if someone writes around the index — therefore: only
  Markdown is the source, no one writes SQL directly.
- For very large graphs (> 10k nodes) re-indexing gets slow; that is when
  incremental indexing via a file-watcher becomes necessary.

## Alternatives

- **SQLite is source of truth, Markdown is export.** Rejected: this loses
  the git diff, the editor workflow, and human readability. It contradicts
  the core "knowledge substrate" thesis in the README.
- **Embedded graph database (e.g. Kùzu).** Rejected for v1: heavier
  dependency, less portable, no git diffs. Optional later as an index backend.
- **Plain JSON files instead of Markdown with frontmatter.** Rejected:
  nodes have a body (statement, context, notes) — Markdown carries that
  naturally; JSON would force the body into a string field.
