# Projections

Materialisierte Sichten auf den Plan-Graph. Eine Projektion ist eine Query —
ausgehend von einem Zielknoten wird ein relevanter Subgraph gewählt,
topologisch sortiert und als lineare Ausführungssicht gerendert.

Konsequenz: Projektionen sind **regenerierbar**. Sie altern nicht — sie
werden neu projiziert, sobald sich der Subgraph ändert.

Diese Files dürfen committed werden, müssen es aber nicht. Behandle sie
wie generierten Code: lesbarer Snapshot, nicht source-of-truth.
