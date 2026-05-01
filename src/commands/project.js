'use strict';

const fs = require('fs');
const path = require('path');
const { requireRepoRoot } = require('../util/fsx');
const { parse } = require('../util/frontmatter');

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

function projectCmd() {
  const root = requireRepoRoot();
  const nodes = readAll(path.join(root, 'plan-graph', 'nodes'));
  const inbox = readAll(path.join(root, 'plan-graph', 'inbox'));
  const caps = readAll(path.join(root, 'agent-graph', 'capabilities'));

  console.log(`egf project — ${root}\n`);
  console.log(`plan-graph/nodes:        ${nodes.length}`);
  console.log(`  by state:   ${fmt(tally(nodes, 'state'))}`);
  console.log(`  by type:    ${fmt(tally(nodes, 'type'))}`);
  console.log(`plan-graph/inbox:        ${inbox.length}`);
  console.log(`agent-graph/capabilities: ${caps.length}`);
}

module.exports = projectCmd;
