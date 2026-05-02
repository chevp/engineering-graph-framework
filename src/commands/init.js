'use strict';

const fs = require('fs');
const path = require('path');
const { ensureDir, copyIfMissing } = require('../util/fsx');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

const DIRS = [
  'inbox',
  'projections',
];

// Type-Verzeichnisse (decisions/, specs/, …) werden nicht vorab angelegt.
// `egf node new <type>` legt das passende Verzeichnis lazy an, sobald der
// erste Knoten dieses Typs erstellt wird.

const FILES = [
  { dest: 'README.md',              src: 'project-readme.md' },
  { dest: '.gitignore',             src: 'gitignore' },
  { dest: 'inbox/README.md',        src: 'inbox-readme.md' },
  { dest: 'projections/README.md',  src: 'projections-readme.md' },
];

// Framework-eigene Doku (Schema, CLI-Referenz, EGF-ADRs) wird absichtlich
// NICHT mehr pro Konsumenten-Repo dupliziert. Sie lebt im EGF-Repo selbst —
// das Konsumenten-README verlinkt dorthin.

function init(args) {
  const cwd = process.cwd();
  const force = args.includes('--force');

  console.log(`egf init → ${cwd}${force ? '  (force: overwrite)' : ''}\n`);

  let created = 0;
  let skipped = 0;

  for (const rel of DIRS) {
    const full = path.join(cwd, rel);
    if (fs.existsSync(full)) {
      console.log(`  skip   ${rel}/  (exists)`);
      skipped++;
    } else {
      ensureDir(full);
      console.log(`  mkdir  ${rel}/`);
      created++;
    }
  }

  for (const { dest, src } of FILES) {
    const full = path.join(cwd, dest);
    const tpl = path.join(TEMPLATES_DIR, src);
    if (!fs.existsSync(tpl)) {
      console.log(`  warn   template missing: ${src}`);
      continue;
    }
    if (fs.existsSync(full) && !force) {
      console.log(`  skip   ${dest}  (exists)`);
      skipped++;
      continue;
    }
    if (force && fs.existsSync(full)) {
      fs.copyFileSync(tpl, full);
      console.log(`  force  ${dest}`);
      created++;
    } else if (copyIfMissing(tpl, full)) {
      console.log(`  write  ${dest}`);
      created++;
    }
  }

  console.log(`\n${created} created, ${skipped} skipped`);
  console.log(`\nNext steps:`);
  console.log(`  egf node new hypothesis "deine erste Hypothese"`);
  console.log(`  egf node new capability "k6 load tester"`);
  console.log(`  egf list nodes`);
  console.log(`  egf project`);
}

module.exports = init;
