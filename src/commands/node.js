'use strict';

const fs = require('fs');
const path = require('path');
const { requireRepoRoot, ensureDir } = require('../util/fsx');
const { slugify, nextId, today } = require('../util/slug');
const { NODE_TYPES, ALL_NODE_DIRS, dirForType } = require('../util/types');

const VALID_TYPES = NODE_TYPES;

// initial state per type — observations and measurements are facts on arrival
// (production); the rest start as context until G1 is passed.
const INITIAL_STATE = {
  observation: 'production',
  measurement: 'production',
  hypothesis: 'context',
  assumption: 'context',
  decision: 'context',
  spec: 'context',
  risk: 'context',
  capability: 'context',
};

function template({ id, type, title, date, state }) {
  return `---
id: ${id}
type: ${type}
state: ${state}
title: "${title.replace(/"/g, '\\"')}"
created: ${date}
version: 1
gates_passed: []
edges: []
---

## Aussage
TODO — ein Satz: was wird beobachtet, behauptet, gefordert, entschieden.

## Erfolgskriterium
TODO (nur für hypothesis, decision, spec — messbar formulieren)

## Evidenz / Kontext
TODO — Verweise auf Messungen, Tickets, Code-Stellen, andere Knoten.

## Notizen
TODO — was bei Gate-Übergängen passiert ist.
`;
}

function nodeCmd(args) {
  const [sub, type, ...titleParts] = args;
  if (sub !== 'new') {
    console.error('usage: egf node new <type> "<title>"');
    console.error(`types: ${VALID_TYPES.join(', ')}`);
    process.exit(1);
  }
  if (!type || !VALID_TYPES.includes(type)) {
    console.error(`error: type must be one of: ${VALID_TYPES.join(', ')}`);
    process.exit(1);
  }
  const title = titleParts.join(' ').trim();
  if (!title) {
    console.error('error: title required');
    console.error('usage: egf node new <type> "<title>"');
    process.exit(1);
  }

  const root = requireRepoRoot();
  const allDirs = ALL_NODE_DIRS.map(d => path.join(root, d));
  const id = nextId(allDirs, 'N');
  const targetDir = path.join(root, dirForType(type));
  ensureDir(targetDir);
  const fname = `${id}-${type}-${slugify(title)}.md`;
  const fpath = path.join(targetDir, fname);

  const body = template({
    id,
    type,
    title,
    date: today(),
    state: INITIAL_STATE[type],
  });

  fs.writeFileSync(fpath, body);
  const rel = path.relative(process.cwd(), fpath);
  console.log(`created ${rel}`);
}

module.exports = nodeCmd;
