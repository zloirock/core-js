// Deferred source facts survive rewritten wrappers without naming unrelated nodes.
import {
  claimProbeSourceSlot,
  directClaimProbePlan,
  navHopChain,
  isPureNavReceiver,
  peelPristineProxyHops,
  proxyCollapseConsumer,
  undefinableOptionalGuard,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { cloneProbeSourceSlot, renderNavGuardTest, literal } from '../../packages/core-js-polyfill-provider/render.js';
import { unwrapRuntimeExpr, isMemberAccessNode } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, finish, runBoth } = createChecker('probe-source-spines');
function resolvePure({ name }) {
  return ['globalThis', 'self', 'Promise'].includes(name) ? { entry: name, hintName: name } : null;
}
function context(parser, path) {
  return { path, scope: path.scope, adapter: (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' }) };
}
for (const root of ['globalThis', '(globalThis as any)', '(globalThis!)', '(globalThis satisfies any)']) {
  runBoth(`live spine/${ root }`, `const value = (${ root }.self)?.window;`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const slot = claimProbeSourceSlot(path.node.init, resolvePure, context(parser, path));
    const snapshot = cloneProbeSourceSlot(slot);
    const outer = unwrapRuntimeExpr(path.node.init);
    const inner = unwrapRuntimeExpr(outer.object);
    // The inner root's claim erased its wrapper after the probe was registered.
    inner.object = { type: 'Identifier', name: 'liveRoot' };
    const before = JSON.stringify(slot.source);
    const imports = [];
    const owned = [];
    const rendered = renderNavGuardTest({ source: slot }, {
      injectImport(entry) { imports.push(entry); return `_${ entry }`; },
      own(node) { owned.push(node); return node; },
    });
    check(`${ label }/detached root does not inject`, imports.length, 0);
    checkTruthy(`${ label }/live root kept`, JSON.stringify(rendered).includes('liveRoot'));
    check(`${ label }/both surviving reads owned`, owned.length, 2);
    checkTruthy(`${ label }/only member nodes owned`, owned.every(isMemberAccessNode));
    check(`${ label }/dead optional removed`, unwrapRuntimeExpr(rendered).optional, false);
    check(`${ label }/source not edited`, JSON.stringify(slot.source), before);
    const prior = renderNavGuardTest({ source: snapshot }, { injectImport: entry => `_${ entry }` });
    checkTruthy(`${ label }/snapshot keeps original binding`, JSON.stringify(prior).includes('_globalThis'));
    outer.object = { type: 'Identifier', name: 'replacement' };
    const shorter = renderNavGuardTest({ source: slot }, { injectImport: entry => `_${ entry }` });
    check(`${ label }/removed hop cannot receive facts`, unwrapRuntimeExpr(shorter).object.name, 'replacement');
  });
}
for (const key of ['#self', '#window', '#globalThis']) runBoth(`private hop/${ key }`,
  `class Holder { ${ key }; read() { return globalThis.window.${ key }; } }`, (parser, program, label) => {
    const path = parser.pickPath(program, 'ReturnStatement');
    const source = path.node.argument;
    check(`${ label }/no navigation`, isPureNavReceiver(source), false);
    check(`${ label }/no public keys`, navHopChain(source).keys.length, 0);
  });
for (const member of ['w.Promise', 'w["Promise"]', 'w[`Promise`]', 'w[P]', 'w[S][P]']) runBoth(`alias key/${ member }`,
  `const P = 'Promise', S = 'self'; const w = globalThis.window; const value = ${ member }.resolve;`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
    const plan = directClaimProbePlan(path.node.init, resolvePure, context(parser, path));
    check(`${ label }/alias probe`, plan?.kind, 'alias');
    check(`${ label }/read stops below first substituted value`, plan?.aliasProbe.key, member.includes('[S]') ? 'self' : 'Promise');
  });
for (const value of ['x\u2028y', 'x\u2029y', '\u2028\u2029', '\\u2028', '"\n\t\\']) {
  const node = literal(value);
  check(`${ JSON.stringify(value) }/roundtrip`, JSON.parse(node.raw), value);
  check(`${ JSON.stringify(value) }/no raw line separator`, /[\u2028\u2029]/.test(node.raw), false);
}
// The same quiet key canon gates both receiver peeling and mutated read ownership.
for (const [spelling, quiet] of [
  ['.self', true], ['["self"]', true], ['[`self`]', true], ['[K]', true], ['[(effect(), "self")]', false], ['[unknown]', false],
]) runBoth(`pristine key/${ spelling }`, `const K = 'self'; const value = globalThis${ spelling };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const node = path.node.init;
  const ctx = context(parser, path);
  const peeled = peelPristineProxyHops(node, { adapter: ctx.adapter, aliasCtx: ctx, resolveGlobalPolyfill: name => resolvePure({ name }) });
  check(`${ label }/quiet named hop only`, peeled, quiet ? node.object : node);
  // A caller with no scope can name only the key written on the member itself.
  const facts = proxyCollapseConsumer({ node: node.object, host: node }, {
    adapter: { isMutatedStatic: (object, key) => object === 'globalThis' && key === 'self' }, resolvePure,
  });
  check(`${ label }/mutated slot`, facts.mutatedSlot, quiet && spelling !== '[K]');
});
for (const tail of ['.resolve', '["resolve"]']) runBoth(`sealed constructor/${ tail }`,
  `const P = 'Promise'; const value = (globalThis.window?.self)[P]${ tail.startsWith('[') ? '?.' : '?' }${ tail };`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
    check(`${ label }/backed constructor is not an environment probe`,
      undefinableOptionalGuard(path.node.init, resolvePure, context(parser, path)).kind, 'erase');
  });
finish();
