---
id: A004
type: capability
state: exploration
title: "slo-checker"
created: 2026-04-22
version: 1
gates_passed: [G1]
edges: []
---

## Aussage
Fähigkeit, einen `spec`-Knoten (SLO-Definition) gegen aktuelle `observation`-Knoten
zu prüfen und automatisch `contradicts`-Kanten zu setzen, wenn ein SLO verletzt ist.

## Schnittstelle
- Input: `spec`-Knoten-ID, Zeitfenster.
- Output: ggf. neue `contradicts`-Kanten auf den verletzenden `observation`-Knoten.

## Notizen
Noch in `exploration`: Erfolgskriterium ist 0 false-positives über 14 Tage.
Aktuell läuft der Check schattenhaft, ohne Kanten zu schreiben.
