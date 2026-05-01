# ADR 0002 — Drei Schreibquellen: Mensch, Agent, Importer

**Status:** accepted
**Datum:** 2026-05-02
**Kontext:** baut auf [ADR-0001](0001-markdown-als-source-of-truth.md) auf.

## Kontext

Wer schreibt Knoten in den Plan-Graph? Die README beschreibt mehrere Modi
(Mensch legt Knoten an, Agent-Läufe schreiben Ergebnisse, externe Systeme
liefern Signale), legt aber nicht fest, ob das CLI für alle drei einen
einheitlichen Pfad anbietet.

## Entscheidung

Drei Schreibquellen, ein gemeinsames Schreibmodell:

1. **Mensch** — direkt im Editor, oder per `engraph node new --type=hypothesis "Titel"`.
   Typische Knotentypen: `hypothesis`, `assumption`, `decision`, `spec`, `risk`.
   Kein `produced_by`-Edge. Autor steht im git-Commit.

2. **Agent** — Capability aus dem Agent-Graph führt einen Lauf aus und schreibt
   das Ergebnis als Knoten zurück. Typische Knotentypen: `observation`,
   `measurement`, manchmal `evidence_for`/`evidence_against`-Kanten an
   bestehende Hypothesen. Setzt `produced_by: agent:Axxx` als Edge.

3. **Importer** — Spezialform von Agent: liest aus einem externen System
   (Alert-Manager, Issue-Tracker, CI, Sentry) und schreibt entsprechende
   Knoten. Im Agent-Graph als reguläre Capability geführt. Setzt ebenfalls
   `produced_by: agent:Axxx`.

**Alle drei schreiben Markdown-Files.** Niemand schreibt direkt in die SQLite.
Re-Index folgt automatisch oder per `engraph index`.

## Konsequenzen

**Positiv**
- Einheitlicher Schreibpfad — Test-Setup ist trivial: Datei reinlegen, fertig.
- `produced_by`-Edges machen die Provenienz eines Knotens explizit und
  abfragbar („alle Knoten, die A001 erzeugt hat", „alle ungeprüften
  Importer-Knoten").
- Mensch und Agent kollidieren nicht: git-merge auf Markdown ist Standard-Werkzeug.
- Importer sind nichts Besonderes — keine Sonder-Schnittstelle, kein
  Sondermodell. Reduziert Komplexität im Daemon.

**Negativ**
- Hochfrequente Importer (jede Minute ein neuer Knoten) erzeugen viele
  git-Commits. Mitigation: Importer dürfen Knoten in eine `inbox/`-Zone
  schreiben und erst nach G1-Übergang nach `nodes/` migrieren.
- Mensch-Edits an Agent-erzeugten Knoten sind erlaubt, müssen aber als
  neue Version geführt werden (Lifecycle-Regel aus README), nicht als
  Mutation. Tooling muss das durchsetzen.

## Konvention

- Knoten ohne `produced_by`-Edge gilt implizit als Mensch-erzeugt.
- Mehrere `produced_by`-Edges sind erlaubt (z.B. Pipeline aus zwei Agents).
- `produced_by` zielt immer in den Agent-Graph (`agent:Axxx`), nie auf einen Plan-Knoten.

## Alternativen

- **Nur Agents schreiben, Mensch geht über einen „author-agent"-Wrapper.**
  Verworfen: künstliche Indirection ohne Mehrwert.
- **Eigenes Feld `author` im Frontmatter** statt der `produced_by`-Edge.
  Verworfen: dupliziert Information, die git und der Edge bereits tragen.
