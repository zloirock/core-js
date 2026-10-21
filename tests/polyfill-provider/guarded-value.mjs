// A residual value preserves a sealed read before considering the leaf's definedness.
// Source queries stay pure, including when no host eventually accepts their answer.
import {
  directClaimProbePlan,
  discardedInitProbePlan,
  probedNavGuardValuePlan,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { hostSlot, renderClaimProbe } from '../../packages/core-js-polyfill-provider/render.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker, findNode } from './harness.mjs';

const { check, checkTruthy, finish, runBoth } = createChecker('guarded-value');
function resolvePure({ name }) {
  return ['globalThis', 'self', 'Map'].includes(name) ? { entry: name, hintName: name } : null;
}
for (const [expression, kind, leaf, boundary = false] of [
  ['globalThis.window?.self', 'nav', '_self'],
  ['globalThis.window?.Array', 'leaf', 'Array'],
  ['globalThis.window?.Map', 'leaf', '_Map'],
  ['globalThis.window', 'leaf', null],
  ['(globalThis.window?.self).Array', 'nav', '_self', true],
  ['globalThis.window?.[(effect(), "Array")]', 'leaf', 'Array'],
  ['unknown?.Array', null, null],
  ['globalThis.Array', null, null],
  ['globalThis.window?.["not-a-name"]', null, null],
  ['(held = globalThis.window?.self)', null, null],
]) runBoth(expression, `let held; const value = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const source = path.node.init;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, adapter, path };
  const before = JSON.stringify(source);
  const plan = probedNavGuardValuePlan(source, resolvePure, ctx);
  check(`${ label }/kind`, plan?.kind ?? null, kind);
  check(`${ label }/query purity`, JSON.stringify(source), before);
  if (!kind) return;
  check(`${ label }/boundary read`, !!plan.boundary.member, boundary);
  const imports = [];
  const built = renderClaimProbe(plan, {
    embed: hostSlot,
    injectImport(entry, hint) {
      imports.push(entry);
      return `_${ hint }`;
    },
  });
  const conditional = findNode(built, node => node.type === 'ConditionalExpression');
  checkTruthy(`${ label }/short circuit`, conditional);
  check(`${ label }/absent value`, conditional.consequent.operator, 'void');
  if (leaf) checkTruthy(`${ label }/present leaf`, findNode(conditional.alternate,
    node => node.type === 'Identifier' && node.name === leaf));
  else checkTruthy(`${ label }/probe value read again`, findNode(conditional.alternate,
    node => node.type === 'MemberExpression'));
  checkTruthy(`${ label }/root substituted`, imports.includes('globalThis'));
  check(`${ label }/render purity`, JSON.stringify(source), before);
  if (expression.includes('effect')) {
    check(`${ label }/leaf effect`, plan.alternateEffects.length, 1);
    check(`${ label }/effect stays after guard`, conditional.alternate.type, 'SequenceExpression');
  }
});
// A discarded value can fold the terminal realm hop; a sealed read must retain it.
for (const [expression, sealed] of [
  ['globalThis.window?.self.window', false],
  ['(globalThis.window?.self.window).Array', true],
]) runBoth(`base leaf/${ expression }`, `const value = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, adapter, path };
  const before = JSON.stringify(path.node.init);
  const plan = sealed ? directClaimProbePlan(path.node.init, resolvePure, ctx, { preserveRead: true })
    : discardedInitProbePlan(path.node.init, resolvePure, ctx);
  check(`${ label }/base entry`, plan.leafPlan.leafBasePure.entry, 'self');
  check(`${ label }/fold only the value`, plan.foldLeafOntoBase, !sealed);
  const built = renderClaimProbe(plan, { embed: hostSlot, injectImport: (entry, hint) => `_${ hint }` });
  const conditional = findNode(built, node => node.type === 'ConditionalExpression');
  check(`${ label }/terminal read`, conditional.alternate.type, sealed ? 'MemberExpression' : 'Identifier');
  check(`${ label }/source remains pristine`, JSON.stringify(path.node.init), before);
});
finish();
