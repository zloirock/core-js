// Navigation source decisions are pure across parsers. A retained tail belongs inside the
// guarded value, while stores and source children retain their original evaluation order.
import {
  guardedNavPassthroughPlan, navGuardSourcePlan, navGuardTestPlan,
  planProvenNavGuardCollapse, terminalNavCollapsePlan,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import {
  cloneNode, hostSlot, identifier, renderNavCollapseValue, renderNavGuardTest,
} from '../../packages/core-js-polyfill-provider/render.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker, findNode } from './harness.mjs';

const { check, checkTruthy, finish, runBoth } = createChecker('navigation-render');
function resolvePure({ name }) {
  return ['globalThis', 'self'].includes(name) ? { entry: name, hintName: name } : null;
}
function injectImport(entry, hint) {
  return `_${ hint }`;
}
for (const [expression, kind, tail] of [
  ['globalThis.self', 'bare', 0],
  ['(effect(), globalThis).self.window', 'sequence', 1],
  ['globalThis.window?.self.window', 'nested', 1],
  ['globalThis["window"]?.self["window"]', 'nested', 1],
  ['(held = globalThis).window?.self', 'nested', 0],
  ['(effect(), globalThis).window?.self.window', 'nested', 1],
]) runBoth(expression, `let held; const value = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const source = path.node.init;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, adapter, path };
  const before = JSON.stringify(source);
  const plan = planProvenNavGuardCollapse({ rootNode: source, ...ctx, resolvePure, allowSequenceRoot: true });
  check(`${ label }/kind`, plan?.kind, kind);
  check(`${ label }/tail`, plan.hops.length - plan.collapseIdx - 1, tail);
  const built = renderNavCollapseValue(plan, identifier('_self'), { cloneHost: node => hostSlot(cloneNode(node)) });
  check(`${ label }/value`, built.type, tail ? 'MemberExpression' : 'Identifier');
  if (tail) check(`${ label }/kept computed spelling`, built.computed, expression.endsWith('["window"]'));
  if (kind === 'nested') {
    const test = navGuardTestPlan(plan);
    checkTruthy(`${ label }/retained source or backed base`, !!test.source || !!test.base);
    const rendered = renderNavGuardTest(test, { injectImport, embed: hostSlot });
    checkTruthy(`${ label }/rendered test`, !!rendered);
    checkTruthy(`${ label }/substituted probe root`, !!findNode(rendered, node => node.type === 'Identifier' && node.name === '_globalThis'));
    if (plan.rootAssign) checkTruthy(`${ label }/kept write`, !!findNode(rendered, node => node.type === 'AssignmentExpression'));
    const read = terminalNavCollapsePlan(plan, { node: source, consumer: { type: 'MemberExpression', object: source } });
    check(`${ label }/reader retains terminal`, read === plan, true);
    const stored = terminalNavCollapsePlan(plan, { node: source, consumer: { type: 'AssignmentExpression', right: source } });
    check(`${ label }/store retains terminal`, stored === plan, true);
    const called = terminalNavCollapsePlan(plan, { node: source, consumer: { type: 'CallExpression', callee: source } });
    check(`${ label }/caller retains terminal`, called === plan, true);
    const terminal = terminalNavCollapsePlan(plan, { node: source, consumer: path.node });
    check(`${ label }/terminal fold`, terminal.hops.length - terminal.collapseIdx - 1, plan.rootAssign ? tail : 0);
  }
  check(`${ label }/queries and renders preserve source`, JSON.stringify(source), before);
});

for (const [expression, supported, tail] of [
  ['globalThis.window?.self.Array', true, 1],
  ['globalThis.window?.self', true, 0],
  ['globalThis.window?.window.Array', false, 0],
  ['globalThis.window?.self[key]', false, 0],
  ['(globalThis.window?.self).Array', false, 0],
  ['globalThis.window.self.Array', false, 0],
]) runBoth(`passthrough/${ expression }`, `const key = 'Array'; const value = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(path.node.init);
  const plan = guardedNavPassthroughPlan(path.node.init, resolvePure, { scope: path.scope, adapter, path });
  check(`${ label }/supported`, !!plan, supported);
  if (plan) {
    check(`${ label }/tail`, plan.hops.length, tail);
    check(`${ label }/root binding`, plan.test.source.root?.pure.entry, 'globalThis');
  }
  check(`${ label }/query purity`, JSON.stringify(path.node.init), before);
});

for (const [expression, collapsed] of [
  ['globalThis.self.window', true],
  ['(effect(), globalThis).self.window', true],
  ['(globalThis.window?.self).Array', false],
  ['unknown.self', false],
]) runBoth(`guard source/${ expression }`, `const value = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const source = path.node.init;
  const before = JSON.stringify(source);
  const plan = navGuardSourcePlan(source, resolvePure, { scope: path.scope, adapter, path });
  check(`${ label }/collapsed`, !plan.source, collapsed);
  if (expression.startsWith('(effect')) check(`${ label }/prefix count`, plan.prefix.length, 1);
  renderNavGuardTest(plan, { injectImport, embed: hostSlot });
  check(`${ label }/source unchanged`, JSON.stringify(source), before);
});
// Prefix effects are evaluated as part of the leaf receiver; a live optional tail keeps
// its chain boundary through the ESTree-to-Babel conversion.
const key = identifier('key');
const prefix = identifier('effect');
const leaf = identifier('leaf');
const value = renderNavCollapseValue({
  collapseIdx: -1,
  hops: [{ name: null, node: { computed: true, property: key }, liveOptional: true }],
}, leaf, { prefix: [prefix], cloneHost: node => hostSlot(cloneNode(node)) });
check('rendered value keeps the optional chain boundary', value.type, 'ChainExpression');
check('rendered value keeps the tail optional', value.expression.optional, true);
check('rendered value keeps the tail computed', value.expression.computed, true);
check('prefix belongs to the leaf receiver', value.expression.object.type, 'SequenceExpression');
check('prefix precedes the leaf', value.expression.object.expressions.map(node => node.name).join(','), 'effect,leaf');
finish();
