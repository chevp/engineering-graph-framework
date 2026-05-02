'use strict';

const fs = require('fs');
const path = require('path');
const { requireRepoRoot } = require('../util/fsx');
const { parse } = require('../util/frontmatter');
const { TYPE_DIR, TYPE_DIRS, ALL_NODE_DIRS } = require('../util/types');

function readEntries(dirs) {
  const list = Array.isArray(dirs) ? dirs : [dirs];
  const out = [];
  for (const dir of list) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md') || f === 'README.md') continue;
      const full = path.join(dir, f);
      const { data } = parse(fs.readFileSync(full, 'utf8'));
      out.push({ file: f, ...data });
    }
  }
  return out.sort((a, b) => String(a.id || '').localeCompare(String(b.id || '')));
}

function pad(s, n) {
  s = String(s == null ? '' : s);
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

function printTable(rows, cols) {
  if (!rows.length) {
    console.log('(none)');
    return;
  }
  const widths = cols.map(c =>
    Math.max(c.header.length, ...rows.map(r => String(r[c.key] == null ? '' : r[c.key]).length))
  );
  const header = cols.map((c, i) => pad(c.header, widths[i])).join('  ');
  const sep = widths.map(w => '-'.repeat(w)).join('  ');
  console.log(header);
  console.log(sep);
  for (const r of rows) {
    console.log(cols.map((c, i) => pad(r[c.key], widths[i])).join('  '));
  }
}

function listCmd(args) {
  const what = args[0] || 'nodes';
  const root = requireRepoRoot();

  if (what === 'nodes') {
    const rows = readEntries(ALL_NODE_DIRS.map(d => path.join(root, d)));
    printTable(rows, [
      { header: 'ID',    key: 'id' },
      { header: 'TYPE',  key: 'type' },
      { header: 'STATE', key: 'state' },
      { header: 'TITLE', key: 'title' },
    ]);
    return;
  }

  if (what === 'caps') {
    return listCmd(['capabilities', ...args.slice(1)]);
  }

  if (TYPE_DIRS.includes(what)) {
    const rows = readEntries(path.join(root, what));
    printTable(rows, [
      { header: 'ID',    key: 'id' },
      { header: 'STATE', key: 'state' },
      { header: 'TITLE', key: 'title' },
    ]);
    return;
  }

  if (what === 'inbox') {
    const rows = readEntries(path.join(root, 'inbox'));
    printTable(rows, [
      { header: 'ID',    key: 'id' },
      { header: 'TYPE',  key: 'type' },
      { header: 'TITLE', key: 'title' },
    ]);
    return;
  }

  console.error(`unknown list target: ${what}`);
  console.error(`valid: nodes | inbox | ${TYPE_DIRS.join(' | ')}`);
  process.exit(1);
}

module.exports = listCmd;
