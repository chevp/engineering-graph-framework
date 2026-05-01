# Engineering-Graph Framework

*Arbeitstitel — Nachfolger / Erweiterung von [chevp-ai-framework](../../misc/chevp-ai-framework).*

## Grundthese

Engineering ist nicht eine Sequenz von Tasks, sondern ein wachsender, verlinkter Wissensgraph. Pläne sind keine eigenständigen Dokumente, sondern Projektionen dieses Graphen. Der Lifecycle wandert von der Plan-Ebene auf die Knoten-Ebene: nicht der Task hat einen Zustand, sondern jedes Wissensartefakt.

Das Framework beschreibt zwei gekoppelte Graphen, ihre Knoten-Lifecycles, und wie aus dem Substrat ausführbare Arbeit entsteht.

## Zwei Graphen

**Plan-Graph (Wissens-Substrat)**
Knoten sind Engineering-Artefakte: Annahmen, Hypothesen, Messungen, Entscheidungen, Spezifikationen, Risiken, beobachtete Zustände. Hochfrequent veränderlich, versioniert, der "Körper" der Arbeit.

**Agent-Graph (Werkzeug-Katalog)**
Knoten sind Fähigkeiten: Lasttest, Code-Analyse, Migrations-Generator, Schema-Validator. Kanten sind Komposition und Abhängigkeit. Niederfrequent, infrastrukturell, semantisch versioniert wie eine Package-Registry.

Die beiden Graphen werden getrennt gespeichert und treffen sich nur über deklarierte Capabilities (Bedarf eines Plan-Knotens ↔ Fähigkeit eines Agent-Knotens).

## Knoten-Lifecycle (Plan-Graph)

Jeder Plan-Knoten durchläuft Zustände. Mehrere Knoten desselben Vorhabens befinden sich gleichzeitig in unterschiedlichen Zuständen.

| Zustand          | Bedeutung                                                                                    |
|------------------|----------------------------------------------------------------------------------------------|
| **Context**      | Knoten ist neu angelegt; sammelt Beobachtungen, ohne Anspruch auf Wahrheit                   |
| **Exploration**  | Knoten ist als testbare Hypothese formuliert; aktive Untersuchung                            |
| **Production**   | Knoten ist validiert; Teil des stabilen Wissens, andere Knoten dürfen darauf bauen           |
| **Superseded**   | Knoten wurde durch einen Nachfolger ersetzt; bleibt sichtbar für Historie                    |
| **Invalidated**  | Knoten wurde durch neue Messung als falsch erkannt; bleibt sichtbar als Lehrwert             |

Endzustände sind nicht terminal im Sinne von "weg" — sie bleiben Teil des Graphen und tragen Lehrwert.

## Gates als Kanten-Prädikate

Gates sind keine globalen Phasen-Übergänge mehr, sondern Bedingungen auf Kanten zwischen Zustandsversionen eines Knotens.

- **G1 (Context → Exploration)**: Knoten ist als testbare Aussage formuliert, hat ein Erfolgskriterium.
- **G2 (Exploration → Production)**: Erfolgskriterium ist erfüllt, Evidenz ist im Graph verlinkt (Messungen, Reviews, Verifikationen).
- **G3 (Production → Superseded)**: Nachfolge-Knoten existiert, Supersede-Kante ist gesetzt, abhängige Knoten sind benachrichtigt oder migriert.

Ein Gate-Übergang erzeugt eine neue Knotenversion, nicht eine Mutation der bestehenden. Der Graph behält Geschichte.

## Kantentypen

Mindestens nötig:

- `depends_on` — Knoten A setzt B voraus
- `refines` — A ist eine Konkretisierung von B
- `supersedes` — A ersetzt B
- `contradicts` — A widerspricht B (offen, ungelöst)
- `related_to` — schwache, kuratierende Verknüpfung
- `produced_by` — A wurde von Agent X erzeugt (Brücke zum Agent-Graph)
- `evidence_for` / `evidence_against` — A stützt/widerlegt B

## Pläne als Projektion

Ein "Plan" im klassischen Sinn ist im neuen Modell eine Query: ausgehend von einem Zielknoten wird ein Subgraph relevanter Knoten gewählt, topologisch sortiert, und als lineare Ausführungssicht für einen Lauf präsentiert.

Konsequenzen:

- Zwei Pläne dürfen denselben Knoten teilen — Wissensreuse statt Copy-Paste.
- Ein Plan altert nicht; er wird neu projiziert, sobald sich der Subgraph ändert.
- "Was ist als nächstes zu tun?" ist eine Graph-Traversal-Frage.

## Verhältnis zum Agent-Graph

Drei Interaktionsmodi:

1. **Runtime**: Ein Agent-Lauf liest einen Subgraph (Kontext), schreibt neue Knoten und Kanten (Ergebnis).
2. **Matching**: Ein offener Plan-Knoten deklariert seinen Bedarf; der Daemon sucht im Agent-Graph passende Fähigkeiten. Kein hardcoded Job-Routing.
3. **Reflexion**: Ein Agent ist selbst Subjekt von Plan-Knoten. Wenn man einen Agent baut oder verbessert, entstehen Plan-Knoten über den Agent — die wiederum von anderen Agenten bearbeitet werden können. Bootstrapping ist nativ.

## Operative Konsequenzen

**Was bleibt vom chevp-ai-framework**: die drei Lifecycle-Stufen (Context/Exploration/Production), die drei Gates (G1/G2/G3), die Forderung "vor Schreibarbeit Lifecycle-Schritt benennen". Form bleibt, Bezugsobjekt wechselt — nicht der Task, sondern der Knoten.

**Was ändert sich im Tagesgeschäft**:

- Statt "Plan-Datei anlegen" → "Knoten anlegen, Kanten deklarieren".
- Statt "Plan abarbeiten" → "Subgraph projizieren, ausführen, Ergebnisse als neue Knoten zurückschreiben".
- Statt "Plan ist veraltet" → "Knoten X ist superseded, abhängige Knoten neu prüfen".
- Code-Review wird zu Knoten-Review mit klarem Gate-Kriterium.

**Was ist neu**:

- Wissens-Reuse über Plan-Grenzen hinweg.
- Historische Lehrwerte (Invalidated-Knoten) bleiben durchsuchbar.
- Selbstbeschreibung: das System dokumentiert seine eigene Werkzeugentwicklung.
- Kontextauswahl für Agenten wird Graph-Traversal statt Prompt-Engineering.

## Offene Designfragen

- Granularität von Knoten: wann ist etwas ein eigener Knoten, wann Teil eines anderen?
- Konfliktauflösung bei `contradicts`-Kanten: manuell, agentengestützt, beides?
- Migrationspfad von bestehenden linearen Plänen in den Graphen.
- Sichtbarkeits-/Vertraulichkeitsmodell für Knoten (nicht alles ist gleich exponierbar).
- UI-Frage: wie navigiert ein Mensch effizient einen Graphen, der täglich wächst.
