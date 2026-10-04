// A spread owns its property/iterator reads. The discard and placement decisions must
// agree on that evaluation while quiet literals retain the ordinary lifted-slot route.
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

finish();
