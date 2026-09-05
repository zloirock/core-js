// Decision tests for the nested-receiver extraction canon: `resolveNestedReceiverChain`
// (the pattern walk that names a hop chain and its root) runs through both parsers, and
// `resolveNestedReceiverBase` (the base reference the chain reads through) is exercised
// over a stub adapter - it consumes names, not AST, so the parsers have nothing to add
import {
  resolveNestedDestructureReceiver,
  resolveNestedReceiverBase,
  resolveNestedReceiverChain,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('nested-receiver-base');

function pickSymbolLeaf(adapter, prog) {
  const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
  return adapter.pickPath(prog, type, p => p.node.computed
    && p.node.key?.type === 'MemberExpression' && p.node.key.object?.name === 'Symbol');
}

// --- resolveNestedReceiverChain ---

// single hop: one plain key between the leaf and the declarator
runBoth('chain/single hop', 'const { inner: { [Symbol.iterator]: it } } = obj;', (adapter, prog, lbl) => {
  const chain = resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog));
  check(`${ lbl } root`, chain?.root?.name, 'obj');
  checkDeep(`${ lbl } keys`, chain?.keys, ['inner']);
});

// two hops keep source order
runBoth('chain/two hops ordered', 'const { a: { b: { [Symbol.iterator]: it } } } = obj;', (adapter, prog, lbl) => {
  checkDeep(`${ lbl } keys`, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog))?.keys, ['a', 'b']);
});

// an effectful init wrapper declines: the extraction discards the init, so a write or an
// SE prefix in it must keep the walk out (only PURE wrappers peel)
runBoth('chain/chain-assign init declines', 'let w; const { inner: { [Symbol.iterator]: it } } = (w = obj);', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog)), null);
});
runBoth('chain/seq-prefix init declines', 'const { inner: { [Symbol.iterator]: it } } = (se(), obj);', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog)), null);
});

// a computed hop key is unwalkable
runBoth('chain/computed hop declines', 'const { [k]: { [Symbol.iterator]: it } } = obj;', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog)), null);
});

// a leaf directly under the declarator has no hop chain to extract through
runBoth('chain/hopless leaf declines', 'const { [Symbol.iterator]: it } = obj;', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog)), null);
});

// a member-expression init is no identifier root: without the sole-read contract nothing may spell it
runBoth('chain/member init declines', 'const { inner: { [Symbol.iterator]: it } } = a.b;', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog)), null);
});

// --- a root the source COMPUTES: admitted only where the extraction is its sole reader ---

// a call / `new` / member-off-a-user-object / `this` root walks under `soleSlots` - the declarator
// dies whole with the claim, so the root is evaluated exactly once, as the source evaluates it
for (const [id, init, type] of [
  ['call', 'mk()', 'CallExpression'],
  ['new', 'new C()', 'NewExpression'],
  ['user member', 'holder.p', 'MemberExpression'],
]) {
  runBoth(`chain/opaque ${ id } root walks under sole slots`, `const { inner: { [Symbol.iterator]: it } } = ${ init };`, (adapter, prog, lbl) => {
    const chain = resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog), { soleSlots: true });
    check(`${ lbl } root`, chain?.root?.type, type);
    checkDeep(`${ lbl } keys`, chain?.keys, ['inner']);
  });
}
runBoth('chain/this root walks under sole slots', 'function f() { const { inner: { [Symbol.iterator]: it } } = this; }', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog), { soleSlots: true })?.root?.type, 'ThisExpression');
});

// ... a leaf sibling rides the same single read (the twin evaluates the root once into its memo)
runBoth('chain/opaque root keeps leaf siblings', 'const { inner: { [Symbol.iterator]: it, other } } = mk();', (adapter, prog, lbl) => {
  const chain = resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog), { soleSlots: true, allowLeafSiblings: true });
  check(lbl, chain?.root?.type, 'CallExpression');
});

// ... but a HOST-level sibling is a second reader of the root, which only an identifier affords
runBoth('chain/opaque root declines beside a host sibling', 'const { inner: { [Symbol.iterator]: it }, keep } = mk();', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog), { soleSlots: true }), null);
});
runBoth('chain/identifier root keeps a host sibling', 'const { inner: { [Symbol.iterator]: it }, keep } = obj;', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog), { soleSlots: true })?.root?.name, 'obj');
});

// ... and without the sole-read contract an opaque root stays out entirely
runBoth('chain/opaque root declines without sole slots', 'const { inner: { [Symbol.iterator]: it } } = mk();', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog)), null);
});

// a LITERAL root is the pairing walk's (it reads through to the element) - not an opaque root
runBoth('chain/literal root declines', 'const { inner: { [Symbol.iterator]: it } } = { inner: obj };', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog), { soleSlots: true }), null);
});

// a nav INTO the built-in namespace UNFOLDS onto its identifier root, its hops joining the keys:
// `{ inner: ... } = globalThis.Array` walks as `{ Array: { inner: ... } } = globalThis`
runBoth('chain/built-in nav root unfolds', 'const { inner: { [Symbol.iterator]: it } } = globalThis.Array;', (adapter, prog, lbl) => {
  const chain = resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog), { soleSlots: true });
  check(`${ lbl } root`, chain?.root?.name, 'globalThis');
  checkDeep(`${ lbl } keys`, chain?.keys, ['Array', 'inner']);
  check(`${ lbl } spelling is the identifier`, chain?.rootSpelling, chain?.root);
});

// ... unless the WHOLE nav still names a built-in surface - that shape is the flatten's, not this walk's
runBoth('chain/built-in surface nav declines', 'const { prototype: { [Symbol.iterator]: it } } = globalThis.Array;', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog), { soleSlots: true }), null);
});
runBoth('chain/optional member root declines', 'const { inner: { [Symbol.iterator]: it } } = holder?.p;', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog), { soleSlots: true }), null);
});

// an assignment host is outside the walk's contract
runBoth('chain/assignment host declines', 'let it; ({ inner: { [Symbol.iterator]: it } } = obj);', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog)), null);
});

// an inner default changes value capture
runBoth('chain/inner default declines', 'const { inner: { [Symbol.iterator]: it } = {} } = obj;', (adapter, prog, lbl) => {
  check(lbl, resolveNestedReceiverChain(pickSymbolLeaf(adapter, prog)), null);
});

// --- resolveNestedReceiverBase ---

// the ONE adapter hook the mutation helpers consult is `isMutatedStatic`: a mutated global
// SLOT is spelled `('globalThis', name)` through it, so the stub carries just that surface
const PURE = {
  self: { entry: 'self', hintName: 'self' },
  globalThis: { entry: 'global-this', hintName: 'globalThis' },
  Map: { entry: 'map/constructor', hintName: 'Map' },
};
function stubAdapter(mutatedStatics = []) {
  return { isMutatedStatic: (object, key) => mutatedStatics.some(([o, k]) => o === object && k === key) };
}
function base(args) {
  return resolveNestedReceiverBase({ resolveGlobalPolyfill: name => PURE[name] ?? null, ...args });
}

// a bound root reads raw whatever its name - even one shadowing a pure-resolvable global
checkDeep('base/bound proxy-named root reads raw', base({ rootName: 'self', keys: ['inner'], bound: true, adapter: stubAdapter() }), { name: 'self', path: ['inner'] });

// an unbound user root reads raw through its own name
checkDeep('base/user root reads raw', base({ rootName: 'obj', keys: ['inner'], adapter: stubAdapter() }), { name: 'obj', path: ['inner'] });

// a pristine proxy root with a pure entry substitutes it
checkDeep('base/pristine self substitutes pure', base({ rootName: 'self', keys: ['inner'], adapter: stubAdapter() }), { pure: PURE.self, path: ['inner'] });

// a pristine proxy root without one stays bare
checkDeep('base/pristine window stays bare', base({ rootName: 'window', keys: ['inner'], adapter: stubAdapter() }), { name: 'window', path: ['inner'] });

// a MUTATED proxy root holds the user's replacement - no extraction base at all
check('base/mutated proxy root declines', base({ rootName: 'self', keys: ['inner'], adapter: stubAdapter([['globalThis', 'self']]) }), null);

// a pristine proxy HOP is pure navigation and drops
checkDeep('base/pristine proxy hop drops', base({ rootName: 'globalThis', keys: ['self', 'inner'], adapter: stubAdapter() }), { pure: PURE.globalThis, path: ['inner'] });

// an all-proxy chain collapses onto the root's own pure import
checkDeep('base/all-proxy chain collapses', base({ rootName: 'globalThis', keys: ['self'], adapter: stubAdapter() }), { pure: PURE.globalThis, path: [] });

// ... and declines when that root has no pure entry
check('base/all-proxy chain without root pure declines', base({ rootName: 'window', keys: ['self'], adapter: stubAdapter() }), null);

// a mutated proxy HOP is the user's replacement - it stays a raw key, not pure navigation
checkDeep('base/mutated proxy hop stays a key',
  base({ rootName: 'globalThis', keys: ['self', 'inner'], adapter: stubAdapter([['globalThis', 'self']]) }),
  { pure: PURE.globalThis, path: ['self', 'inner'] });

// a missing-able ctor hop under a proxy root reads through its pure constructor
checkDeep('base/ctor hop substitutes pure', base({ rootName: 'globalThis', keys: ['Map', 'x'], adapter: stubAdapter() }), { pure: PURE.Map, path: ['x'] });

// ... unless that ctor slot is mutated - the raw proxy member keeps the user's shim
checkDeep('base/mutated ctor hop reads raw proxy member',
  base({ rootName: 'globalThis', keys: ['Map', 'x'], adapter: stubAdapter([['globalThis', 'Map']]) }),
  { pure: PURE.globalThis, path: ['Map', 'x'] });

// an unbound ctor ROOT reads through its pure constructor
checkDeep('base/ctor root substitutes pure', base({ rootName: 'Map', keys: ['x'], adapter: stubAdapter() }), { pure: PURE.Map, path: ['x'] });

// a root with no NAME (the chain walk's call / `new` / member root) is the caller's to spell:
// the answer is the path alone
checkDeep('base/nameless root answers the path',
  base({ rootName: undefined, keys: ['inner'], adapter: stubAdapter() }), { name: null, path: ['inner'] });

// --- the trailing STATIC: a nav ending on a polyfillable static reads that static's ponyfill ---

const OF = { entry: 'array/of', hintName: 'Array$of' };
function staticOf(ctor, key) {
  return ctor === 'Array' && key === 'of' ? OF : null;
}

// off a bare ctor root and through a proxy root alike, whether or not the ctor has a pure of its own
checkDeep('base/static off ctor root',
  base({ rootName: 'Array', keys: ['of'], adapter: stubAdapter(), resolveStaticPolyfill: staticOf }), { pure: OF, path: [], static: true });
checkDeep('base/static through proxy root',
  base({ rootName: 'globalThis', keys: ['Array', 'of'], adapter: stubAdapter(), resolveStaticPolyfill: staticOf }), { pure: OF, path: [], static: true });

// a key the resolver does not name keeps the ctor / raw answer
checkDeep('base/non-static key keeps the raw read',
  base({ rootName: 'Array', keys: ['prototype'], adapter: stubAdapter(), resolveStaticPolyfill: staticOf }), { name: 'Array', path: ['prototype'] });
checkDeep('base/ctor pure wins where no static answers',
  base({ rootName: 'Map', keys: ['x'], adapter: stubAdapter(), resolveStaticPolyfill: staticOf }), { pure: PURE.Map, path: ['x'] });

// a mutated static slot keeps the user's own value on the raw read, and so does a mutated ctor slot
checkDeep('base/mutated static stays raw',
  base({ rootName: 'Array', keys: ['of'], adapter: stubAdapter([['Array', 'of']]), resolveStaticPolyfill: staticOf }), { name: 'Array', path: ['of'] });
checkDeep('base/mutated ctor hop stays raw through the proxy',
  base({ rootName: 'globalThis', keys: ['Array', 'of'], adapter: stubAdapter([['globalThis', 'Array']]), resolveStaticPolyfill: staticOf }),
  { pure: PURE.globalThis, path: ['Array', 'of'] });

// a caller that asks no static question gets none - the synth passthrough answers for keys its plan
// already judged
checkDeep('base/no static resolver, no static answer',
  base({ rootName: 'Array', keys: ['of'], adapter: stubAdapter() }), { name: 'Array', path: ['of'] });

// --- resolveNestedDestructureReceiver: the memo belongs to the plugin INSTANCE, not the node ---

// the receiver verdict is method- and adapter-dependent, so a node-keyed memo lets a second plugin
// instance over ONE tree replay the first one's answer. the direction that matters is the unsafe
// one - a pure instance inheriting usage-global's "inject if it might be needed" for a rewrite that
// may only be made on certainty - so the two adapters here differ in exactly what they may resolve
{
  function nestedAdapter(mutatedProxySlot) {
    return {
      method: 'usage-global',
      isStringLiteral(node) { return node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'); },
      getStringValue(node) { return node.value; },
      hasBinding(scope, name) { return !!scope?.getBinding?.(name); },
      getBinding(scope, name) { return scope?.getBinding?.(name) ?? null; },
      getBindingNodeType(scope, name) { return scope?.getBinding?.(name)?.path?.node?.type ?? null; },
      isMutatedStatic(object, key) { return object === 'globalThis' && key === mutatedProxySlot; },
    };
  }
  runBoth('nested receiver/one tree, two instances answer apart',
    'const { Array: { from } } = globalThis;', (adapter, prog, lbl) => {
      const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
      const outer = adapter.pickPath(prog, type, p => p.node.key?.name === 'Array');
      // the pristine instance answers first and seeds any memo behind the call
      check(`${ lbl } pristine instance`, resolveNestedDestructureReceiver(outer, nestedAdapter(null)), 'Array');
      // ... and an instance for which the file overwrote that very slot must NOT be served it
      check(`${ lbl } mutated-slot instance`, resolveNestedDestructureReceiver(outer, nestedAdapter('Array')), null);
      // the first instance keeps its own answer after the second asked
      check(`${ lbl } pristine instance again`, resolveNestedDestructureReceiver(outer, nestedAdapter(null)), 'Array');
    });
}

finish();
