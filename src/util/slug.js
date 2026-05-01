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

function nextId(dir, prefix) {
  const fs = require('fs');
  if (!fs.existsSync(dir)) return `${prefix}001`;
  const re = new RegExp(`^${prefix}(\\d+)`);
  const ids = fs
    .readdirSync(dir)
    .map(f => f.match(re))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  const next = (ids.length ? Math.max(...ids) : 0) + 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = { slugify, nextId, today };
