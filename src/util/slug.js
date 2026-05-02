'use strict';

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function nextId(dirOrDirs, prefix) {
  const fs = require('fs');
  const dirs = Array.isArray(dirOrDirs) ? dirOrDirs : [dirOrDirs];
  const re = new RegExp(`^${prefix}(\\d+)`);
  const ids = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const m = f.match(re);
      if (m) ids.push(parseInt(m[1], 10));
    }
  }
  const next = (ids.length ? Math.max(...ids) : 0) + 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = { slugify, nextId, today };
