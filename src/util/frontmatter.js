'use strict';

// Tiny YAML frontmatter parser — handles the subset egf actually emits:
//   key: value
//   key: "quoted value"
//   key: [a, b, c]
//   key:
//     - to: N005
//       type: contradicts
//       note: "x"
// Returns { data, body }. Not a general YAML parser — keep templates simple.

function parse(content) {
  if (!content.startsWith('---\n')) return { data: {}, body: content };
  const end = content.indexOf('\n---', 4);
  if (end === -1) return { data: {}, body: content };
  const fmRaw = content.slice(4, end);
  const body = content.slice(end + 4).replace(/^\n/, '');
  const data = parseBlock(fmRaw.split('\n'));
  return { data, body };
}

function parseBlock(lines) {
  const out = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!m) { i++; continue; }
    const key = m[1];
    const rest = m[2];
    if (rest === '' || rest === undefined) {
      // either an inline-empty (treat as null) or a nested block follows
      const items = [];
      let j = i + 1;
      while (j < lines.length && /^\s+-\s/.test(lines[j])) {
        // collect one list item: lines starting with '  - ' or deeper indent until next sibling
        const itemLines = [lines[j]];
        let k = j + 1;
        while (k < lines.length && /^\s{4,}\S/.test(lines[k])) {
          itemLines.push(lines[k]);
          k++;
        }
        items.push(parseListItem(itemLines));
        j = k;
      }
      if (items.length) {
        out[key] = items;
        i = j;
      } else {
        out[key] = null;
        i++;
      }
    } else {
      out[key] = parseScalar(rest);
      i++;
    }
  }
  return out;
}

function parseListItem(lines) {
  // first line: "  - key: value"
  const first = lines[0].replace(/^\s+-\s*/, '');
  const obj = {};
  const m = first.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
  if (m) obj[m[1]] = parseScalar(m[2]);
  for (let i = 1; i < lines.length; i++) {
    const m2 = lines[i].match(/^\s+([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (m2) obj[m2[1]] = parseScalar(m2[2]);
  }
  return obj;
}

function parseScalar(s) {
  s = s.trim();
  if (s === '' || s === '~' || s.toLowerCase() === 'null') return null;
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1);
  if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1);
  if (s.startsWith('[') && s.endsWith(']')) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map(x => parseScalar(x));
  }
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
  return s;
}

module.exports = { parse };
