// An inward fold preserves source stores and effect order while selecting a single
// realm surface. A deleted navigation and the value stored below it can land apart.
import {
  collapseRootHoldsItsGlobal, planInnerProxyCollapse, planProxyReceiver,
} from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { guardProbeUndefinable } from '../../packages/core-js-polyfill-provider/detect-usage/guard-preparation.js';
import {
  claimProbeSourceSlot, proxyRunValueIsProven, undefinableOptionalGuard,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('inner-collapse');

function resolvePure({ name }) {
  return ['globalThis', 'self', 'Array'].includes(name) ? { entry: name, hintName: name } : null;
}

function context(parser, path) {
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  return { scope: path.scope, path, adapter };
}

runBoth('syntax-only root', 'const result = globalThis.self;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const node = path.node.init;
  const plan = planInnerProxyCollapse(node, { resolvePure });
  check(`${ label }/name-only landing`, plan.entry, 'globalThis');
  checkDeep(`${ label }/no effects`, plan.effects, []);
  check(`${ label }/unbacked root stays unbacked`, planInnerProxyCollapse(node, { resolvePure: () => null }).unbackedRoot, node.object);
});

for (const [expression, expected, spellable, effectNames] of [
  ['globalThis.self.window', 'self', true, []],
  ['window.window', 'unbacked', null, []],
  ['alias.self', 'alias', true, []],
  ['(saved = alias).self', 'alias', true, ['saved']],
  ['(saved = alias.window).self', 'alias', false, ['saved']],
  ['(first(), (second(), saved = (inside(), globalThis.self))).window', 'self', true, ['first', 'second', 'saved']],
  ['(saved = inner = globalThis.self).window', 'self', true, ['saved']],
  ['(first(), saved = globalThis.window).self', 'self', false, ['first', 'saved']],
]) runBoth(`source/${ expression }`, `let saved, inner; const alias = globalThis; const result = ${ expression };`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const node = unwrapRuntimeExpr(path.node.init);
    const aliasCtx = context(parser, path);
    const before = JSON.stringify(program.node);
    for (const deleteFold of [false, true]) {
      const plan = planInnerProxyCollapse(node, { aliasCtx, resolvePure, deleteFold });
      check(`${ label }/${ deleteFold }/accepted`, !!plan, true);
      const landing = expected === 'self' && deleteFold && expression.includes('globalThis') ? 'globalThis' : expected;
      check(`${ label }/${ deleteFold }/landing`, plan.aliasRoot ? 'alias' : plan.unbackedRoot ? 'unbacked' : plan.entry, landing);
      if (expected === 'self') check(`${ label }/${ deleteFold }/stored landing`, plan.valueEntry, 'self');
      if (spellable !== null) check(`${ label }/${ deleteFold }/store spelling`, plan.writeStoreSpellable, spellable);
      checkDeep(`${ label }/${ deleteFold }/effects`, plan.effects.map(effect => effect.left?.name ?? effect.callee?.name), effectNames);
      if (plan.keptWrite) {
        check(`${ label }/${ deleteFold }/outer store`, plan.keptWrite.left.name, 'saved');
        check(`${ label }/${ deleteFold }/store identity`, plan.effects.at(-1), plan.keptWrite);
      }
      const second = planInnerProxyCollapse(node, { aliasCtx, resolvePure, deleteFold });
      checkDeep(`${ label }/${ deleteFold }/repeat`, second, plan);
      check(`${ label }/${ deleteFold }/fresh effects`, second.effects === plan.effects, false);
    }
    check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
  });

for (const [expression, facts, admitted] of [
  ['globalThis.userField', {}, false],
  ["globalThis[(effect(), 'self')]", {}, false],
  ['globalThis?.self', {}, false],
  ['globalThis?.self', { allowOptional: true }, true],
  ['(() => globalThis)().self', {}, false],
  ['(() => globalThis)().self', { provenCallRoot: true }, true],
  ['(() => globalThis.window)().self', { provenCallRoot: true }, false],
  ['(() => { effect(); return globalThis; })().self', { provenCallRoot: true }, false],
  ['(() => globalThis)()?.window?.self', { provenCallRoot: true, allowOptional: true }, false],
]) runBoth(`admission/${ expression }/${ admitted }`, `const result = ${ expression };`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const aliasCtx = context(parser, path);
    const node = unwrapRuntimeExpr(path.node.init);
    check(`${ label }/admitted`, !!planInnerProxyCollapse(node, { aliasCtx, resolvePure, ...facts }), admitted);
  });

for (const [source, admitted] of [
  ['const { value } = globalThis.self.window;', true],
  ['const { value } = globalThis.window;', false],
  ['const { value } = globalThis.self;', false],
  ["const { value } = globalThis.self['window'];", false],
  ['const alias = globalThis; const { value } = alias.window.self;', true],
  ['const value = globalThis.self.window;', false],
]) runBoth(`whole source/${ source }`, source, (parser, program, label) => {
  const path = parser.collectPaths(program, 'VariableDeclarator').at(-1);
  const aliasCtx = context(parser, path);
  const node = unwrapRuntimeExpr(path.node.init);
  // The root proof is independent of the pattern's decision to consume the whole source.
  let root = node;
  while (root.object) root = unwrapRuntimeExpr(root.object);
  const plan = planInnerProxyCollapse(node, { aliasCtx, resolvePure, root,
    valueConsumer: { target: path.node.id, observed: false } });
  check(`${ label }/source admission`, !!plan?.entry, admitted);
  check(`${ label }/fallback observes its value`, planInnerProxyCollapse(node, { aliasCtx, resolvePure, root,
    valueConsumer: { target: path.node.id, observed: true } }), null);
});

runBoth('targets and patched realm slots', 'const result = globalThis.self.window;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const node = unwrapRuntimeExpr(path.node.init);
  const aliasCtx = context(parser, path);
  for (const [excluded, expected] of [['globalThis', 'self'], ['self', 'globalThis']]) {
    for (const deleteFold of [false, true]) {
      const plan = planInnerProxyCollapse(node, { aliasCtx, deleteFold,
        resolvePure: meta => meta.name === excluded ? null : resolvePure(meta) });
      check(`${ label }/${ excluded }/${ deleteFold }`, plan.entry, expected);
    }
  }
  const unavailable = planInnerProxyCollapse(node, { aliasCtx, resolvePure: () => null });
  check(`${ label }/no available root`, unavailable.unbackedRoot.name, 'globalThis');
  const patched = { ...aliasCtx, adapter: { ...aliasCtx.adapter, isMutatedStatic(name, key) {
    return name === 'globalThis' && key === 'self';
  } } };
  check(`${ label }/patched hop stays in place`, planInnerProxyCollapse(node, { aliasCtx: patched, resolvePure }), null);
});

runBoth('shadowed root', 'function read(globalThis) { const result = globalThis.self; }', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  check(label, planInnerProxyCollapse(path.node.init, { aliasCtx: context(parser, path), resolvePure }), null);
});

for (const store of ['held = globalThis.self', 'held = (effect(), globalThis.self)',
  'box.value = (first(), held = (second(), globalThis.self))']) {
  runBoth(`stored surface probe/${ store }`, `let held; const box = {}; const result = (${ store }).window;`,
    (parser, program, label) => {
      const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
      check(label, guardProbeUndefinable(unwrapRuntimeExpr(path.node.init), { ...context(parser, path), resolvePure }), true);
      check(`${ label }/outer fold cannot erase the observed value`,
        proxyRunValueIsProven(unwrapRuntimeExpr(path.node.init), resolvePure, context(parser, path)), false);
    });
}

runBoth('receiver retains probe store', 'let saved; const result = (head(), saved = globalThis.window).self.userField;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const node = unwrapRuntimeExpr(path.node.init);
    const aliasCtx = context(parser, path);
    const write = parser.pickPath(program, 'AssignmentExpression').node;
    const plan = planProxyReceiver(node, { aliasCtx, resolvePure, throughChainAssign: true });
    check(`${ label }/retained store`, plan.rootBinding.keep, write);
    checkDeep(`${ label }/store not replayed twice`, plan.harvestedSE.map(effect => effect.callee.name), ['head']);
    check(`${ label }/leaf identity`, plan.property, node.property);
  });

runBoth('one probe above nested stores', `let saved; const box = {};
  const result = (box.value = (head(), saved = (tail(), globalThis.self))).window?.Array?.from;`,
(parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const node = unwrapRuntimeExpr(path.node.init);
  const aliasCtx = context(parser, path);
  const probe = unwrapRuntimeExpr(unwrapRuntimeExpr(node.object).object);
  const plan = undefinableOptionalGuard(node, resolvePure, aliasCtx);
  check(`${ label }/one guard`, plan.kind, 'guard');
  check(`${ label }/source probe identity`, plan.object, probe);
  check(`${ label }/receiver cannot erase its probe`, planProxyReceiver(unwrapRuntimeExpr(node.object),
    { aliasCtx, resolvePure, throughChainAssign: true }), null);
  const slot = claimProbeSourceSlot(probe, resolvePure, aliasCtx);
  checkDeep(`${ label }/only the outer probe is served`, slot.served, [[]]);
  const write = parser.pickPath(program, 'AssignmentExpression', item => item.node.left.type === 'MemberExpression').node;
  check(`${ label }/stored value remains a live child`, slot.children.includes(write.right), true);
});

runBoth('unclaimed optional receiver', 'let held; const result = (held = globalThis.self).window?.userField;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    check(label, planProxyReceiver(unwrapRuntimeExpr(path.node.init),
      { aliasCtx: context(parser, path), resolvePure, throughChainAssign: true }), null);
  });

runBoth('rescue belongs to source', 'const result = (first(), (() => { effect(); return globalThis; })()).self;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const node = unwrapRuntimeExpr(path.node.init);
    const call = parser.pickPath(program, 'CallExpression', item => unwrapRuntimeExpr(item.node.callee).type === 'ArrowFunctionExpression').node;
    const rescue = new Set([call]);
    const aliasCtx = context(parser, path);
    const before = JSON.stringify(program.node);
    for (let run = 0; run < 2; run++) {
      const plan = planInnerProxyCollapse(node, { aliasCtx, resolvePure, rootName: 'globalThis', rescue });
      check(`${ label }/${ run }/first effect`, plan.effects[0].callee.name, 'first');
      check(`${ label }/${ run }/rescued call identity`, plan.effects[1], call);
      check(`${ label }/${ run }/rescue stays owned by caller`, rescue.has(call), true);
    }
    check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
  });

runBoth('admitted memo and source alias differ', 'const alias = globalThis; const result = alias.self;',
  (parser, program, label) => {
    const path = parser.collectPaths(program, 'VariableDeclarator').at(-1);
    const aliasCtx = context(parser, path);
    const node = unwrapRuntimeExpr(path.node.init);
    const root = node.object;
    const original = aliasCtx.adapter.getBinding;
    aliasCtx.adapter = { ...aliasCtx.adapter, getBinding(args) {
      return args.name === 'alias' ? { polyfillHint: 'globalThis', importSource: '@core-js/pure/features/global-this' } : original(args);
    } };
    check(`${ label }/source cannot refold a minted root`, planInnerProxyCollapse(node, { aliasCtx, resolvePure }), null);
    check(`${ label }/source import is not a trusted alias`, collapseRootHoldsItsGlobal(root, aliasCtx), false);
    const plan = planInnerProxyCollapse(node, { aliasCtx, resolvePure, root });
    check(`${ label }/admitted memo keeps identity`, plan.aliasRoot, root);
  });

finish();
