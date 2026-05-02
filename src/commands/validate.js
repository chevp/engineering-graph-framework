'use strict';

const fs = require('fs');
const path = require('path');
const { requireRepoRoot } = require('../util/fsx');
const { parse } = require('../util/frontmatter');

const PLAN_TYPES = [
  'observation',
  'hypothesis',
  'assumption',
  'decision',
  'spec',
  'measurement',
  'risk',
];
const AGENT_TYPES = ['capability'];
const STATES = ['context', 'exploration', 'production', 'superseded', 'invalidated'];
const EDGE_TYPES = [
  'depends_on',
  'refines',
  'supersedes',
  'contradicts',
  'related_to',
  'produced_by',
  'evidence_for',
  'evidence_against',
];
const GATES = ['G1', 'G2', 'G3'];

// minimum gates_passed implied by state — invalidated has none (can hit at any stage)
const STATE_GATES = {
  context: [],
  exploration: ['G1'],
  production: ['G1', 'G2'],
  superseded: ['G1', 'G2', 'G3'],
  invalidated: [],
};

function readDir(dir, graph) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .map(f => ({ file: f, full: path.join(dir, f), graph }));
}

function validateFrontmatter(data, ctx) {
  const errors = [];
  const warnings = [];
  const required = ['id', 'type', 'state', 'title', 'created', 'version', 'gates_passed', 'edges'];
  for (const k of required) {
    if (data[k] === undefined) errors.push(`${k}: required field missing`);
  }

  // id format + filename match
  const idRe = ctx.graph === 'plan' ? /^N\d+$/ : /^A\d+$/;
  if (data.id !== undefined) {
    if (typeof data.id !== 'string' || !idRe.test(data.id)) {
      errors.push(`id: must match ${idRe} (got: ${JSON.stringify(data.id)})`);
    } else if (!ctx.file.startsWith(data.id + '-') && ctx.file !== data.id + '.md') {
      errors.push(`id '${data.id}' does not match filename`);
    }
  }

  const validTypes = ctx.graph === 'plan' ? PLAN_TYPES : AGENT_TYPES;
  if (data.type !== undefined && !validTypes.includes(data.type)) {
    errors.push(`type: must be one of: ${validTypes.join(', ')} (got: ${JSON.stringify(data.type)})`);
  }

  if (data.state !== undefined && !STATES.includes(data.state)) {
    errors.push(`state: must be one of: ${STATES.join(', ')} (got: ${JSON.stringify(data.state)})`);
  }

  if (data.title !== undefined && (typeof data.title !== 'string' || data.title.trim() === '')) {
    errors.push('title: must be a non-empty string');
  }

  if (data.created !== undefined && (typeof data.created !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.created))) {
    errors.push(`created: must be ISO date YYYY-MM-DD (got: ${JSON.stringify(data.created)})`);
  }

  if (data.version !== undefined && (!Number.isInteger(data.version) || data.version < 1)) {
    errors.push(`version: must be positive integer (got: ${JSON.stringify(data.version)})`);
  }

  if (data.gates_passed !== undefined) {
    if (!Array.isArray(data.gates_passed)) {
      errors.push('gates_passed: must be array');
    } else {
      for (const g of data.gates_passed) {
        if (!GATES.includes(g)) {
          errors.push(`gates_passed: invalid gate '${g}' (valid: ${GATES.join(', ')})`);
        }
      }
      const order = data.gates_passed.map(g => GATES.indexOf(g)).filter(i => i >= 0);
      for (let i = 1; i < order.length; i++) {
        if (order[i] <= order[i - 1]) {
          errors.push('gates_passed: must be in ascending order');
          break;
        }
      }
      if (data.state && STATE_GATES[data.state]) {
        for (const g of STATE_GATES[data.state]) {
          if (!data.gates_passed.includes(g)) {
            warnings.push(`state=${data.state} but ${g} missing from gates_passed`);
          }
        }
      }
    }
  }

  if (data.edges !== undefined) {
    if (!Array.isArray(data.edges)) {
      errors.push('edges: must be array');
    } else {
      data.edges.forEach((e, i) => {
        if (typeof e !== 'object' || e === null) {
          errors.push(`edges[${i}]: must be object`);
          return;
        }
        if (typeof e.to !== 'string' || e.to.trim() === '') {
          errors.push(`edges[${i}].to: required, non-empty string`);
        }
        if (!EDGE_TYPES.includes(e.type)) {
          errors.push(`edges[${i}].type: must be one of: ${EDGE_TYPES.join(', ')} (got: ${JSON.stringify(e.type)})`);
        }
      });
    }
  }

  return { errors, warnings };
}

function resolveTarget(target, planIds, agentIds) {
  if (typeof target !== 'string') return { ok: false };
  let kind = null;
  let id = null;
  if (target.startsWith('plan:')) { kind = 'plan'; id = target.slice(5); }
  else if (target.startsWith('agent:')) { kind = 'agent'; id = target.slice(6); }
  else if (/^N\d+$/.test(target)) { kind = 'plan'; id = target; }
  else if (/^A\d+$/.test(target)) { kind = 'agent'; id = target; }
  else return { ok: false };
  const set = kind === 'plan' ? planIds : agentIds;
  return { ok: set.has(id), kind, id };
}

function validateCmd() {
  const root = requireRepoRoot();

  const files = [
    ...readDir(path.join(root, 'plan-graph', 'nodes'), 'plan'),
    ...readDir(path.join(root, 'plan-graph', 'inbox'), 'plan'),
    ...readDir(path.join(root, 'agent-graph', 'capabilities'), 'agent'),
  ];

  const parsed = [];
  const planIds = new Set();
  const agentIds = new Set();

  for (const f of files) {
    let data = {};
    let parseError = null;
    try {
      data = parse(fs.readFileSync(f.full, 'utf8')).data;
    } catch (err) {
      parseError = err.message;
    }
    const v = parseError
      ? { errors: [`frontmatter parse failed: ${parseError}`], warnings: [] }
      : validateFrontmatter(data, f);
    parsed.push({ ...f, data, errors: v.errors, warnings: v.warnings });
    if (typeof data.id === 'string') {
      if (f.graph === 'plan') planIds.add(data.id);
      else agentIds.add(data.id);
    }
  }

  // second pass: edge target resolution (needs all IDs)
  for (const p of parsed) {
    if (!Array.isArray(p.data.edges)) continue;
    p.data.edges.forEach((e, i) => {
      if (typeof e !== 'object' || e === null) return;
      if (typeof e.to !== 'string') return;
      const r = resolveTarget(e.to, planIds, agentIds);
      if (!r.ok) p.errors.push(`edges[${i}].to: target '${e.to}' not found`);
    });
  }

  let ok = 0;
  let warn = 0;
  let err = 0;

  console.log(`egf validate — ${files.length} file${files.length === 1 ? '' : 's'}`);
  console.log('');

  for (const p of parsed) {
    if (p.errors.length === 0 && p.warnings.length === 0) {
      ok++;
      continue;
    }
    if (p.errors.length > 0) err++;
    else warn++;
    const rel = path.relative(root, p.full);
    const tag = p.errors.length > 0 ? 'ERROR' : 'WARN ';
    console.log(`${tag} ${rel}`);
    for (const m of p.errors) console.log(`  ${m}`);
    for (const m of p.warnings) console.log(`  (warn) ${m}`);
    console.log('');
  }

  const w = `${warn} warning${warn === 1 ? '' : 's'}`;
  const e = `${err} error${err === 1 ? '' : 's'}`;
  console.log(`summary: ${files.length} files — ${ok} ok, ${w}, ${e}`);

  if (err > 0) process.exit(1);
}

module.exports = validateCmd;
