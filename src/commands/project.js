'use strict';

const fs = require('fs');
const path = require('path');
const { topologicalSort } = require('graphology-dag');
const { requireRepoRoot } = require('../util/fsx');
const { parse } = require('../util/frontmatter');
const { loadGraph } = require('../util/graph');

// edge types that pull a prerequisite into the projection.
// related_to / contradicts are informational and may cycle, so we exclude them.
const DEP_EDGES = new Set(['depends_on', 'refines', 'evidence_for', 'supersedes']);

function readAll(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .map(f => parse(fs.readFileSync(path.join(dir, f), 'utf8')).data);
}

function tally(items, key) {
  const out = {};
  for (const it of items) {
    const v = it[key] || 'unknown';
    out[v] = (out[v] || 0) + 1;
  }
  return out;
}

function fmt(obj) {
  const keys = Object.keys(obj).sort();
  if (!keys.length) return '(none)';
  return keys.map(k => `${k}: ${obj[k]}`).join('  ');
}

function overview(root) {
  const nodes = readAll(path.join(root, 'nodes'));
  const inbox = readAll(path.join(root, 'inbox'));
  const caps = nodes.filter(n => n.type === 'capability');

  console.log(`egf project — ${root}\n`);
  console.log(`nodes:         ${nodes.length}`);
  console.log(`  by state:    ${fmt(tally(nodes, 'state'))}`);
  console.log(`  by type:     ${fmt(tally(nodes, 'type'))}`);
  console.log(`inbox:         ${inbox.length}`);
  console.log(`capabilities:  ${caps.length}  (subset of nodes where type=capability)`);
}

function collectPrereqs(graph, target) {
  const seen = new Set([target]);
  const stack = [target];
  while (stack.length) {
    const n = stack.pop();
    for (const e of graph.outEdges(n)) {
      const t = graph.getEdgeAttribute(e, 'type');
      if (!DEP_EDGES.has(t)) continue;
      const next = graph.target(e);
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen;
}

function projectNode(root, target) {
  const graph = loadGraph(root);
  if (!graph.hasNode(target)) {
    console.error(`error: node '${target}' not found`);
    process.exit(1);
  }

  const subset = collectPrereqs(graph, target);

  // induce subgraph keeping only dep-like edges, then reverse for prereqs-first order
  const sub = new (require('graphology').MultiDirectedGraph)();
  for (const id of subset) sub.addNode(id, graph.getNodeAttributes(id));
  for (const id of subset) {
    for (const e of graph.outEdges(id)) {
      const t = graph.getEdgeAttribute(e, 'type');
      if (!DEP_EDGES.has(t)) continue;
      const tgt = graph.target(e);
      if (!subset.has(tgt)) continue;
      // reverse: prereq → dependent
      sub.addEdge(tgt, id, { type: t });
    }
  }

  let order;
  try {
    order = topologicalSort(sub);
  } catch (err) {
    console.error(`error: cannot project — graph has a cycle (${err.message})`);
    process.exit(1);
  }

  console.log(`egf project — projection from ${target}`);
  console.log(`subgraph: ${subset.size} node(s), edges considered: ${[...DEP_EDGES].join(', ')}\n`);

  const widths = order.reduce(
    (w, id) => {
      const a = graph.getNodeAttributes(id);
      return {
        id: Math.max(w.id, id.length),
        type: Math.max(w.type, (a.type || '').length),
        state: Math.max(w.state, (a.state || '').length),
      };
    },
    { id: 2, type: 4, state: 5 }
  );

  const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n);
  console.log(
    `${pad('ID', widths.id)}  ${pad('TYPE', widths.type)}  ${pad('STATE', widths.state)}  TITLE`
  );
  console.log(
    `${'-'.repeat(widths.id)}  ${'-'.repeat(widths.type)}  ${'-'.repeat(widths.state)}  -----`
  );
  for (const id of order) {
    const a = graph.getNodeAttributes(id);
    const marker = id === target ? '*' : ' ';
    console.log(
      `${pad(id, widths.id)}  ${pad(a.type || '', widths.type)}  ${pad(a.state || '', widths.state)}  ${marker} ${a.title || ''}`
    );
  }
  console.log('\n* = target');
}

function projectCmd(args) {
  const root = requireRepoRoot();
  const target = args && args[0];
  if (target) {
    projectNode(root, target);
  } else {
    overview(root);
  }
}

module.exports = projectCmd;
