// A reaching assignment reads names in the write's lexical scope. Shared lexical hosts keep the
// declaration's lookup valid; shadows on either side prevent resolving through the wrong source.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { reachingReassignmentValueNode } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkTruthy, finish } = createChecker('reassigned-alias-lexical-scopes');

const local = 'let holder = {}; const source = { x: Array }; holder = source; observe(holder);';
const rows = [
  { name: 'program scope', code: local, expected: 'source' },
  { name: 'function body', code: `function run() { ${ local } }`, expected: 'source' },
  { name: 'callback body', code: `test(function () { ${ local } });`, expected: 'source' },
  { name: 'shared nested block', code: `function run() { { ${ local } } }`, expected: 'source' },
  {
    name: 'unshadowed write in a nested block',
    code: 'function run() { let holder = {}; const source = { x: Array };'
      + '{ holder = source; } observe(holder); }',
    expected: 'source',
  },
  {
    name: 'shared block above a deeper write',
    code: 'function run() { { let holder = {}; const source = { x: Array };'
      + '{ holder = source; } observe(holder); } }',
    expected: 'source',
  },
  {
    name: 'nested declaration without a source shadow',
    code: 'function run() { const source = { x: Array }; { var holder = {}; }'
      + 'holder = source; observe(holder); }',
    expected: 'source',
  },
  {
    name: 'source shadow around the write',
    code: 'function run() { const source = { x: Array }; let holder = {};'
      + '{ const source = { x: Number }; holder = source; } observe(holder); }',
    expected: null,
  },
  {
    name: 'source shadow around the original var declaration',
    code: 'function run() { const source = { x: Number };'
      + '{ const source = { x: Array }; var holder = {}; } holder = source; observe(holder); }',
    expected: null,
  },
  {
    name: 'distinct source shadows in sibling blocks',
    code: 'function run() { { const source = { x: Array }; var holder = {}; }'
      + '{ const source = { x: Number }; holder = source; } observe(holder); }',
    expected: null,
  },
  {
    name: 'unrelated local name does not shadow the RHS',
    code: 'function run() { const source = { x: Array }; let holder = {};'
      + '{ const unrelated = 0; holder = source; } observe(holder); }',
    expected: 'source',
  },
  {
    name: 'catch parameter around the write',
    code: 'function run() { const source = { x: Array }; let holder = {};'
      + 'try { work(); } catch (source) { holder = source; } observe(holder); }',
    expected: null,
  },
  {
    name: 'catch parameter around the original var declaration',
    code: 'function run() { const source = { x: Number };'
      + 'try { work(); } catch (source) { var holder = {}; } holder = source; observe(holder); }',
    expected: null,
  },
  {
    name: 'loop head around the original var declaration',
    code: 'function run() { const source = { x: Number };'
      + 'for (const source of sources) { var holder = {}; } holder = source; observe(holder); }',
    expected: null,
  },
];

let checked = 0;
for (const adapter of adapters) {
  const bindings = adapter.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' })
    : createEstreeAdapter({ method: 'usage-pure' });
  for (const row of rows) {
    const program = adapter.parseAndScope(row.code);
    const usagePath = adapter.pickPath(program, 'CallExpression', candidate => candidate.node.callee?.name === 'observe');
    checkTruthy(`${ adapter.name }: ${ row.name }: usage path`, usagePath);
    const binding = bindings.getBinding(usagePath.scope, 'holder', usagePath);
    checkTruthy(`${ adapter.name }: ${ row.name }: holder binding`, binding);
    const reaching = reachingReassignmentValueNode({ binding, usagePath });
    check(`${ adapter.name }: ${ row.name }: reaching RHS`, reaching?.name ?? null, row.expected);
    checked += 3;
  }
}
check('all rows were checked', checked, adapters.length * rows.length * 3);
check('the suite keeps its coverage floor', checked >= 84, true);
finish();
