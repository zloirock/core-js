// Root drives and terminal delete claims share their source decisions. Native
// refreshes may renew children, but retained writes and effects keep their identity.
import { proxyRootCollapseRoutes } from '../../packages/core-js-polyfill-provider/detect-usage/proxy-navigation.js';
import { planDeletedProxyClaim } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { collectChainAssignsThroughMemberChain } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('root-delete-collapse');
function resolvePure({ name }) {
  return ['globalThis', 'self', 'Array'].includes(name) ? { entry: name, hintName: name } : null;
}
function context(parser, path) {
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  return { scope: path.scope, path, adapter };
}
function member(parser, program, name) {
  const paths = parser.collectPaths(program, 'MemberExpression');
  if (parser.name === 'babel') paths.push(...parser.collectPaths(program, 'OptionalMemberExpression'));
  return paths.find(path => path.node.property?.name === name);
}

for (const [expression, writes, deleted, kinds] of [
  ['globalThis.self.custom', false, false, ['receiver']],
  ['globalThis.self.custom', true, false, []],
  ['globalThis.window.custom', true, false, ['receiver']],
  ['globalThis.self.custom', true, true, ['receiver']],
  ['globalThis.window?.self.custom', false, false, []],
  ['(held = globalThis.window).self.custom', true, false, ['refresh', 'receiver']],
  ['(held = globalThis).self.custom', true, false, []],
  ['(held = globalThis).self.custom', false, false, ['receiver']],
  ['((held = globalThis.window)?.self).self[custom]', false, false, []],
  ['((held = globalThis.window)?.self).self?.[custom]', false, false, []],
]) runBoth(`root/${ expression }/${ writes }/${ deleted }`, `let held; ${ expression };`, (parser, program, label) => {
  const path = member(parser, program, 'custom');
  const aliasCtx = context(parser, path);
  const before = JSON.stringify(program.node);
  const routes = [...proxyRootCollapseRoutes({ path, aliasCtx, resolvePure, writeTarget: writes, deleteHosted: deleted })];
  checkDeep(`${ label }/routes`, routes.map(route => route.kind), kinds);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
  const refresh = routes.find(route => route.kind === 'refresh');
  if (refresh) {
    const write = parser.pickPath(program, 'AssignmentExpression').node;
    check(`${ label }/refresh identity`, refresh.store, write);
    check(`${ label }/receiver identity`, routes.at(-1).plan.rootBinding.keep, write);
  }
});

runBoth('whole source consumer', 'const { custom } = globalThis.window.self;', (parser, program, label) => {
  const path = member(parser, program, 'self');
  const aliasCtx = context(parser, path);
  const target = parser.pickPath(program, 'VariableDeclarator').node.id;
  for (const observed of [false, true]) {
    const routes = [...proxyRootCollapseRoutes({ path, aliasCtx, resolvePure, valueConsumer: { target, observed } })];
    checkDeep(`${ label }/observed ${ observed }`, routes.map(route => route.kind), observed ? [] : ['whole']);
  }
});

runBoth('refresh precedes receiver planning', 'let held; (held = globalThis.window).self.custom;', (parser, program, label) => {
  const path = member(parser, program, 'custom');
  const aliasCtx = context(parser, path);
  const routes = proxyRootCollapseRoutes({ path, aliasCtx, resolvePure, writeTarget: true });
  const refresh = routes.next().value;
  check(`${ label }/first step`, refresh.kind, 'refresh');
  const write = refresh.store;
  const value = write.right;
  write.right = { ...value };
  const receiver = routes.next().value;
  check(`${ label }/receiver follows refresh`, receiver.kind, 'receiver');
  check(`${ label }/write identity`, receiver.plan.rootBinding.keep, write);
  check(`${ label }/fresh value`, receiver.plan.rootBinding.keep.right, write.right);
  write.right = value;
});

for (const [source, name, expected] of [
  ['delete globalThis.self.custom;', 'self', 'globalThis'],
  ['const alias = globalThis; delete alias.self.custom;', 'self', 'alias'],
  ['delete (() => globalThis)().self.custom;', 'self', 'globalThis'],
  ['delete (() => (effect(), globalThis))().self.custom;', 'self', null],
  ['delete (() => globalThis.window)()?.self.custom;', 'self', null],
  ['let held; delete (held = globalThis.window).self.custom;', 'self', 'globalThis'],
  ['let held; delete (effect(), held = globalThis.window).self.custom;', 'self', 'globalThis'],
  ['let held; delete (held = globalThis.self).window.custom;', 'window', 'self'],
  ['let held; delete (held = globalThis.self).custom;', 'self', null],
  ['let held; delete (held = globalThis.window).self.box.custom;', 'self', 'keep'],
  ['let held; delete (effect(), held = globalThis.window).self.box.custom;', 'self', 'keep'],
]) runBoth(`delete/${ source }`, source, (parser, program, label) => {
  const path = member(parser, program, name);
  const aliasCtx = context(parser, path);
  const before = JSON.stringify(program.node);
  const facts = { aliasCtx, resolvePure, deleteFold: true, claimName: name };
  const plan = planDeletedProxyClaim(path.node, facts);
  check(`${ label }/base`, plan?.pure?.hintName ?? plan?.alias?.name ?? (plan?.keep ? 'keep' : null), expected);
  if (plan?.alias) check(`${ label }/alias identity`, plan.alias, unwrapRuntimeExpr(path.node.object));
  if (plan?.keep) {
    check(`${ label }/store identity`, plan.keep, parser.pickPath(program, 'AssignmentExpression').node);
    check(`${ label }/store not replayed twice`, plan.effects.includes(plan.keep), false);
    check(`${ label }/prefix retained`, plan.effects.length, source.includes('effect()') ? 1 : 0);
  }
  check(`${ label }/non-delete`, planDeletedProxyClaim(path.node, { ...facts, deleteFold: false }), null);
  check(`${ label }/non-realm claim`, planDeletedProxyClaim(path.node, { ...facts, claimName: 'Array' }), null);
  if (expected !== 'alias' && expected !== 'keep') check(`${ label }/unavailable entries`, planDeletedProxyClaim(path.node,
    { ...facts, resolvePure: () => null }), null);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
});

for (const prefix of ['', 'effect(), ']) runBoth(`store boundary/${ prefix }`,
  `let held; (${ prefix }held = globalThis).self.custom;`, (parser, program, label) => {
    const path = member(parser, program, 'custom');
    const write = parser.pickPath(program, 'AssignmentExpression').node;
    checkDeep(`${ label }/harvestable sequence`, collectChainAssignsThroughMemberChain(path.node), [write]);
    checkDeep(`${ label }/effect boundary`, collectChainAssignsThroughMemberChain(path.node, { throughEffects: false }),
      prefix ? [] : [write]);
  });

finish();
