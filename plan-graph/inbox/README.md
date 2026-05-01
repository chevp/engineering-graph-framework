# Inbox

Stage für Importer-Knoten, die noch keinen G1-Schritt passiert haben.
Hochfrequente Quellen (PagerDuty, Sentry, CI) schreiben hierher, damit die
Hauptzone `nodes/` nicht durch ungeprüfte Signale geflutet wird.

Ein Knoten verlässt die Inbox, sobald jemand (Mensch oder Agent) ihn als
relevant markiert (G1: testbare Aussage + Erfolgskriterium). Beim Übergang
wandert die Datei nach `nodes/`.

Aktuell leer — N010 ist bereits migriert.
