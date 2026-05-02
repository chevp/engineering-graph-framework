# Engineering-Graph Framework

*Working title — successor / extension of [chevp-ai-framework](../../misc/chevp-ai-framework).*

## Core thesis

Engineering is not a sequence of tasks, but a growing, linked knowledge graph. Plans are not standalone documents — they are projections of this graph. The lifecycle moves from the plan level down to the node level: it is no longer the task that has a state, but every knowledge artifact.

The framework describes a single graph whose nodes share the same lifecycle, and how executable work emerges from that substrate. Capabilities (tools, importers, analyzers) are nodes of the same graph — distinguished only by the `type` field. See [ADR-0003](docs/adr/0003-ein-graph.md).

## Node types

| Type          | Meaning                                                                                       |
|---------------|-----------------------------------------------------------------------------------------------|
| `observation` | Fact from a log, metric, or observation                                                       |
| `measurement` | Measurement result (EXPLAIN plan, load-test run, …)                                           |
| `hypothesis`  | Testable claim with a success criterion                                                       |
| `assumption`  | Unquestioned premise                                                                          |
| `decision`    | Decision — should move to Production once it has evidence                                     |
| `spec`        | Specification, acceptance criterion, SLO                                                      |
| `risk`        | Identified risk                                                                               |
| `capability`  | Tool / agent / importer (load tester, code analyzer, migration generator, …)                  |

The plan view and the tool catalog are **projections** of the same graph (`egf list capabilities` filters by `type=capability`).

## Node lifecycle

Every node moves through a set of states. Multiple nodes belonging to the same effort can be in different states at the same time.

| State            | Meaning                                                                                       |
|------------------|-----------------------------------------------------------------------------------------------|
| **Context**      | Node was just created; collects observations without claiming truth                           |
| **Exploration**  | Node is formulated as a testable hypothesis; under active investigation                       |
| **Production**   | Node is validated; part of stable knowledge, other nodes may build on it                      |
| **Superseded**   | Node was replaced by a successor; remains visible for history                                 |
| **Invalidated**  | Node was shown to be wrong by a new measurement; remains visible for its lessons              |

End states are not terminal in the sense of "gone" — they remain part of the graph and carry educational value.

## Gates as edge predicates

Gates are no longer global phase transitions but conditions on edges between state versions of a node.

- **G1 (Context → Exploration)**: node is formulated as a testable claim and has a success criterion.
- **G2 (Exploration → Production)**: success criterion is met, evidence is linked in the graph (measurements, reviews, verifications).
- **G3 (Production → Superseded)**: a successor node exists, the supersede edge is set, dependent nodes are notified or migrated.

A gate transition produces a new node version, not a mutation of the existing one. The graph keeps history.

## Edge types

Minimum required:

- `depends_on` — node A requires B
- `refines` — A is a concretization of B
- `supersedes` — A replaces B
- `contradicts` — A contradicts B (open, unresolved)
- `related_to` — weak, curatorial link
- `produced_by` — A was produced by a `capability` node
- `evidence_for` / `evidence_against` — A supports/refutes B

## Plans as projection

A "plan" in the classical sense is, in this new model, a query: starting from a target node, a subgraph of relevant nodes is selected, topologically sorted, and presented as a linear execution view for one run.

Consequences:

- Two plans may share the same node — knowledge reuse instead of copy-paste.
- A plan does not age; it is re-projected as soon as the subgraph changes.
- "What should we do next?" becomes a graph traversal question.

## Tools in the graph

Three modes of interaction:

1. **Runtime**: a capability run reads a subgraph (context) and writes new nodes and edges (result).
2. **Matching**: an open node declares its need; the daemon searches the graph for matching `capability` nodes. No hardcoded job routing.
3. **Reflection**: a capability is itself the subject of other nodes. When a capability is built or improved, plan nodes about that capability come into being — which in turn can be processed by other capabilities. Bootstrapping is native.

## Operational consequences

**What stays from chevp-ai-framework**: the three lifecycle stages (Context/Exploration/Production), the three gates (G1/G2/G3), and the requirement to name the lifecycle step before doing any writing work. The form remains; the referent changes — not the task, but the node.

**What changes day to day**:

- Instead of "create a plan file" → "create a node, declare edges".
- Instead of "work through the plan" → "project the subgraph, execute it, write results back as new nodes".
- Instead of "the plan is stale" → "node X is superseded, re-check dependent nodes".
- Code review becomes node review with a clear gate criterion.

**What is new**:

- Knowledge reuse across plan boundaries.
- Historical lessons (invalidated nodes) remain searchable.
- Self-description: the system documents the development of its own tools.
- Context selection for capabilities becomes graph traversal instead of prompt engineering.

## Open design questions

- Granularity of nodes: when is something its own node, and when is it part of another?
- Conflict resolution on `contradicts` edges: manual, agent-assisted, both?
- Migration path from existing linear plans into the graph.
- Visibility / confidentiality model for nodes (not everything is equally exposable).
- UI question: how does a human efficiently navigate a graph that grows daily?
