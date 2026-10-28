// A kept write preserves its stored value; a sequence keeps effects outside its chosen tail.
// Source proofs and rewritten binding facts are independent inputs to the same decisions.
import {
  isPureNavReceiver, keptWriteRidesValue, navHopChain, runSwallowsStoreProbe,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { planKeptSequenceReceiver } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { pathOfNode, unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('kept-proxy-values');

function resolvePure({ name }) {
  return ['globalThis', 'self', 'Array'].includes(name) ? { entry: name, hintName: name } : null;
}

for (const [expression, blocks] of [
  ['(held = globalThis).window.item', false],
  ['(held = globalThis.window).window.item', true],
  ['(held = globalThis.self).window.item', false],
  ['(held = (effect(), globalThis.window)).window.item', true],
  ['(held = other = globalThis.window).window.item', true],
  ['(held = make()).window.item', true],
  ['(held = globalThis.window).self.item', false],
  ['(held = globalThis[(effect(), "window")]).window.item', true],
  ['(held = globalThis.custom).window.item', false],
  // The outer source-run question stops at an effectful carrier; its own plan keeps the write.
  ['(effect(), held = globalThis.window).window.item', false],
]) runBoth(`raw store/${ expression }`, `let held, other; const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const node = unwrapRuntimeExpr(path.node.init);
  const before = JSON.stringify(node);
  check(`${ label }/blocks`, runSwallowsStoreProbe(node, resolvePure), blocks);
  check(`${ label }/repeated query`, runSwallowsStoreProbe(node, resolvePure), blocks);
  check(`${ label }/source unchanged`, JSON.stringify(node), before);
});

for (const [expression, rides] of [
  ['held = globalThis', true],
  ['held = window', true],
  ['held = _realm', true],
  ['held = _unknown', false],
  ['held = alias', false],
  ['held = globalThis.self', true],
  ['held = globalThis.window', false],
  ['held = globalThis["window"]', true],
  ['held = globalThis?.self', false],
  ['held = (effect(), globalThis)', false],
  ['held = (effect(), globalThis.self)', false],
  ['held = (flag ? globalThis : self)', true],
  ['held = (effect() ? globalThis : self)', false],
  ['holder.slot = globalThis', false],
]) runBoth(`retained store/${ expression }`, `let held; const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const node = unwrapRuntimeExpr(path.node.init);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(node);
  const ctx = { adapter, resolvePure, isSubstituted: name => name === '_realm' };
  check(`${ label }/rides`, keptWriteRidesValue(node, ctx), rides);
  check(`${ label }/repeated query`, keptWriteRidesValue(node, ctx), rides);
  check(`${ label }/no inferred generated name`, keptWriteRidesValue(node, { adapter, resolvePure }),
    expression === 'held = _realm' ? false : rides);
  check(`${ label }/source unchanged`, JSON.stringify(node), before);
});

runBoth('substituted binding lifetime', 'let held; const result = held = _realm;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const node = path.node.init;
  let substituted = false;
  const ctx = { resolvePure, isSubstituted: () => substituted };
  check(`${ label }/before substitution`, keptWriteRidesValue(node, ctx), false);
  substituted = true;
  check(`${ label }/after substitution`, keptWriteRidesValue(node, ctx), true);
  substituted = false;
  check(`${ label }/after retirement`, keptWriteRidesValue(node, ctx), false);
});

runBoth('wrapped navigation root', 'const result = realm.self;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const node = path.node.init;
  check(`${ label }/plain source`, navHopChain(node).wrapped, false);
  const wrapped = { ...node, object: { type: 'ParenthesizedExpression', expression: node.object } };
  check(`${ label }/wrapped source`, navHopChain(wrapped).wrapped, true);
  check(`${ label }/navigation still admitted`, isPureNavReceiver(wrapped), true);
});

for (const [expression, nav, keys, computed] of [
  ['realm.self', true, ['self'], false],
  ['realm["self"]', true, ['self'], true],
  ['realm[0]', false, [], false],
  ['realm[`self`]', false, [], false],
  ['realm[(effect(), "self")]', false, [], false],
  ['realm?.self', false, [], false],
  ['(effect(), realm).self', false, ['self'], false],
  ['this.self', true, ['self'], false],
]) runBoth(`navigation/${ expression }`, `const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const node = path.node.init;
  const result = navHopChain(node);
  check(`${ label }/navigation`, isPureNavReceiver(node), nav);
  checkDeep(`${ label }/keys`, result.keys, keys);
  check(`${ label }/computed`, !!result.computed, computed);
});

for (const [expression, landing, prefix = ''] of [
  ['(first(), (second(), globalThis.self))?.custom', 'self'],
  ['(first(), (second(), globalThis.window))?.custom', null],
  ['(first(), (second(), globalThis.self.window))?.custom', 'self'],
  ['(first(), (second(), realm.self))?.custom', 'realm', 'const realm = globalThis;'],
  ['(first(), (second(), globalThis.self))?.custom', null, 'const globalThis = {};'],
  ['(first(), globalThis.self)?.custom', null],
  ['(first(), (second(), globalThis["self"]))?.custom', null],
  ['(first(), (second(), globalThis.self))?.Array.from([])', null],
]) runBoth(`residual sequence/${ expression }/${ prefix }`, `${ prefix } const result = ${ expression };`, (parser, program, label) => {
  const declaration = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const receiver = unwrapRuntimeExpr(declaration.node.init);
  const path = pathOfNode(declaration, receiver);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { aliasCtx: { scope: path.scope, path, adapter }, resolvePure };
  const before = JSON.stringify(receiver);
  const plan = planKeptSequenceReceiver(path, ctx);
  check(`${ label }/landing`, plan?.pure?.entry ?? plan?.root?.name ?? null, landing);
  checkDeep(`${ label }/stable source slot`, planKeptSequenceReceiver(path, ctx)?.keys, plan?.keys);
  if (plan) check(`${ label }/only the member tail is replaced`,
    plan.keys.reduce((node, key) => node[key], receiver).type, 'MemberExpression');
  check(`${ label }/source unchanged`, JSON.stringify(receiver), before);
  if (plan) {
    const tail = plan.keys.reduce((node, key) => node[key], receiver);
    const { object } = tail;
    tail.object = { type: 'ParenthesizedExpression', expression: object };
    check(`${ label }/wrapped tail keeps its own route`, planKeptSequenceReceiver(path, ctx), null);
    tail.object = object;
  }
});

finish();
