// Probe ownership and key purity must not depend on emitter traversal order.
import {
  carriesRealmAlias,
  createOuterCollapsePlanner,
  directClaimProbePlan,
  destructureProbePlan,
  discardRescueNodes,
  effectfulClaimReadProbe,
  foldableRealmHop,
  resolveKey,
  terminalNavCollapsePlan,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { markRenderedProbeRead, unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('realm-probe-effects');
function context(parser, path, method = 'usage-pure') {
  return { path, scope: path.scope,
    adapter: (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method }) };
}
function resolvePure({ name }) {
  return ['globalThis', 'self', 'Promise'].includes(name) ? { entry: name, hintName: name } : null;
}
for (const [value, expected] of [
  ['held = globalThis.self', true], ['held = globalThis["self"]', true],
  ['held = globalThis', false], ['held = globalThis.user', false],
  ['held = globalThis.user.self', false], ['held = local', false],
  ['(effect(), globalThis.self)', false],
  ['(effect(), held = globalThis.self)', true],
]) runBoth(`carried realm/${ value }`, `let held; const value = ${ value };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const before = JSON.stringify(path.node);
  check(label, carriesRealmAlias(path.node.init, context(parser, path)), expected);
  check(`${ label }/speculation`, JSON.stringify(path.node), before);
});
for (const source of [
  'function f(globalThis) { let held; const value = (held = globalThis.self); }',
  'globalThis.self = user; let held; const value = (held = globalThis.self);',
]) runBoth('unproven carried realm', source, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const ctx = context(parser, path);
  // Mutation facts come from the file census, outside this decision's contract.
  if (source.startsWith('globalThis.self =')) ctx.adapter.isMutatedStatic = (owner, key) => owner === 'globalThis' && key === 'self';
  check(label, carriesRealmAlias(path.node.init, ctx), false);
});
for (const body of [
  '(effect(), globalThis).window.Promise',
  '(held = globalThis.self).window.Promise',
]) runBoth(`discarded read/${ body }`, `let held; const value = ${ body };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const ctx = context(parser, path);
  const before = JSON.stringify(path.node);
  const effects = discardRescueNodes({ node: path.node.init, ...ctx });
  const pattern = destructureProbePlan(path.node.init, resolvePure, ctx);
  const read = effectfulClaimReadProbe(path.node.init, effects, resolvePure, ctx);
  check(`${ label }/pattern keeps read`, pattern?.kind, 'read');
  check(`${ label }/same source owner`, pattern?.retained[0], read?.retained[0]);
  check(`${ label }/speculation`, JSON.stringify(path.node), before);
});
runBoth('nested prefix ownership', 'const value = (first(), (second(), globalThis.window))?.Promise;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const ctx = context(parser, path);
    check(`${ label }/no plain reader above the optional`, directClaimProbePlan(path.node.init, resolvePure, ctx), null);
    const plan = destructureProbePlan(path.node.init, resolvePure, ctx);
    checkDeep(`${ label }/prefix`, plan.prefix.map(node => node.callee.name), ['first', 'second']);
    check(`${ label }/no prefix in live-only arm`, plan.alternateEffects.length, 0);
  });
runBoth('alias prefix boundary', 'const held = globalThis.window; const value = ((before(), held).Promise).resolve;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
    const probe = directClaimProbePlan(path.node.init, resolvePure, context(parser, path));
    const held = parser.collectPaths(program, 'Identifier').find(item => item.node.name === 'held' && item.node.start > path.node.start).node;
    check(`${ label }/holder starts after prefix`, probe.navStart, held.start);
  });
for (const method of ['usage-global', 'usage-pure']) for (const [setup, call, quiet] of [
  ['function key() { return "self"; }', 'key()', true],
  ['const key = value => value;', 'key("self")', true],
  ['function key() { effect(); return "self"; }', 'key()', false],
  ['const key = value => value;', 'key((effect(), "self"))', false],
  ['let key = () => "self"; key = user;', 'key()', false],
]) runBoth(`key/${ method }/${ setup }/${ call }`, `${ setup } const value = globalThis[${ call }];`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
    const ctx = context(parser, path, method);
    for (const keepsKeyNode of [false, true]) check(`${ label }/kept=${ keepsKeyNode }`,
      resolveKey({ node: path.node.init.property, computed: true, ...ctx, bailOnSideEffectKey: true, keepsKeyNode }), quiet ? 'self' : null);
  });
for (const key of ['window', '["window"]', '[(effect(), "window")]']) {
  runBoth(`terminal fold/${ key }`, `const value = globalThis${ key.startsWith('[') ? '' : '.' }${ key };`,
    (parser, program, label) => {
      const path = parser.pickPath(program, 'VariableDeclarator');
      const node = unwrapRuntimeExpr(path.node.init);
      const plan = { collapseIdx: -1, hops: [{ node }], resolvePure };
      check(label, terminalNavCollapsePlan(plan, { node, consumer: null }).collapseIdx, key.includes('effect') ? -1 : 0);
    });
}
runBoth('accepted probe owns its spine', 'const value = globalThis.window;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const node = unwrapRuntimeExpr(path.node.init);
  check(`${ label }/control`, createOuterCollapsePlanner({ resolvePure }).step({ kind: 'member', node, keyName: 'window' }), true);
  check(`${ label }/fold control`, foldableRealmHop(node, { ...context(parser, path), resolvePure }), true);
  markRenderedProbeRead(node);
  check(`${ label }/owned fold`, foldableRealmHop(node, { ...context(parser, path), resolvePure }), false);
  check(`${ label }/owned read`, createOuterCollapsePlanner({ resolvePure }).step({ kind: 'member', node, keyName: 'window' }), false);
  check(`${ label }/store below owned read`, createOuterCollapsePlanner({ resolvePure }).canCrossWrite({ reader: node, readerHop: true }), false);
});
for (const [entry, argIndex] of [
  ['function/instance/name', 0], ['function/instance/name', 1], ['promise/resolve', 0],
]) runBoth(`argument read/${ entry }/${ argIndex }`,
  `import dispatch from "@core-js/pure/actual/${ entry }";
   const value = dispatch(${ argIndex ? 'null, ' : '' }(effect(), globalThis).window.Promise);`, (parser, program, label) => {
    const path = parser.pickPath(program, 'MemberExpression', item => item.node.property.name === 'Promise');
    check(label, effectfulClaimReadProbe(path.node, null, resolvePure, context(parser, path))?.kind, 'read');
  });
for (const [source, expected] of [
  ['(effect(), globalThis.self)', undefined], ['(held = (effect(), globalThis.self))', 'read'],
]) runBoth(`backed navigation versus store/${ source }`,
  `import dispatch from "@core-js/pure/actual/function/instance/name"; let held; const value = dispatch(${ source }.window.Promise);`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'MemberExpression', item => item.node.property.name === 'Promise');
    check(label, effectfulClaimReadProbe(path.node, null, resolvePure, context(parser, path))?.kind, expected);
  });
finish();
