'use strict';

const fs = require('fs');
const path = require('path');
const { MultiDirectedGraph } = require('graphology');
const { parse } = require('./frontmatter');

function readNodes(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .map(f => parse(fs.readFileSync(path.join(dir, f), 'utf8')).data);
}

function loadGraph(root) {
  const graph = new MultiDirectedGraph();
  const nodes = readNodes(path.join(root, 'nodes'));

  for (const n of nodes) {
    if (!n.id) continue;
    graph.addNode(n.id, {
      type: n.type,
      state: n.state,
      title: n.title,
      version: n.version,
      gates_passed: n.gates_passed || [],
    });
  }

  for (const n of nodes) {
    if (!n.id || !Array.isArray(n.edges)) continue;
    for (const e of n.edges) {
      if (!e || typeof e !== 'object' || !e.to || !e.type) continue;
      if (!graph.hasNode(e.to)) continue;
      graph.addEdge(n.id, e.to, { type: e.type, note: e.note });
    }
  }

  return graph;
}

module.exports = { loadGraph };
