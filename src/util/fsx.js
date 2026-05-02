'use strict';

const fs = require('fs');
const path = require('path');
const { ALL_NODE_DIRS } = require('./types');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeIfMissing(dest, content) {
  if (fs.existsSync(dest)) return false;
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, content);
  return true;
}

function copyIfMissing(src, dest) {
  if (fs.existsSync(dest)) return false;
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return true;
}

function isRepoRoot(dir) {
  for (const d of [...ALL_NODE_DIRS, 'inbox']) {
    if (fs.existsSync(path.join(dir, d))) return true;
  }
  return false;
}

function findRepoRoot(startDir) {
  let dir = startDir;
  while (true) {
    if (isRepoRoot(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function requireRepoRoot() {
  const root = findRepoRoot(process.cwd());
  if (!root) {
    throw new Error(
      "Not inside an egf repo (no decisions/, specs/, … or legacy nodes/ directory). Run 'egf init' first."
    );
  }
  return root;
}

module.exports = { ensureDir, writeIfMissing, copyIfMissing, findRepoRoot, requireRepoRoot };
