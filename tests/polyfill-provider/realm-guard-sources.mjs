// Realm identity and possible absence are separate questions, in both parsers.
import {
  inlineCallProxyGlobalRoot,
  claimReceiverEvaluationMayThrow,
  proxyReceiverValueCanBeUndefined,
  realmSelectionCollapseOperand,
  undefinableOptionalGuard,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { planOptionalProbe, prepareGuardReceiver } from '../../packages/core-js-polyfill-provider/detect-usage/guard-preparation.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { cloneNode } from '../../packages/core-js-polyfill-provider/render.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('realm-guard-sources');
function context(parser, path) {
  return { path, scope: path.scope,
    adapter: (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' }) };
}
function resolvePure({ name }) {
  return ['globalThis', 'self', 'Iterator'].includes(name) ? { entry: name, hintName: name } : null;
}
for (const [yielded, realm] of [
  ['globalThis', true], ['globalThis.self', true], ['globalThis.window', true],
  ['globalThis.window?.self', true], ['globalThis.lib', false],
  ['globalThis.lib.self', false], ['globalThis.self.lib', false],
  ['globalThis["self"]', true], ['globalThis[key]', false],
  ['((globalThis))', true], ['(effect(), globalThis)', true],
  ['(effect(), globalThis.lib)', false],
]) runBoth(`call yield/${ yielded }`, `function get() { return ${ yielded }; } const result = get();`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const ctx = context(parser, path);
    const before = JSON.stringify(program.node);
    check(label, !!inlineCallProxyGlobalRoot({ callNode: path.node.init, ...ctx }), realm);
    check(`${ label }/speculation`, JSON.stringify(program.node), before);
  });
for (const [value, pure, retained] of [
  ['choice ? globalThis : self', true, true],
  ['test() ? globalThis : self', false, true],
  ['test() ? (other() ? globalThis : self) : globalThis', false, true],
  ['test() ? globalThis : user', false, false],
  ['choice && globalThis', false, false],
]) runBoth(`selection policy/${ value }`, `const result = ${ value };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const ctx = context(parser, path);
  const before = JSON.stringify(program.node);
  check(`${ label }/collapse`, !!realmSelectionCollapseOperand(path.node.init, ctx), pure);
  check(`${ label }/retained test`, !!realmSelectionCollapseOperand(path.node.init, ctx, { preserveTest: true }), retained);
  check(`${ label }/collapse after retained`, !!realmSelectionCollapseOperand(path.node.init, ctx), pure);
  check(`${ label }/speculation`, JSON.stringify(program.node), before);
});
for (const [source, throws] of [['(held = globalThis.window).self', true], ['globalThis.self', false]]) {
  runBoth(`read after probe/${ source }`, `let held; const result = ${ source };`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    check(label, claimReceiverEvaluationMayThrow(path.node.init, resolvePure, context(parser, path)), throws);
  });
}
runBoth('literal call result is not a realm', 'function get() { return { slot: Array }; } const result = get()?.slot?.from;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const ctx = { ...context(parser, path), resolvePure };
    const plan = planOptionalProbe(unwrapRuntimeExpr(path.node.init), ctx, { hintName: 'Array$from' });
    check(`${ label }/source`, plan?.source?.type, 'CallExpression');
    check(`${ label }/callee`, plan?.source?.callee?.name, 'get');
  });
// A binding can retain the navigation itself; preparation still owns its call proof.
for (const [source, expected, capture] of [
  ['get()?.self', ['folded'], false],
  ['get().self?.self', ['guarded'], true],
  ['(get()?.self).self', ['folded'], false],
  ['null == get().self?.self ? void 0 : globalThis', ['deoptionalize'], true],
]) runBoth(`retained memo/${ source }`, `function get() { return globalThis; } const result = ${ source };`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const ctx = { ...context(parser, path), resolvePure };
    const node = unwrapRuntimeExpr(path.node.init);
    const before = JSON.stringify(node);
    const events = [];
    const result = prepareGuardReceiver(node, ctx, {
      renderNav: () => node,
      cloneMemo: cloneNode,
      pure: pure => ({ type: 'Identifier', name: `_${ pure.hintName }` }),
      folded(pure) {
        events.push('folded');
        return { type: 'Identifier', name: `_${ pure.hintName }` };
      },
      guarded(probe) {
        events.push('guarded');
        return cloneNode(probe);
      },
      deoptionalize(probe) {
        events.push('deoptionalize');
        probe.optional = false;
      },
    });
    checkDeep(`${ label }/binding calls`, events, expected);
    check(`${ label }/capture`, result.capture, capture);
    check(`${ label }/source unchanged`, JSON.stringify(node), before);
  });
for (const [setup, receiver] of [
  ['', '(choice ? globalThis : self)'],
  ['const g = globalThis;', '(choice ? g : globalThis)'],
  ['const g = globalThis; const selected = choice ? g : globalThis;', 'selected'],
  ['let held; const g = globalThis;', '(held = choice ? g : globalThis)'],
]) runBoth(`selected probe/${ receiver }`, `${ setup } const result = ${ receiver }.window;`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    check(label, proxyReceiverValueCanBeUndefined(path.node.init, resolvePure, context(parser, path)), true);
  });
for (const [setup, receiver, sourceKey] of [
  ['function get() { return globalThis.window; }', 'get()?.Array?.from', null],
  ['function get() { return globalThis; }', 'get().window?.Array?.from', 'window'],
  ['', 'globalThis.window?.self?.Iterator.from', 'window'],
  ['', '(globalThis.window?.self)?.Iterator?.from', 'window'],
  ['', 'globalThis.window?.global?.Iterator.from', 'global'],
]) for (const native of [false, true]) runBoth(`guard/${ receiver }/${ native }`, `${ setup } const result = ${ receiver };`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const ctx = context(parser, path);
    const resolve = native ? ({ name }) => name === 'Iterator' ? resolvePure({ name }) : null : resolvePure;
    const before = JSON.stringify(program.node);
    const result = undefinableOptionalGuard(unwrapRuntimeExpr(path.node.init), resolve, ctx);
    check(`${ label }/kind`, result.kind, 'guard');
    check(`${ label }/source`, result.object?.property?.name ?? null, sourceKey);
    checkDeep(`${ label }/repeat`, undefinableOptionalGuard(unwrapRuntimeExpr(path.node.init), resolve, ctx), result);
    check(`${ label }/speculation`, JSON.stringify(program.node), before);
  });
finish();
