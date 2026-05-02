# Projections

Materialized views over the graph. A projection is a query — starting from
a target node, a relevant subgraph is selected, topologically sorted, and
rendered as a linear execution view.

Consequence: projections are **regenerable**. They do not age — they are
re-projected as soon as the subgraph changes.

These files may be committed, but don't have to be. Treat them like
generated code: a readable snapshot, not the source of truth.
