# Plan-Graph

Wissens-Substrat. Knoten unter `nodes/`, ein Knoten pro Datei.
Format: siehe [docs/schema.md](../docs/schema.md).

Hochfrequent veränderlich. Knoten durchlaufen Zustände
(`context → exploration → production → superseded | invalidated`)
und verbinden sich über typisierte Kanten (`depends_on`, `refines`,
`supersedes`, `contradicts`, `evidence_for`, `produced_by`, ...).

`inbox/` ist die Stage für Importer-Signale, die noch keinen G1
durchlaufen haben — siehe [inbox/README.md](inbox/README.md).
