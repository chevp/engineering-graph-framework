# Inbox

Stage für Importer-Knoten, die noch keinen G1-Schritt passiert haben.
Hochfrequente Quellen (PagerDuty, Sentry, CI) schreiben hierher, damit die
Type-Verzeichnisse (`decisions/`, `specs/`, `observations/`, …) nicht durch
ungeprüfte Signale geflutet werden.

Ein Knoten verlässt die Inbox, sobald jemand (Mensch oder Agent) ihn als
relevant markiert (G1: testbare Aussage + Erfolgskriterium). Beim Übergang
wandert die Datei in das passende Type-Verzeichnis (z.B. `observations/`
für `type: observation`).
