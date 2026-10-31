// A declined member has one replacement owner: base, source span and ordered effects.
import { planDeclinedNavigation, planInnerProxyCollapse } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { renderDeclinedNavigation, hostSlot } from '../../packages/core-js-polyfill-provider/render.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('declined-navigation');
function resolvePure({ name }) {
  return ['globalThis', 'self'].includes(name) ? { entry: name, hintName: name } : null;
}
function context(parser, path) {
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  return { scope: path.scope, path, adapter, resolvePure };
}

for (const [source, entry, effects] of [
  ['root().self.slot', 'self', []],
  ['(first(), (second(), root())).self.slot', 'self', ['first', 'second']],
  ['(saved = first(), root()).self.slot', 'self', ['saved']],
  ['root().self[(key(), "slot")]', 'self', []],
]) runBoth(source, `let saved; const root = () => globalThis; const result = ${ source };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result').get('init');
  const options = context(parser, path);
  const before = JSON.stringify(program.node);
  const plan = planDeclinedNavigation(options);
  check(`${ label } fold`, !!plan.fold, true);
  check(`${ label } base`, plan.fold.base.pure.entry, entry);
  check(`${ label } source`, plan.fold.source, path.node.object);
  check(`${ label } target`, plan.fold.path.node, path.node.object);
  checkDeep(`${ label } order`, plan.fold.effects.map(effect => effect.left?.name ?? effect.callee?.name), effects);
  const again = planDeclinedNavigation(options);
  check(`${ label } repeat source`, again.fold.source, plan.fold.source);
  checkDeep(`${ label } repeat effect identities`, again.fold.effects, plan.fold.effects);
  const imports = [];
  const rendered = renderDeclinedNavigation(plan.fold, {
    injectImport(name) { imports.push(name); return '_base'; }, embed: hostSlot, carryEffect: node => node,
  });
  checkDeep(`${ label } imports`, imports, [entry]);
  if (effects.length) {
    check(`${ label } effects stay live`, rendered.expressions[0].node, plan.fold.effects[0]);
    check(`${ label } base after effects`, rendered.expressions.at(-1).name, '_base');
  }
  check(`${ label } query and render preserve source`, JSON.stringify(program.node), before);
});

runBoth('climbed end owns the complete prefix', 'const root = () => globalThis; const result = (outer(), root()).self.window.slot;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'MemberExpression', item => item.node.property.name === 'self');
    const options = context(parser, path);
    const plan = planDeclinedNavigation(options);
    check(`${ label } climbed`, plan.endPath === path, false);
    check(`${ label } replaced source`, plan.fold.source, plan.endPath.node.object);
    check(`${ label } outer prefix retained`, plan.fold.effects[0].callee.name, 'outer');
  });

runBoth('receiver and key shares', 'const root = () => globalThis; const result = (outer(inner()), root()).self[(key(), "slot")];',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result').get('init');
    const options = context(parser, path);
    const [first] = unwrapRuntimeExpr(path.node.object.object).expressions;
    const [key] = unwrapRuntimeExpr(path.node.property).expressions;
    const meta = { sideEffects: [first.arguments[0], key], receiverEffectCount: 1 };
    check(`${ label } containing effect owns nested receiver`, !!planDeclinedNavigation({ ...options, meta }).fold, true);
    check(`${ label } missing receiver effect declines`, !!planDeclinedNavigation({ ...options,
      meta: { sideEffects: [key], receiverEffectCount: 1 } }).fold, false);
    check(`${ label } key stays in surviving property`, !!planDeclinedNavigation({ ...options,
      meta: { sideEffects: [key], receiverEffectCount: 0 } }).fold, true);
  });

for (const [source, setup, navigated, deleted, admitted] of [
  ['alias.window.self.slot', 'const alias = globalThis;', true, false, true],
  ['alias.window.self', 'const alias = globalThis;', false, false, false],
  ['(effect(), alias).window.self.slot', 'const alias = globalThis;', true, false, false],
  ['(saved = alias).window.self.slot', 'let saved; const alias = globalThis;', true, false, false],
  ['globalThis.window.self.slot', '', true, true, true],
]) runBoth(`inner/${ source }`, `${ setup } const result = ${ source };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result').get('init');
  const options = context(parser, path);
  const node = path.node.object;
  const collapse = planInnerProxyCollapse(node, { resolvePure, aliasCtx: options });
  const plan = planDeclinedNavigation({ ...options, receiver: { node, collapse, navigated, deleteFold: deleted } });
  check(`${ label } admission`, !!plan.fold, admitted);
  if (admitted) {
    check(`${ label } source`, plan.fold.source, node);
    check(`${ label } alias or pure`, plan.fold.base.alias?.name ?? plan.fold.base.pure.entry, setup ? 'alias' : 'self');
  }
});

for (const [source, facts, verdict] of [
  ['root().self.slot', { resolvePure: () => null }, null],
  ['root().self.slot', { loweredGuardTest: true }, 'stand-down'],
  ['root().self.slot', { deleteFold: true }, 'fold-whole'],
  ['root().self.window?.slot', {}, 'fold-whole'],
  ['root().self.window?.slot', { deleteFold: true }, 'stand-down'],
  ['root()[(effect(), "self")].slot', {}, null],
  ['(() => { effect(); return globalThis; })().self.slot', {}, null],
]) runBoth(`refusal/${ source }/${ verdict }`, `const root = () => globalThis; const result = ${ source };`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result').get('init');
    const options = context(parser, path);
    const plan = planDeclinedNavigation({ ...options, ...facts });
    check(`${ label } verdict`, plan.verdict, verdict);
    check(`${ label } complete fold only when admitted`, !!plan.fold, verdict === 'fold-whole');
    if (plan.fold) check(`${ label } landing`, plan.fold.base.pure.entry, facts.deleteFold ? 'globalThis' : 'self');
    const patched = { ...options.adapter, isMutatedStatic: (name, key) => name === 'globalThis' && key === 'self' };
    check(`${ label } patched hop refuses`, !!planDeclinedNavigation({ ...options, adapter: patched }).fold, false);
  });

runBoth('reuse an exact inner source', 'const root = () => globalThis; const result = (effect(), root()).self.slot;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result').get('init');
    const options = context(parser, path);
    const node = path.node.object;
    const collapse = planInnerProxyCollapse(node, { resolvePure, aliasCtx: options, provenCallRoot: true });
    const plan = planDeclinedNavigation({ ...options, receiver: { node, collapse, navigated: true } });
    check(`${ label } queried effects reused`, plan.fold.effects, collapse.effects);
    check(`${ label } source identity`, plan.fold.source, node);
  });

runBoth('whole source owned by a destructure', 'const alias = globalThis; const { slot } = alias.window.self;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern').get('init');
    const options = context(parser, path);
    const { node } = path;
    const collapse = planInnerProxyCollapse(node, { resolvePure, aliasCtx: options });
    const plan = planDeclinedNavigation({ ...options, receiver: { node, collapse, navigated: true } });
    check(`${ label } whole source`, plan.fold.source, node);
    check(`${ label } whole path`, plan.fold.path, path);
    const rendered = renderDeclinedNavigation(plan.fold, { injectImport() { throw new Error('alias does not import'); } });
    check(`${ label } alias preserved`, rendered.name, 'alias');
    check(`${ label } alias occurrence cloned`, rendered === collapse.aliasRoot, false);
  });

finish();
