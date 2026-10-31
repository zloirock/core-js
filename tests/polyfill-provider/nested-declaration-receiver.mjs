import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { proxyNavHead, resolveNestedNavDispatch, resolveNestedReceiverChain, typedNavClaimChain } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { planNestedDeclarationReceiver } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { proxyGlobalRootName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { cloneNode, identifier, renderInstanceDefaultGuard, renderNestedDeclarationReceiver } from '../../packages/core-js-polyfill-provider/render.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('nested-declaration-receiver');
function resolveGlobalPolyfill(name) {
  return ['globalThis', 'self', 'Map'].includes(name) ? { entry: name, hintName: name } : null;
}
function resolveStaticPolyfill(name, key) {
  return name === 'Array' && key === 'from' ? { entry: 'array/from', hintName: 'Array$from' } : null;
}
function context(parser, generated = []) {
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  return {
    adapter, resolveGlobalPolyfill, resolveStaticPolyfill, isOwnAlias: () => false,
    injectorState: { isOwnPassGeneratedName: name => generated.includes(name) },
  };
}
function leafPath(parser, program) {
  return parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.node.value?.name === 'method');
}

for (const [name, source, expected, keys, carries = false] of [
  ['user', 'const { data: { at: method } } = source;', 'source', ['data']],
  ['call', 'const { data: { at: method } } = source();', 'CallExpression', ['data'], true],
  ['new', 'const { data: { at: method } } = new Source();', 'NewExpression', ['data'], true],
  ['own this', 'function read() { const { data: { at: method } } = this; }', 'ThisExpression', ['data'], true],
  ['prefix', 'const { data: { at: method } } = (effect(), source);', 'source', ['data'], true],
  ['static', 'const { Array: { from: { name: method } } } = globalThis;', 'array/from', []],
  ['constructor', 'const { Map: { name: method } } = globalThis;', 'Map', []],
  ['realm user key', 'const { data: { at: method } } = globalThis;', 'globalThis', ['data']],
  ['capitalized user key', 'const source = { Array: { prototype: rows } }; const { Array: { prototype: { at: method } } } = source;', 'source', ['Array', 'prototype']],
  ['shadowed realm', 'function read(globalThis) { const { data: { at: method } } = globalThis; }', 'globalThis', ['data']],
]) runBoth(name, source, (parser, program, label) => {
  const path = leafPath(parser, program);
  const ctx = context(parser);
  const typedChain = typedNavClaimChain(path, { adapter: ctx.adapter, allowSurfaceBase: true });
  check(`${ label }/source chain`, !!typedChain, true);
  const input = { path, receiver: typedChain.root, keys: typedChain.keys, typedChain, entry: 'instance/at' };
  const before = JSON.stringify(program.node);
  const plan = planNestedDeclarationReceiver(input, ctx);
  check(`${ label }/selected base`, plan?.pure?.entry ?? plan?.node?.name ?? plan?.node?.type, expected);
  checkDeep(`${ label }/selected keys`, plan?.keys, keys);
  check(`${ label }/initializer ownership`, plan?.carriesInit, carries);
  check(`${ label }/prefix ownership`, plan.prefix?.length ?? 0, name === 'prefix' ? 1 : 0);
  const again = planNestedDeclarationReceiver(input, ctx);
  checkDeep(`${ label }/repeat decision`, { keys: again.keys, pure: again.pure }, { keys: plan.keys, pure: plan.pure });
  check(`${ label }/discarded query preserves source`, JSON.stringify(program.node), before);
  let roots = 0;
  renderNestedDeclarationReceiver(plan, {
    embed: node => { if (node === plan.node) roots++; return cloneNode(node); },
    importPure: () => { roots++; return identifier('pure'); },
    mintRef: () => identifier('memo'),
  });
  check(`${ label }/one selected root`, roots, 1);
});

for (const [name, source, symbol, expected] of [
  ['surface', 'const { Array: { prototype: { at: method } } } = globalThis;', false, true],
  ['surface is not a receiver instance', 'const { Array: { keys: method } } = globalThis;', false, false],
  ['symbol reads reached object', 'const { Array: { [Symbol.iterator]: method } } = globalThis;', true, true],
  ['symbol user read', 'const { data: { [Symbol.iterator]: method } } = source;', true, true],
  ['surviving getter', 'const { data: { at: method, other } } = source;', false, false],
  ['surviving symbol getter', 'const { data: { [Symbol.iterator]: method, other } } = source;', true, false],
]) runBoth(name, source, (parser, program, label) => {
  const path = leafPath(parser, program);
  const ctx = context(parser);
  const chain = resolveNestedReceiverChain(path, { adapter: ctx.adapter });
  check(`${ label }/source chain`, !!chain, true);
  const plan = planNestedDeclarationReceiver({ path, receiver: chain.root, keys: chain.keys,
    entry: symbol ? 'get-iterator-method' : 'instance/at' }, ctx);
  check(`${ label }/read admission`, !!plan, expected);
});

// Source names resembling generated refs are ordinary aliases. Membership, not spelling,
// preserves a capture's raw realm navigation when no pure base replaces that read.
for (const [name, minted] of [['_ref', false], ['captured', true]]) {
  runBoth(`capture/${ name }`, `const ${ name } = globalThis; const { Array: { prototype: { at: method } } } = ${ name };`,
    (parser, program, label) => {
      const path = leafPath(parser, program);
      const ctx = context(parser, minted ? [name] : []);
      ctx.resolveGlobalPolyfill = () => null;
      const chain = resolveNestedReceiverChain(path, { adapter: ctx.adapter });
      const input = { path, receiver: chain.root, keys: chain.keys, entry: 'instance/at' };
      const plan = planNestedDeclarationReceiver(input, ctx);
      check(`${ label }/capture identity`, plan?.node?.name, minted ? name : 'globalThis');
      checkDeep(`${ label }/navigation preserved`, plan?.keys, ['Array', 'prototype']);
    });
}

runBoth('live default', 'const { data: { at: method } = fallback() } = source;', (parser, program, label) => {
  const path = leafPath(parser, program);
  const ctx = context(parser);
  const typedChain = typedNavClaimChain(path, { adapter: ctx.adapter });
  const plan = planNestedDeclarationReceiver({ path, receiver: typedChain.root, keys: typedChain.keys, typedChain,
    entry: 'instance/at' }, ctx);
  const slot = parser.pickPath(program, 'AssignmentPattern');
  check(`${ label }/owns source default slot`, plan.defaultSlot, slot.node);
  slot.node.right = identifier('renderedChild');
  const output = renderNestedDeclarationReceiver(plan, {
    embed: cloneNode, importPure: () => identifier('pure'), mintRef: () => identifier('memo'),
    defaultGuard(options) {
      check(`${ label }/native wrapper receives the source slot`, options.defaultPattern, slot.node);
      return renderInstanceDefaultGuard(options);
    },
  });
  check(`${ label }/refreshes replaced default`, output.consequent.name, 'renderedChild');
  check(`${ label }/one guarded read`, output.test.left.left.name, 'memo');
});

runBoth('live member root', 'const { prototype: { at: method } } = globalThis.Array;', (parser, program, label) => {
  const path = leafPath(parser, program);
  const ctx = context(parser);
  const receiver = parser.pickPath(program, 'VariableDeclarator').node.init;
  const plan = planNestedDeclarationReceiver({ path, receiver, keys: ['prototype'], entry: 'instance/at' }, ctx);
  check(`${ label }/borrows source slot`, plan.refresh.source, receiver);
  const hooks = { embed: cloneNode, importPure: () => identifier('pure'), mintRef: () => identifier('memo') };
  const original = renderNestedDeclarationReceiver(plan, hooks);
  check(`${ label }/original receiver navigation`, original.object.property.name, 'Array');
  check(`${ label }/original pattern navigation`, original.property.name, 'prototype');
  const live = identifier('childResult');
  const capture = identifier('captured');
  check(`${ label }/live child replaces source navigation`, renderNestedDeclarationReceiver(plan, {
    ...hooks, liveReceiver: () => live,
  }).object.name, 'childResult');
  const captured = renderNestedDeclarationReceiver(plan, {
    ...hooks, liveReceiver: () => live, capturedReceiver: capture,
  });
  check(`${ label }/host capture has priority`, captured.object.name, 'captured');
  check(`${ label }/capture keeps pattern navigation`, captured.property.name, 'prototype');
});

for (const [expression, keys] of [
  ['globalThis.Array', ['Array']],
  ['globalThis.self.Array', ['Array']],
  ['globalThis["self"]["Array"]', ['Array']],
  ['globalThis.self', ['self']],
  ['globalThis[key]', null],
  ['source.Array', null],
  ['source().Array', null],
  ['globalThis', null],
]) runBoth(`proxy head/${ expression }`, `const value = ${ expression };`, (parser, program, label) => {
  const receiver = parser.pickPath(program, 'VariableDeclarator').node.init;
  const { adapter } = context(parser);
  checkDeep(label, proxyNavHead(receiver, { adapter }), keys ? { rootName: 'globalThis', keys } : null);
});

for (const ownThis of [false, true]) {
  const source = 'const { Array: { prototype: { at: method } }, kept } = this;';
  runBoth(`surface this/own=${ ownThis }`, ownThis ? `function read() { ${ source } }` : source, (parser, program, label) => {
    const path = leafPath(parser, program);
    const ctx = context(parser);
    const { dispatch } = resolveNestedNavDispatch(path, { adapter: ctx.adapter });
    check(`${ label }/source root`, dispatch?.root?.type ?? null, ownThis ? null : 'ThisExpression');
    if (ownThis) return;
    const plan = planNestedDeclarationReceiver({ path, receiver: dispatch.root, keys: dispatch.keys, entry: 'instance/at' }, ctx);
    check(`${ label }/keeps admitted receiver`, plan?.node, dispatch.root);
    checkDeep(`${ label }/surface hops`, plan?.keys, ['Array', 'prototype']);
  });
}

// Type adapters can read loop declarations without exposing trusted assignment writes.
for (const [name, source, expected] of [
  ['realm', 'for (const root of [globalThis]) use(root);', 'globalThis'],
  ['this realm', 'for (const root of [this]) use(root);', 'globalThis'],
  ['mixed', 'for (const root of [globalThis, other]) use(root);', null],
  ['reassigned', 'for (let root of [globalThis]) { root = other; use(root); }', null],
  ['shadowed', 'function read(globalThis) { for (const root of [globalThis]) use(root); }', null],
]) runBoth(`loop/${ name }`, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'CallExpression', item => item.node.callee.name === 'use');
  const { adapter } = context(parser);
  for (const writes of [true, false]) {
    const view = writes ? adapter : { ...adapter, findTrustedAliasWrite: undefined };
    check(`${ label }/trusted write capability=${ writes }`, proxyGlobalRootName({
      node: path.node.arguments[0], scope: path.scope, adapter: view, path,
    }), expected);
  }
});

finish();
