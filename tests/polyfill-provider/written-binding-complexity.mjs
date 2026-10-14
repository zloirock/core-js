// The reads of a binding written ever more often cost no more each. A read follows at most `MAX_FOLLOWED_WRITES` writes
// of one binding: past it the binding is not followed at all. The census follows every write, and what a binding's
// values hold it answers once per binding or per value set, not once per read. Each shape below writes one binding k
// times and reads it k times; every analysis a read asks walked all k writes once per read, so the work grew with k
// squared. Counted, not timed: reads of the `type` and the `start` of every node a write statement holds - the write,
// its target and its value - and every `Map#get` and `Array#push`, since a walk of what the census recorded per name
// reads no node, through the whole babel transform and through the detection the other leg runs, both methods. Twice
// the writes and reads must cost at most twice the count: it is linear in k on top of what the file costs anyway, so
// even a cheap walk of the writes per read shows as an excess
import { parse } from '@babel/parser';
import { transformFromAstSync } from '@babel/core';
import plugin from '../../packages/core-js-babel-plugin/index.js';
import { createEstreeAdapter, collectPrePassSites } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { collectFileCensus, walkAstNodes } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { createUsageHandlerCore } from '../../packages/core-js-polyfill-provider/detect-usage/visitors.js';
import { adapters, createChecker } from './harness.mjs';

const { checkTruthy, finish } = createChecker('written-binding-complexity');

const SHAPES = {
  'plain writes between the reads': k => [
    'let w = [0];',
    ...Array.from({ length: k }, (unused, i) => `w = [${ i }];\nw.at(${ i });`),
  ],
  'every read, then every write': k => [
    'let w = [0];',
    ...Array.from({ length: k }, (unused, i) => `w.at(${ i });`),
    ...Array.from({ length: k }, (unused, i) => `w = [${ i }];`),
  ],
  'guarded pattern writes of a static alias': k => [
    'let M;',
    ...Array.from({ length: k }, (unused, i) => `c && ({ Map: M } = globalThis);\nM.groupBy([${ i }], pick);`),
  ],
  // ... a presence test by a key no fold names asks the census for every constructor the binding may hold
  'presence tests by a key no fold names': k => [
    'let w = [0];',
    ...Array.from({ length: k }, (unused, i) => `w = [${ i }];\nexport const p${ i } = k${ i } in w && w.at(${ i });`),
  ],
  // ... and a static read through a proxy hop asks whether the binding may hold the realm, of every value its writes
  // select, and whether the read may run ahead of one of them
  'static reads through a proxy hop of a realm alias': k => [
    'let w = [0];',
    ...Array.from({ length: k }, (unused, i) => `({ self: w } = globalThis);\nw.Array.from([${ i }]);`),
  ],
  'static reads off a name its writes select constructors into': k => [
    'let w = [0];',
    ...Array.from({ length: k }, (unused, i) => `w.Array.from([${ i }]);`),
    ...Array.from({ length: k }, () => 'w = c ? Map : Set;'),
  ],
  'static reads off a redeclared name': k => [
    'var w = [0];',
    ...Array.from({ length: k }, (unused, i) => `var w = [${ i }];\nw.Array.from([${ i }], w.at(${ i }));`),
  ],
  'static reads off a name written with literals': k => [
    'let w = [0];',
    ...Array.from({ length: k }, (unused, i) => `w = [${ i }];\nw.Array.from([${ i }], w.at(${ i }));`),
  ],
  // ... and a construction asks which function of the file the name stands on
  'constructions through a written name': k => [
    'let w = [0];',
    ...Array.from({ length: k }, (unused, i) => `w = [${ i }];\nnew w(${ i }).at(0);`),
  ],
  // ... and a member write lands on every container the name may hold, which the census files once past a ceiling
  'member writes through a name written with fresh containers': k => [
    'var w;',
    ...Array.from({ length: k }, (unused, i) => `w = {};\nw.a${ i } = [${ i }];\nw.a${ i }.at(0);`),
  ],
  // ... and the mutation census asks what each member write's receiver may hold, of every value its writes install
  'member writes through a nested container of a written name': k => [
    'var w;',
    ...Array.from({ length: k }, (unused, i) => `w = { n: {} };\nw.n.a${ i } = [${ i }];\nw.n.a${ i }.at(0);`),
  ],
  'member writes through a name a pattern writes': k => [
    'let w = [0];',
    ...Array.from({ length: k }, (unused, i) => `({ a: w } = { a: [${ i }] });\nw.x${ i } = ${ i };\nw.at(${ i });`),
  ],
  // ... and every read of a constructor asks after each patch through an alias of it
  'member writes through a written static alias': k => [
    'let w = [0];',
    ...Array.from({ length: k }, (unused, i) => `w = c ? Map : Set;\nw.x${ i } = ${ i };\nw.groupBy([${ i }], g);`),
  ],
  // ... each from a scope of its own, which the census answers alike
  'member writes through a written static alias from blocks of their own': k => [
    'let w = [0];',
    ...Array.from({ length: k }, (unused, i) => `{\nw = c ? Map : Set;\nw.x${ i } = ${ i };\nw.groupBy([${ i }], g);\n}`),
  ],
  // ... and a read through a name only patterns write asks for the member paths it aliases
  'static reads through a realm alias only patterns write': k => [
    'let w;',
    ...Array.from({ length: k }, (unused, i) => `({ self: w } = globalThis);\nw.Array.from([${ i }]);`),
  ],
  // ... and through names bound to the statics, each written value a name the census follows in turn
  'member writes through a written alias of static aliases': k => [
    'const M = Map, S = Set;',
    'let w = [0];',
    ...Array.from({ length: k }, (unused, i) => `w = c ? M : S;\nw.x${ i } = ${ i };\nw.groupBy([${ i }], g);`),
  ],
  // ... and each written value a chain of static keys off a global, dotted or computed, spelled alike at every write
  'member writes through an alias written with member chains': k => [
    'let w = [0];',
    ...Array.from({ length: k }, (unused, i) => `w = c ? globalThis.Map : self['Set'];\nw.x${ i } = ${ i };\nw.groupBy([${ i }], g);`),
  ],
};
const SIZES = [128, 256, 512];

// every `Map#get` and `Array#push` `measure` makes counts too: it runs synchronously, so no other suite of the
// runner runs inside it
const COUNTED_OPERATIONS = [[Map.prototype, 'get'], [Array.prototype, 'push']];
function measure(counter, run) {
  const originals = COUNTED_OPERATIONS.map(([prototype, key]) => prototype[key]);
  COUNTED_OPERATIONS.forEach(([prototype, key], at) => {
    prototype[key] = function (...args) {
      counter.reads++;
      return originals[at].apply(this, args);
    };
  });
  try {
    return run();
  } finally {
    COUNTED_OPERATIONS.forEach(([prototype, key], at) => {
      prototype[key] = originals[at];
    });
  }
}

// every node a write statement - an assignment or a declaration - holds counts the reads of its `type` and `start`
function countWriteReads(program) {
  const counter = { reads: 0 };
  for (const statement of program.body) {
    const { expression } = statement;
    let write = expression?.type === 'LogicalExpression' ? expression.right : expression;
    while (write?.type === 'ParenthesizedExpression') write = write.expression;
    if (write?.type !== 'AssignmentExpression' && statement.type !== 'VariableDeclaration') continue;
    walkAstNodes({ root: statement, visit(node) {
      for (const key of ['type', 'start']) {
        const value = node[key];
        Object.defineProperty(node, key, { configurable: true, get() {
          counter.reads++;
          return value;
        } });
      }
    } });
  }
  return counter;
}

function babelReads(code, method) {
  const ast = parse(code, { sourceType: 'module' });
  const counter = countWriteReads(ast.program);
  // eslint-disable-next-line node/no-sync -- the counted window must not yield, or another suite runs inside it
  const { code: out } = measure(counter, () => transformFromAstSync(ast, code, {
    plugins: [[plugin, { method, version: '4.0', targets: { ie: 11 } }]],
    cloneInputAst: false,
    configFile: false,
    babelrc: false,
    filename: 'input.mjs',
  }));
  return { reads: counter.reads, injected: /import /.test(out) };
}

// every global the rows read is served by the build, as the detection's own tests serve it
function resolvePure(meta) {
  return { kind: meta.kind === 'global' ? 'global' : 'static' };
}

function estreeReads(code, method) {
  const parser = adapters.find(each => each.name !== 'babel');
  const program = parser.parseAndScope(code);
  const counter = countWriteReads(program.node);
  const paths = parser.collectPaths(program, 'MemberExpression');
  let claims = 0;
  measure(counter, () => {
    let mutated = null;
    const adapter = createEstreeAdapter({ method, resolvePure, getMutatedStatics: () => mutated });
    if (method === 'usage-pure') {
      const census = collectFileCensus(program.node, [mutationShapesReducer()]);
      ({ mutated } = collectPrePassSites({ ast: program.node, adapter, census, collectMutations: true }));
    }
    const core = createUsageHandlerCore({ adapter, method, resolvePure, onUsage() { claims++; } });
    for (const path of paths) core.emitMemberUsage(path);
  });
  return { reads: counter.reads, injected: claims > 0 };
}

for (const [shape, lines] of Object.entries(SHAPES)) for (const method of ['usage-pure', 'usage-global']) {
  for (const [leg, reads] of [['babel transform', babelReads], ['estree detection', estreeReads]]) {
    const counts = [];
    for (const k of SIZES) {
      const { reads: count, injected } = reads(lines(k).join('\n'), method);
      checkTruthy(`${ leg }/${ method }/${ shape }/${ k }: the reads claim`, injected);
      // a count of nothing would pass any ratio: the writes have to be read at all
      checkTruthy(`${ leg }/${ method }/${ shape }/${ k }: the writes are read`, count > 0, `${ count } reads`);
      counts.push(count);
    }
    for (let i = 1; i < SIZES.length; i++) {
      const ratio = counts[i] / counts[i - 1];
      checkTruthy(`${ leg }/${ method }/${ shape }: ${ SIZES[i - 1] } -> ${ SIZES[i] } writes and reads grow the reads `
        + `${ ratio.toFixed(4) }x, at most 2x`, ratio <= 2, counts.join(' -> '));
    }
  }
}

finish();
