# ADR 0001 — Markdown ist source-of-truth, SQLite ist Index

**Status:** accepted
**Datum:** 2026-05-02

## Kontext

Das Framework benötigt persistenten Speicher für zwei Graphen (Plan, Agent).
Naheliegende Option: SQLite, weil per CLI installierbar (Node-Modul mit
`better-sqlite3`), keine Server-Komponente nötig, gute Query-Eigenschaften
für Traversals.

Offene Frage: ist SQLite die kanonische Form der Daten, oder nur ein abgeleiteter Index?

SQLite-Verhalten ist hier kein Problem — die Datei wird nicht „ganz geladen",
sondern per Page-Cache und mmap on-demand gelesen. Pro CLI-Aufruf wenige ms,
auch ohne Daemon.

## Entscheidung

**Markdown-Dateien unter `plan-graph/nodes/` und `agent-graph/capabilities/`
sind die kanonische Form der Daten.** SQLite ist ein generierter Index zur
Beschleunigung von Traversals, Projektionen und Queries.

- Schreiben heißt: Markdown-Datei anlegen oder ändern, gefolgt von Re-Index.
- Lesen für Queries: gegen die SQLite. Lesen für Mensch / Diff / Review: gegen die Markdown.
- `engraph index` parst alle Knoten- und Kanten-Files und baut die SQLite neu.
- Bei file-watch-Modus wird inkrementell aktualisiert.

## Konsequenzen

**Positiv**
- git versioniert die Wahrheit; Diffs sind lesbar; Code-Review funktioniert auf Knoten.
- Editor-Workflow bleibt trivial: ein Knoten ist eine Datei.
- SQLite ist verwerfbar — bei Schema-Änderung einfach neu bauen.
- Agent-Läufe und Mensch-Edits gehen durch denselben Pfad (Datei schreiben),
  was den Graph in [ADR-0002](0002-schreibquellen.md) symmetrisch macht.

**Negativ**
- Sync-Aufwand: nach jeder Änderung muss der Index aktualisiert werden.
- Drift möglich, wenn jemand am Index vorbei schreibt — daher: nur Markdown ist Quelle, niemand schreibt direkt SQL.
- Bei sehr großen Graphen (> 10k Knoten) wird Re-Index langsamer; dann braucht es inkrementelles Indexing per file-watcher.

## Alternativen

- **SQLite ist source-of-truth, Markdown ist Export.** Verworfen: man verliert
  git-Diff, Editor-Workflow, Mensch-Lesbarkeit. Widerspricht der Grundthese
  „Wissens-Substrat" im README.
- **Embedded Graph-DB (z.B. Kùzu).** Verworfen für v1: höhere Abhängigkeit,
  schlechter portabel, keine git-Diffs. Optional später als Index-Backend.
- **Plain JSON-Dateien statt Markdown mit Frontmatter.** Verworfen: Knoten haben
  einen Body (Aussage, Kontext, Notizen) — Markdown trägt das natürlich,
  JSON würde den Body in einen String-Feld zwängen.
