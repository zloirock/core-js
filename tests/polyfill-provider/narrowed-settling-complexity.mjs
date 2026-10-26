// A guard's settling asked inside a question that narrows decisions keeps its answer for asks in that same
// context (`decidedGuards`): the census pre-pass resolves a constructor alias a guarded write may replace at every
// mutation site through it, and a fallback off such an alias walks it inside a decision-root lookup. count the
// guard decisions (`adapter.settledSelection`) the detection takes over k such asks and over 2k, both parsers,
// both methods: settled once per context, the count does not grow with the asks - settled afresh, it doubles
import { collectPrePassSites as collectBabelPrePassSites, createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { collectPrePassSites, createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  collectFileCensus, refuseReentry, withReentrantQuestion, writeNeverRuns,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { createUsageHandlerCore } from '../../packages/core-js-polyfill-provider/detect-usage/visitors.js';
import { adapters, createChecker, resolvePure } from './harness.mjs';

const { check, checkTruthy, finish } = createChecker('narrowed-settling-complexity');

function lines(count, line) {
  return Array.from({ length: count }, (unused, index) => line(index)).join('\n');
}

const SHAPES = {
  'census pre-pass': count => `let C = Array;\nif (typeof Symbol == 'undefined') C = Shim;\n${ lines(count, index => `C.a${ index } = ${ index };`) }`,
  'known member lookup': count => `let C = Array;\nif (typeof Symbol == 'undefined') C = Shim;\n${ lines(count, index => `C.from = ${ index };`) }`,
  'decision-root lookup': count => `let P = Promise;\nif (typeof Symbol == 'undefined') P = Shim;\n${
    lines(count, index => `export const a${ index } = P || Fallback${ index };`) }`,
};

// the guard decisions detecting a shape with `count` asks takes: the census pre-pass (pure), then every member
// read and every fallback's decision
function decisions(parser, shape, count, method) {
  const program = parser.parseAndScope(SHAPES[shape](count));
  let mutated = null;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method, resolvePure, getMutatedStatics: () => mutated,
  });
  let settled = 0;
  const { settledSelection } = adapter;
  adapter.settledSelection = function (...args) {
    settled++;
    return settledSelection.apply(this, args);
  };
  if (method === 'usage-pure') {
    const census = collectFileCensus(program.node, [mutationShapesReducer()]);
    mutated = (parser.name === 'babel'
      ? collectBabelPrePassSites(program, adapter, census)
      : collectPrePassSites({ ast: program.node, adapter, census, collectMutations: true })).mutated;
  }
  const core = createUsageHandlerCore({ adapter, method, resolvePure, onUsage() { /* the decisions alone are counted */ } });
  for (const path of parser.collectPaths(program, 'MemberExpression')) core.emitMemberUsage(path);
  for (const path of parser.collectPaths(program, 'LogicalExpression')) {
    adapter.decidedSelection(path.node, { scope: path.scope, adapter, path });
  }
  return settled;
}

for (const parser of adapters) for (const shape of Object.keys(SHAPES)) for (const method of ['usage-pure', 'usage-global']) {
  const label = `${ parser.name }/${ shape }/${ method }`;
  const short = decisions(parser, shape, 4, method);
  checkTruthy(`${ label }/the guard is settled`, short > 0, `${ short } decisions`);
  check(`${ label }/twice the asks settle it no more`, decisions(parser, shape, 8, method), short);
}

// ... and in it alone: the plain context and that of each kind of question in flight settle a write of their
// own - save an answer a refused lookup re-entry narrowed, which hangs on which lookup refused, a lookup the context
// does not name: under a lookup in flight it settles afresh, while one no refusal narrowed answers from the table
function settlingProbe(parser) {
  const program = parser.parseAndScope("let K = '@@iterator';\nif (typeof Symbol != 'undefined') K = Symbol.iterator;\nexport const read = list[K];");
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', resolvePure });
  const read = parser.pickPath(program, 'MemberExpression', path => path.node.object.name === 'list');
  const write = parser.pickPath(program, 'AssignmentExpression').node;
  const probe = { settled: 0, refuses: false };
  const { settledSelection } = adapter;
  adapter.settledSelection = function (...args) {
    probe.settled++;
    if (probe.refuses) refuseReentry();
    return settledSelection.apply(this, args);
  };
  function question() {
    return writeNeverRuns({ write, usagePath: read, adapter });
  }
  // the write's never-run answer, asked in the plain context or under a question in flight of `kind`
  probe.ask = function (kind) {
    return kind ? withReentrantQuestion(question, kind) : question();
  };
  return probe;
}

for (const parser of adapters) {
  const contexts = settlingProbe(parser);
  for (const kind of [null, 'census', 'root', 'lookup']) {
    const before = contexts.settled;
    contexts.ask(kind);
    contexts.ask(kind);
    check(`${ parser.name }/${ kind ?? 'plain' } context settles the write once`, contexts.settled - before, 1);
  }
  const refused = settlingProbe(parser);
  refused.refuses = true;
  refused.ask('lookup');
  refused.ask('lookup');
  check(`${ parser.name }/an answer a refused re-entry narrowed settles afresh`, refused.settled, 2);
  refused.refuses = false;
  refused.ask('lookup');
  refused.ask('lookup');
  check(`${ parser.name }/one no refusal narrowed answers from the table`, refused.settled, 3);
}

finish();
