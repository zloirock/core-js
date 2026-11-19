// A residual value preserves a sealed read before considering the leaf's definedness.
// Source queries stay pure, including when no host eventually accepts their answer.
import {
  chainSealsAShortCircuit,
  directClaimProbePlan,
  discardedInitProbePlan,
  probedNavGuardValuePlan,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { hostSlot, hostSlotNode, renderClaimProbe } from '../../packages/core-js-polyfill-provider/render.js';
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
  const nativeLeaf = leaf === 'Array' && findNode(built, node => node.type === 'MemberExpression' && node.optional);
  if (leaf === 'Array') {
    check(`${ label }/sealed native optional`, built.type, 'ChainExpression');
    checkTruthy(`${ label }/native read short circuits`, nativeLeaf);
    check(`${ label }/native leaf uses the tested receiver`, hostSlotNode(nativeLeaf.object).property?.name, 'window');
    const key = nativeLeaf.computed ? nativeLeaf.property.expressions.at(-1).value : nativeLeaf.property.name;
    check(`${ label }/native property name`, key, 'Array');
  } else if (leaf) {
    checkTruthy(`${ label }/short circuit`, conditional);
    check(`${ label }/absent value`, conditional.consequent.operator, 'void');
    checkTruthy(`${ label }/present leaf`, findNode(conditional.alternate,
      node => node.type === 'Identifier' && node.name === leaf));
  } else {
    const read = hostSlotNode(built);
    check(`${ label }/plain source has no optional test`, conditional, null);
    check(`${ label }/one direct read`, read.type, 'MemberExpression');
    check(`${ label }/original property`, read.property?.name, 'window');
    check(`${ label }/served root`, read.object?.name, '_globalThis');
  }
  checkTruthy(`${ label }/root substituted`, imports.includes('globalThis'));
  check(`${ label }/render purity`, JSON.stringify(source), before);
  if (expression.includes('effect')) {
    check(`${ label }/leaf effect`, plan.alternateEffects.length, 1);
    check(`${ label }/effect stays after guard`, (nativeLeaf ? nativeLeaf.property : conditional.alternate).type, 'SequenceExpression');
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
runBoth('excluded realm leaf', 'const value = globalThis.window?.self;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  function resolveExcluded(meta) {
    return meta.name === 'self' ? null : resolvePure(meta);
  }
  const plan = probedNavGuardValuePlan(path.node.init, resolveExcluded, { scope: path.scope, adapter, path });
  check(`${ label }/read stays on the realm`, plan.leafPlan.leafBasePure.entry, 'globalThis');
  check(`${ label }/exclusion is not an unbacked hop`, plan.foldLeafOntoBase, false);
  const built = renderClaimProbe(plan, { embed: hostSlot, injectImport: (entry, hint) => `_${ hint }` });
  const conditional = findNode(built, node => node.type === 'ConditionalExpression');
  check(`${ label }/missing property does not become a missing binding`, conditional.alternate.type, 'MemberExpression');
  check(`${ label }/raw excluded property`, conditional.alternate.property.name, 'self');
});
for (const [left, throws] of [
  ['(globalThis.window?.self).Array', true],
  ['(globalThis.window?.self)?.Array', false],
  ['((globalThis.window?.self).Array)?.from', true],
]) runBoth(`fallback seal/${ left }`, `const value = ${ left } ?? {};`, (parser, program, label) => {
  const path = parser.pickPath(program, 'LogicalExpression');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  check(`${ label }/throws before the fallback`,
    chainSealsAShortCircuit(path.node.left, resolvePure, { scope: path.scope, path, adapter }), throws);
});

finish();
