// A file without a pure source must not expand every alias to rediscover that absence.
// Count input reads, not time: four times as many written aliases stays linear.
import { adapters, createChecker } from './harness.mjs';
import { collectFileCensus, walkAstChildren } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { escapedCtorReferencesReducer, mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, checkTruthy, finish } = createChecker('census-import-work');

// Count field reads while the census follows local writes, with either reducer order.
function aliasReads(parser, prefix, size, reverse) {
  const aliases = Array.from({ length: size }, (_, index) => `const a${ index } = ${ index ? `a${ index - 1 }` : 'first' }; holder.value = a${ index };`).join('\n');
  const program = parser.parseAndScope(`${ prefix } const first = {}, holder = {};\n${ aliases }`).node;
  const work = [program];
  let reads = 0;
  while (work.length) {
    const node = work.pop();
    walkAstChildren(node, child => work.push(child));
    if (node.type !== 'Identifier') continue;
    const { name } = node;
    Object.defineProperty(node, 'name', { configurable: true, get() {
      reads++;
      return name;
    } });
  }
  const reducers = [mutationShapesReducer(null), escapedCtorReferencesReducer()];
  const { mutationRoots } = collectFileCensus(program, reverse ? reducers.reverse() : reducers);
  const label = `${ parser.name }/${ prefix }/${ reverse }/${ size }`;
  check(`${ label }: no builtin writes`, mutationRoots.names.size, 0);
  check(`${ label }: no unknown write target`, mutationRoots.open, false);
  checkTruthy(`${ label }: counter is live`, reads > size);
  return reads;
}

for (const parser of adapters) for (const prefix of ['', 'import unrelated from "elsewhere";', 'require("elsewhere");']) {
  for (const reverse of [false, true]) {
    const counts = [16, 64].map(size => aliasReads(parser, prefix, size, reverse));
    checkTruthy(`${ parser.name }/${ prefix }/${ reverse }: alias reads grow linearly`, counts[1] <= counts[0] * 5);
  }
}

// A real pure invoker keeps the constructor in the known callee. An unknown
// invoker hands it out. Keep import/require availability separate from binding proof.
for (const parser of adapters) for (const pkg of ['@core-js/pure', 'my-pure']) {
  const path = `${ pkg }/actual/reflect/apply`;
  for (const [prefix, call, suffix = '', escaped = false] of [
    [`import invoke from '${ path }';`, 'invoke'],
    [`import { default as invoke } from '${ path }';`, 'invoke'],
    [`import invoke = require('${ path }');`, 'invoke'],
    [`const invoke = require('${ path }'); const alias = invoke;`, 'alias'],
    [`function run() { const invoke = (0, require)('${ path }');`, 'invoke', '} run();'],
    [`function run() { const invoke = require?.(\`${ path }\`);`, 'invoke', '} run();'],
    [`var invoke = _interopRequireDefault(require('${ path }'));`, 'invoke.default'],
    ['', 'unknown', '', true],
    [`import invoke from '${ path }'; function run(invoke) {`, 'invoke', '} run(unknown);', true],
  ]) for (const reverse of [false, true]) {
    const source = `function read(value) { return value.groupBy; } ${ prefix } ${ call }(read, null, [Map]); ${ suffix }`;
    const program = parser.parseAndScope(source).node;
    const reducers = [mutationShapesReducer(null), escapedCtorReferencesReducer({ packages: [pkg] })];
    const { escapedCtorNames } = collectFileCensus(program, reverse ? reducers.reverse() : reducers);
    const label = `${ parser.name }/${ prefix }/${ reverse }`;
    check(`${ label }: global escape`, escapedCtorNames.has('Map'), escaped);
    check(`${ label }: pure escape`, escapedCtorNames.has('Map', true), escaped);
  }
}

// Census-local availability cannot survive into another package configuration or file.
for (const parser of adapters) {
  const source = 'import invoke from "my-pure/actual/reflect/apply";'
    + ' function read(value) { return value.groupBy; } invoke(read, null, [Map]);';
  const program = parser.parseAndScope(source).node;
  for (const enabled of [false, true, false]) {
    const reducers = [mutationShapesReducer(null), escapedCtorReferencesReducer({ packages: enabled ? ['my-pure'] : [] })];
    const { escapedCtorNames } = collectFileCensus(program, reducers);
    check(`${ parser.name }: reused AST, package enabled ${ enabled }`, escapedCtorNames.has('Map'), !enabled);
  }
  const empty = parser.parseAndScope('').node;
  const { escapedCtorNames } = collectFileCensus(empty, [mutationShapesReducer(null), escapedCtorReferencesReducer()]);
  check(`${ parser.name }: next empty file`, escapedCtorNames.has('Map'), false);
}

finish();
