'use strict';

const fs = require('fs');
const path = require('path');
const { requireRepoRoot } = require('../util/fsx');
const { parse } = require('../util/frontmatter');
const { loadGraph } = require('../util/graph');
const { ALL_NODE_DIRS } = require('../util/types');

function findFile(root, id) {
  const target = String(id).toUpperCase();
  for (const dir of [...ALL_NODE_DIRS, 'inbox']) {
    const full = path.join(root, dir);
    if (!fs.existsSync(full)) continue;
    const match = fs
      .readdirSync(full)
      .find(
        f =>
          f.endsWith('.md') &&
          f !== 'README.md' &&
          f.toUpperCase().startsWith(target + '-')
      );
    if (match) return { dir, file: match, full: path.join(full, match) };
  }
  return null;
}

function fmt(v) {
  if (v == null) return '(none)';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '(none)';
  return String(v);
}

function showCmd(args) {
  const id = args && args[0];
  if (!id) {
    console.error('usage: egf show <id>');
    process.exit(1);
  }
  const root = requireRepoRoot();
  const hit = findFile(root, id);
  if (!hit) {
    console.error(`error: node '${id}' not found in any type-dir or inbox/`);
    process.exit(1);
  }

  const raw = fs.readFileSync(hit.full, 'utf8');
  const { data, body } = parse(raw);
  const nodeId = data.id || id;

  console.log(`${nodeId}  ${data.type || ''}  [${data.state || '?'}]`);
  console.log(`title:        ${fmt(data.title)}`);
  console.log(`file:         ${path.relative(process.cwd(), hit.full)}`);
  console.log(`created:      ${fmt(data.created)}`);
  console.log(`version:      ${fmt(data.version)}`);
  console.log(`gates passed: ${fmt(data.gates_passed)}`);

  const graph = loadGraph(root);
  const inGraph = graph.hasNode(nodeId);

  console.log('\noutgoing edges:');
  if (inGraph) {
    const out = graph.outEdges(nodeId);
    if (!out.length) {
      console.log('  (none)');
    } else {
      for (const e of out) {
        const t = graph.target(e);
        const a = graph.getNodeAttributes(t);
        const note = graph.getEdgeAttribute(e, 'note');
        const noteStr = note ? `  — ${note}` : '';
        const type = (graph.getEdgeAttribute(e, 'type') || '?').padEnd(13);
        console.log(`  -> ${type} ${t}  "${a.title || ''}"${noteStr}`);
      }
    }
  } else if (Array.isArray(data.edges) && data.edges.length) {
    for (const e of data.edges) {
      const type = (e.type || '?').padEnd(13);
      console.log(`  -> ${type} ${e.to || '?'}  (target not in graph)`);
    }
  } else {
    console.log('  (none)');
  }

  console.log('\nincoming edges:');
  if (inGraph) {
    const inE = graph.inEdges(nodeId);
    if (!inE.length) {
      console.log('  (none)');
    } else {
      for (const e of inE) {
        const s = graph.source(e);
        const a = graph.getNodeAttributes(s);
        const note = graph.getEdgeAttribute(e, 'note');
        const noteStr = note ? `  — ${note}` : '';
        const type = (graph.getEdgeAttribute(e, 'type') || '?').padEnd(13);
        console.log(`  <- ${type} ${s}  "${a.title || ''}"${noteStr}`);
      }
    }
  } else {
    console.log('  (n/a — node not loaded into main graph)');
  }

  console.log('\n--- body ---');
  console.log(body.trimEnd());
}

module.exports = showCmd;
