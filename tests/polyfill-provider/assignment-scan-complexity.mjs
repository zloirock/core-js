// A read takes the value the last assignment before it in its statement list installed, and that assignment is
// found among the statements holding a write of the binding - not by reading every statement back from the read.
// Each shape below reads one binding k times beside 64 writes, within the write ceiling, so every read asks; the
// k reads stand between the writes and each other, so reading back over every statement cost each read the reads
// before it, k squared in all. Counted, not timed: the reads of the `type` of every statement of the program,
// through the whole babel transform and through the detection the other leg runs, both methods. Twice the reads
// must cost at most twice the count
import { parse } from '@babel/parser';
import { transformFromAstSync, transformSync } from '@babel/core';
import plugin from '../../packages/core-js-babel-plugin/index.js';
import unplugin from '../../packages/core-js-unplugin/index.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createUsageHandlerCore } from '../../packages/core-js-polyfill-provider/detect-usage/visitors.js';
import { adapters, createChecker, resolvePure, scenarioSource } from './harness.mjs';

const { checkTruthy, finish } = createChecker('assignment-scan-complexity');

const WRITES = Array.from({ length: 64 }, (unused, i) => `w = [${ i }];`);
const SHAPES = {
  'reads between a guard and the writes': k => [
    'let w = [0];',
    "if (typeof w !== 'object') throw new Error('x');",
    ...Array.from({ length: k }, (unused, i) => `w.at(${ i });`),
    ...WRITES,
  ],
  'reads after the writes': k => [
    'let w = [0];',
    ...WRITES,
    ...Array.from({ length: k }, (unused, i) => `w.at(${ i });`),
  ],
};
const SIZES = [128, 256, 512];

// every statement of the program counts the reads of its `type`
function countStatementReads(program) {
  const counter = { reads: 0 };
  for (const statement of program.body) {
    const { type } = statement;
    Object.defineProperty(statement, 'type', { configurable: true, get() {
      counter.reads++;
      return type;
    } });
  }
  return counter;
}

function babelReads(code, method) {
  const ast = parse(code, { sourceType: 'module' });
  const counter = countStatementReads(ast.program);
  // eslint-disable-next-line node/no-sync -- the counted window must not yield, or another suite runs inside it
  const { code: out } = transformFromAstSync(ast, code, {
    plugins: [[plugin, { method, version: '4.0', targets: { ie: 11 } }]],
    cloneInputAst: false,
    configFile: false,
    babelrc: false,
    filename: 'input.mjs',
  });
  return { reads: counter.reads, injected: /import /.test(out) };
}

function estreeReads(code, method) {
  const parser = adapters.find(each => each.name !== 'babel');
  const program = parser.parseAndScope(code);
  const counter = countStatementReads(program.node);
  const paths = parser.collectPaths(program, 'MemberExpression');
  let claims = 0;
  const adapter = createEstreeAdapter({ method, resolvePure, getMutatedStatics: () => null });
  const core = createUsageHandlerCore({ adapter, method, resolvePure, onUsage() { claims++; } });
  for (const path of paths) core.emitMemberUsage(path);
  return { reads: counter.reads, injected: claims > 0 };
}

for (const [shape, lines] of Object.entries(SHAPES)) for (const method of ['usage-pure', 'usage-global']) {
  for (const [leg, reads] of [['babel transform', babelReads], ['estree detection', estreeReads]]) {
    const counts = [];
    for (const k of SIZES) {
      const { reads: count, injected } = reads(lines(k).join('\n'), method);
      checkTruthy(`${ leg }/${ method }/${ shape }/${ k }: the reads claim`, injected);
      // a count of nothing would pass any ratio: the statements have to be read at all
      checkTruthy(`${ leg }/${ method }/${ shape }/${ k }: the statements are read`, count > 0, `${ count } reads`);
      counts.push(count);
    }
    for (let i = 1; i < SIZES.length; i++) {
      const ratio = counts[i] / counts[i - 1];
      checkTruthy(`${ leg }/${ method }/${ shape }: ${ SIZES[i - 1] } -> ${ SIZES[i] } reads grow the statement reads `
        + `${ ratio.toFixed(4) }x, at most 2x`, ratio <= 2, counts.join(' -> '));
    }
  }
}

// Exercise the PUBLIC pipelines too. A handler-only test could otherwise pass with a
// callback real usage-global consumers do not supply, leaving the numeric gate unreachable.
for (const host of ['babel', 'unplugin']) for (const size of [32, 128]) {
  const code = scenarioSource(`function f(receiverMarker, i) { ${ 'receiverMarker[i >> 2];'.repeat(size) } return Map; }`);
  const options = { method: 'usage-global', version: '4.0', targets: { ie: 11 } };
  const stages = host === 'unplugin' ? unplugin.raw({ ...options, phase: 'pre' }, { framework: 'vite' }) : null;
  const original = Map.prototype.get;
  let lookups = 0;
  let output;
  try {
    // eslint-disable-next-line no-extend-native -- Count only the synchronous transform; restore in finally.
    Map.prototype.get = function (key) {
      if (key === 'receiverMarker' || typeof key === 'string' && key.startsWith('receiverMarker\u0000')) lookups++;
      return original.call(this, key);
    };
    new Map([['receiverMarker', 1]]).get('receiverMarker');
    checkTruthy(`${ host }/key admission/${ size }/counter control`, lookups === 1);
    lookups = 0;
    if (host === 'babel') {
      // eslint-disable-next-line node/no-sync -- The counted window must not yield.
      output = transformSync(code, { plugins: [[plugin, options]], configFile: false, babelrc: false, filename: '/input.js' }).code;
    } else {
      output = code;
      for (const stage of stages) output = stage.transform?.(output, '/input.js')?.code ?? output;
    }
  } finally {
    // eslint-disable-next-line no-extend-native -- Restore the exact original lookup.
    Map.prototype.get = original;
  }
  stages?.at(-1).buildEnd();
  checkTruthy(`${ host }/key admission/${ size }/injection control`, output.includes('core-js/modules/es.map.'));
  checkTruthy(`${ host }/key admission/${ size }/receiver lookup budget`, lookups > size && lookups <= 15 * size, `${ lookups } lookups`);
}

finish();
