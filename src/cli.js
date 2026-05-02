'use strict';

const path = require('path');
const fs = require('fs');

const init = require('./commands/init');
const node = require('./commands/node');
const list = require('./commands/list');
const project = require('./commands/project');
const show = require('./commands/show');
const validate = require('./commands/validate');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const HELP = `egf — Engineering-Graph Framework CLI (v${pkg.version})

Usage:
  egf init                              Scaffold default folder structure in CWD
  egf node new <type> "<title>"         Create a new node (written to <type>s/ folder)
  egf list [nodes|<type-plural>|inbox]  List entries: 'nodes' = all; or one of decisions,
                                        specs, observations, hypotheses, assumptions,
                                        measurements, risks, capabilities (default: nodes)
  egf show <node-id>                    Show a single node: frontmatter, resolved edges, body
  egf project                           Print a one-screen overview of the graph
  egf project <node-id>                 Project a subgraph from <node-id>, topo-sorted (prereqs first)
  egf validate                          Check all node files against the schema
  egf --help                            Show this help
  egf --version                         Show version

Node types → folders:
  observation→observations/   hypothesis→hypotheses/   assumption→assumptions/
  decision→decisions/         spec→specs/              measurement→measurements/
  risk→risks/                 capability→capabilities/

Examples:
  egf init
  egf node new hypothesis "tenant_id index closes p99 gap"
  egf node new decision "Java/Spring für Server"
  egf list nodes
  egf list decisions
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
      case 'show':
        return show(rest);
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
