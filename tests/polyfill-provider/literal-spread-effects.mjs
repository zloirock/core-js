// A spread owns its property/iterator reads. The discard and placement decisions must
// agree on that evaluation while quiet literals retain the ordinary lifted-slot route,
// and the husk they leave is dead only once every leaf it binds is a minted sentinel.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  discardRescueNodesWithReads,
  residualHuskIsDead,
  residualInitRunsEffects,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { createChecker } from './harness.mjs';

const { check, finish, runBoth } = createChecker('literal-spread-effects');

for (const [name, init, runs, rescues] of [
  ['object spread', '{ ...extra, w: _ref }', true, true],
  ['array spread', '[...extra, _ref]', true, true],
  ['quiet object', '{ w: _ref }', false, false],
  ['quiet array', '[_ref]', false, false],
  ['object slot effect', '{ w: effect() }', false, true],
]) {
  runBoth(name, `const { w: _unused } = ${ init };`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' }) : createEstreeAdapter({ method: 'usage-pure' });
    const ctx = { scope: path.scope, adapter, path };
    const rescued = discardRescueNodesWithReads({ node: path.node.init, ...ctx });
    check(`${ label }/placement`, residualInitRunsEffects({ init: path.node.init, ...ctx }), runs);
    check(`${ label }/rescue`, rescued.length > 0, rescues);
    if (runs) check(`${ label }/whole spread`, rescued[0], path.node.init);
    check(`${ label }/husk`, residualHuskIsDead({
      pattern: path.node.id, init: path.node.init, isSentinel: node => node.name === '_unused', ...ctx,
    }), !rescues);
  });
}

// the pattern half of the husk: a live user name - at any level - or a rest keeps it, in both dialects
// (babel spells a destructure property `ObjectProperty`, estree `Property`: a walk blind to one of them
// dropped a live user binding with the residual)
for (const [name, pattern, dead] of [
  ['live name', '{ at: kept }', false],
  ['all sentinels', '{ at: _unused, keys: _unused2 }', true],
  ['nested live name', '{ inner: { at: kept } }', false],
  ['nested sentinel', '{ inner: { at: _unused } }', true],
  ['rest beside a sentinel', '{ at: _unused, ...rest }', false],
]) {
  runBoth(`husk pattern/${ name }`, `const ${ pattern } = quiet;`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' }) : createEstreeAdapter({ method: 'usage-pure' });
    check(label, residualHuskIsDead({
      pattern: path.node.id, init: path.node.init, isSentinel: node => node.name.startsWith('_unused'), scope: path.scope, adapter, path,
    }), dead);
  });
}

finish();
