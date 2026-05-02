# ADR 0003 — Ein Graph, kein Plan/Agent-Split

**Status:** accepted
**Datum:** 2026-05-02
**Kontext:** baut auf [ADR-0001](0001-markdown-als-source-of-truth.md) und
[ADR-0002](0002-schreibquellen.md) auf.

## Kontext

Das ursprüngliche README beschrieb zwei separate Graphen: Plan-Graph
(`plan-graph/nodes/`, IDs `N***`) als Wissens-Substrat und Agent-Graph
(`agent-graph/capabilities/`, IDs `A***`) als Werkzeug-Katalog. Begründung:
unterschiedliche Änderungsfrequenz und semver-artige Versionierung für Agents.

In der Implementierung ist dieser Unterschied verschwunden:

- Beide Knotentypen tragen denselben Lifecycle (`context` / `exploration` /
  `production` / `superseded` / `invalidated`) und dieselben Gates (G1/G2/G3).
- Beide nutzen Ganzzahl-Versionen, nicht Semver.
- Beide haben dasselbe Frontmatter-Schema.
- `produced_by` als Cross-Graph-Edge ist ein struktureller Sonderfall
  (eigener ID-Resolver, eigener Validator-Pfad).
- Der dritte Interaktionsmodus aus dem README ("Agent ist selbst Subjekt
  von Plan-Knoten — Bootstrapping ist nativ") verlangt explizit, dass
  Agents im Plan-Graph erscheinen — der Split widerspricht ihm.

## Entscheidung

**Ein einziger Graph in `nodes/` (Top-Level).** Der Knotentyp wird ausschließlich
über das `type`-Feld im Frontmatter unterschieden:

```
nodes/N011-capability-k6-load-tester.md      # type: capability
nodes/N002-hypothesis-tenant-id-index.md     # type: hypothesis
```

Die "Werkzeug-Katalog"-Sicht wird zur **Projektion**: ein Filter auf
`type=capability` ergibt eine Werkzeugliste, ohne dass eine eigene
Datenstruktur dafür gepflegt werden muss.

`inbox/` bleibt als Top-Level-Verzeichnis für ungeprüfte Importer-Knoten
vor G1.

## Konsequenzen

**Positiv**

- Eine ID-Menge, ein Validator-Pfad, ein Edge-Resolver (~30 Zeilen Code weg).
- `produced_by` ist eine ganz normale Edge ohne Sonderbehandlung.
- Bootstrapping mechanisch trivial: Plan-Knoten *über* eine Capability
  zeigen mit `refines` / `evidence_for` / etc. wie auf jeden anderen Knoten.
- Querbeziehungen ("welche Capability erzeugte welche Observations?")
  sind ein einfacher Graph-Traversal, kein Cross-Store-Join.

**Negativ**

- Capabilities und Plan-Knoten teilen den ID-Raum (`N\d+`). Der "auf einen Blick
  erkenne ich, was es ist"-Effekt am ID-Präfix entfällt — im Gegenzug trägt
  das `type`-Feld die Information, und der Dateiname enthält den Typ explizit.
- Migration der bestehenden A0xx-IDs: A001-A005 → N011-N015,
  Edges in N001/N004/N010 ziehen mit.
- README-Abschnitt "Zwei Graphen" wird zu "Ein Graph mit zwei Sichten".
- Cross-Graph-Edge-Form `agent:Axxx` entfällt — Edges referenzieren nur
  noch IDs ohne Prefix.

## Alternativen

- **Status quo behalten** — verworfen: strukturelle Asymmetrie ohne
  Datenunterschied, plus Sonderfälle im Code, ohne klaren Mehrwert.
- **Subordner als Kosmetik** (`nodes/plan/`, `nodes/agents/`) — verworfen:
  löst die Sonderfälle nicht, schiebt sie nur vom Verzeichnis in den Pfad.
- **Echter Semver-Lifecycle nur für Capabilities** — verworfen: würde
  zwei Lifecycle-Maschinen rechtfertigen, ist aber im Datenbestand nicht
  abgebildet und wäre eine eigene Designarbeit, die der ursprünglichen
  Begründung nachträglich Gewicht gäbe.

## Migration

1. `agent-graph/capabilities/A0xx-*.md` → `nodes/N0yy-capability-*.md`,
   IDs durchnummeriert (A001=N011, A002=N012, A003=N013, A004=N014, A005=N015).
2. Edges in Plan-Knoten (`to: agent:A0xx`) → `to: N0yy`.
3. `plan-graph/nodes/` → `nodes/`, `plan-graph/inbox/` → `inbox/`.
4. `findRepoRoot` schaut nach `nodes/` statt `plan-graph/` + `agent-graph/`.
5. `egf capability new` entfällt zugunsten `egf node new capability "<title>"`.
