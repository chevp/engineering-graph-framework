'use strict';

const fs = require('fs');
const path = require('path');
const { requireRepoRoot } = require('../util/fsx');
const { slugify, nextId, today } = require('../util/slug');

function template({ id, title, date }) {
  return `---
id: ${id}
type: capability
state: production
title: "${title.replace(/"/g, '\\"')}"
created: ${date}
version: 1
gates_passed: []
edges: []
---

## Aussage
TODO — was kann diese Capability? Eine Zeile.

## Schnittstelle
TODO — Inputs, Outputs, Aufruf-Konvention. So konkret wie möglich.

## Abhängigkeiten
TODO — andere Capabilities (depends_on) oder externe Tools.

## Notizen
TODO — Versionierungs-Hinweise, Stabilität, bekannte Limits.
`;
}

function capabilityCmd(args) {
  const [sub, ...titleParts] = args;
  if (sub !== 'new') {
    console.error('usage: egf capability new "<title>"');
    process.exit(1);
  }
  const title = titleParts.join(' ').trim();
  if (!title) {
    console.error('error: title required');
    console.error('usage: egf capability new "<title>"');
    process.exit(1);
  }

  const root = requireRepoRoot();
  const dir = path.join(root, 'agent-graph', 'capabilities');
  const id = nextId(dir, 'A');
  const fname = `${id}-${slugify(title)}.md`;
  const fpath = path.join(dir, fname);

  fs.writeFileSync(fpath, template({ id, title, date: today() }));
  const rel = path.relative(process.cwd(), fpath);
  console.log(`created ${rel}`);
}

module.exports = capabilityCmd;
