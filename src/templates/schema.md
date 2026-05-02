# Schema

Knoten und Kanten als Markdown-Dateien mit YAML-Frontmatter.
Eine Datei pro Knoten. Kanten werden im Frontmatter des Quellknotens deklariert.

## Knoten-Frontmatter

```yaml
---
id: N001                    # eindeutig, stabil, fortlaufend (N\d+)
type: observation           # observation | hypothesis | assumption | decision | spec | measurement | risk | capability
state: production           # context | exploration | production | superseded | invalidated
title: "Kurzer Titel"
created: 2026-04-28         # ISO-Datum
version: 1                  # erhöht bei Gate-Übergang, der eine neue Version erzeugt
gates_passed: [G1, G2]      # Audit-Spur
edges:
  - to: N005                # Knoten-ID — alle Knoten teilen denselben ID-Raum
    type: contradicts       # depends_on | refines | supersedes | contradicts | related_to | produced_by | evidence_for | evidence_against
    note: "optional"
---
```

## Knoten-Body (Konvention)

```markdown
## Aussage
Was behauptet / beobachtet / gefordert wird. Ein Satz.

## Erfolgskriterium
Nur für hypothesis, decision, spec, capability. Messbar formuliert.

## Evidenz / Kontext
Verweise auf Messungen, Tickets, Code-Stellen. Frei.

## Notizen
Was bei Gate-Übergängen passiert ist. Kurz.
```

## Lifecycle-Regeln

- Gate-Übergang → neue Knotenversion (neuer Knoten oder erhöhte `version`).
- `Superseded` und `Invalidated` sind sichtbar, nicht gelöscht.
- `produced_by` zeigt auf einen `capability`-Knoten — keine Sonderbehandlung, eine Edge wie jede andere.

## Verzeichnisse

- `nodes/` — Wissens-Substrat (alle Knoten — hypothesis, decision, capability, …)
- `inbox/` — ungeprüfte Importer-Signale vor G1
- `projections/` — materialisierte Graph-Sichten (Query-Resultate, regenerierbar)

## Speicher

Markdown-Files sind die kanonische Form. SQLite ist ein optionaler generierter
Index zur Beschleunigung von Traversals. Siehe [ADR-0001](adr/0001-markdown-als-source-of-truth.md).

## Schreibquellen

Drei Quellen, ein Pfad (alle schreiben Markdown):

| Quelle    | Erkennbar an              | Typische Knotentypen                                  |
|-----------|---------------------------|-------------------------------------------------------|
| Mensch    | kein `produced_by`-Edge   | hypothesis, assumption, decision, spec, risk          |
| Capability| `produced_by: Nxxx`       | observation, measurement, evidence_for/against        |
| Importer  | `produced_by: Nxxx`       | observation (aus Alerts, Issues, CI, Monitoring)      |

Importer sind reguläre `capability`-Knoten — keine Sonderschnittstelle.
Siehe [ADR-0002](adr/0002-schreibquellen.md) und [ADR-0003](adr/0003-ein-graph.md).
