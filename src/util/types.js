'use strict';

const NODE_TYPES = [
  'observation',
  'hypothesis',
  'assumption',
  'decision',
  'spec',
  'measurement',
  'risk',
  'capability',
];

const TYPE_DIR = {
  observation: 'observations',
  hypothesis: 'hypotheses',
  assumption: 'assumptions',
  decision: 'decisions',
  spec: 'specs',
  measurement: 'measurements',
  risk: 'risks',
  capability: 'capabilities',
};

const TYPE_DIRS = Object.values(TYPE_DIR);
const LEGACY_NODES_DIR = 'nodes';
const ALL_NODE_DIRS = [LEGACY_NODES_DIR, ...TYPE_DIRS];

function dirForType(type) {
  return TYPE_DIR[type] || null;
}

function isTypeDir(name) {
  return TYPE_DIRS.includes(name);
}

module.exports = {
  NODE_TYPES,
  TYPE_DIR,
  TYPE_DIRS,
  LEGACY_NODES_DIR,
  ALL_NODE_DIRS,
  dirForType,
  isTypeDir,
};