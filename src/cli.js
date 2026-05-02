'use strict';

const path = require('path');
const fs = require('fs');

const init = require('./commands/init');
const node = require('./commands/node');
const list = require('./commands/list');
const project = require('./commands/project');
const validate = require('./commands/validate');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const HELP = `egf — Engineering-Graph Framework CLI (v${pkg.version})

Usage:
  egf init                              Scaffold default folder structure in CWD
  egf node new <type> "<title>"         Create a new node
  egf list [nodes|capabilities|inbox]   List existing entries (default: nodes)
  egf project                           Print a one-screen overview of the graph
  egf validate                          Check all node files against the schema
  egf --help                            Show this help
  egf --version                         Show version

Node types:
  observation, hypothesis, assumption, decision, spec, measurement, risk, capability

Examples:
  egf init
  egf node new hypothesis "tenant_id index closes p99 gap"
  egf node new capability "k6 load tester"
  egf list nodes
  egf list capabilities
`;

function run(argv) {
  const [cmd, ...rest] = argv;
  try {
    switch (cmd) {
      case undefined:
      case '-h':
      case '--help':
      case 'help':
        console.log(HELP);
        return;
      case '-v':
      case '--version':
        console.log(pkg.version);
        return;
      case 'init':
        return init(rest);
      case 'node':
        return node(rest);
      case 'list':
        return list(rest);
      case 'project':
        return project(rest);
      case 'validate':
        return validate(rest);
      default:
        console.error(`Unknown command: ${cmd}\n`);
        console.error(HELP);
        process.exit(1);
    }
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { run };
