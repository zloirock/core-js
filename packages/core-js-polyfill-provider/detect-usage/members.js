// member-expression resolution + `key in obj` BinaryExpression handler. produces meta for
// the polyfill resolver (kind / object / key / placement) and seeds `handledObjects` so
// downstream identifier visits don't double-process subsumed receiver chains
import { POSSIBLE_GLOBAL_OBJECTS, symbolKeyToEntry } from '../helpers/class-walk.js';
import {
  asSymbolRef,
  bindingSymbolKey,
  enterIdentifierBindingFollow,
  findProxyGlobal,
  inlineCallHasObservableEffects,
  isStaticPlacement,
  isTransparentWrapper,
  MAX_KEY_DEPTH,
  peelChainAssignment,
  peelReceiverSequenceTail,
  resolveKey,
  resolveObjectName,
  unwrapParens,
  unwrapParensCollectingEffects,
} from './resolve.js';

// direct `X.prototype.Y` -> instance-method meta on X. indirect alias (`const P = X.prototype`
// / `const { prototype: P } = X`) is picked up by type engine's `resolvePrototypeAsInstance`
// via `enhanceMeta`, not here
function tryBuildPrototypeMeta({ obj, key, scope, adapter, path }) {
  if (obj.type !== 'MemberExpression' && obj.type !== 'OptionalMemberExpression') return null;
  if (resolveKey({ node: obj.property, computed: obj.computed, scope, adapter, path }) !== 'prototype') return null;
  const protoName = resolveObjectName({ objectNode: obj.object, scope, adapter, path });
  return protoName ? { kind: 'property', object: protoName, key, placement: 'prototype' } : null;
}

function buildMemberMeta({ node, scope, adapter, path }) {
  // collect side effects from both the receiver and the computed-key so a polyfill
  // replacement on this MemberExpression (which discards the whole subtree) can re-emit
  // them via a SequenceExpression wrap in the plugin's emission path
  const sideEffects = [];
  // `obj` is then passed to `resolveObjectName` which calls `unwrapParens` again - idempotent
  // for already-unwrapped Identifier / MemberExpression (O(1) no-op), so the apparent duplicate
  // walk is cheap; avoids threading an "already-unwrapped" flag through every caller
  const obj = unwrapParensCollectingEffects(node.object, sideEffects);
  // `this.#foo` / `obj.#field` - private field access; not a candidate for any polyfill
  // table (keys never carry `#` prefix). skip explicitly so downstream resolver scans
  // don't chase a doomed key lookup
  if (!node.computed && node.property?.type === 'PrivateIdentifier') return null;
  // computed keys may arrive wrapped in TS constructs (`obj[(k) as any]`, `obj[k!]`) -
  // resolveKey can't walk identifier-alias chain through a TS expression wrapper root
  const key = node.computed
    ? resolveKey({
      node: unwrapParensCollectingEffects(node.property, sideEffects), computed: true, scope, adapter, path,
    })
    : node.property.name || node.property.value;
  if (!key || key === 'prototype') return null;
  let meta = tryBuildPrototypeMeta({ obj, key, scope, adapter, path });
  if (!meta) {
    // chain-assignment receiver `(a = Array).from(...)`: peel `=` chain so receiver
    // classification sees the rhs-most constructor (`Array`). don't push to sideEffects
    // here - instance dispatch captures the assignment via memoize `_ref = (a = Array)`,
    // and static dispatch picks up the outermost assignment separately at emission time
    const { value: classifyTarget } = peelChainAssignment(obj);
    const objectName = resolveObjectName({ objectNode: classifyTarget, scope, adapter, path });
    // bail for plugin-injected polyfill bindings (`_flatMaybeArray`, `_Map`, ...) - they carry
    // `polyfillHint` and re-detection would chase the polyfill itself. user imports
    // (`import { items } from './data'`) have NO polyfillHint and must fall through so the
    // Maybe-variant `instance/X` polyfill emits for unknown receiver types
    if (!objectName && classifyTarget.type === 'Identifier') {
      const binding = adapter.getBinding(scope, classifyTarget.name);
      if (binding?.polyfillHint) return null;
    }
    const placement = objectName ? isStaticPlacement(objectName) : 'prototype';
    meta = { kind: 'property', object: objectName, key, placement };
    // inline-resolved receiver call (`(() => Promise)()`, `f()` where `const f = () => Promise`)
    // carries through to the polyfill emit if the body block has a prefix expression statement
    // (`() => { calls++; return Promise; }`). without preserving the original call here, emit
    // would replace `k().resolve(3)` with `_Promise$resolve(3)` and silently drop `calls++`.
    // the original call node is pushed to sideEffects so the SequenceExpression wrap re-emits
    // it: `(k(), _Promise$resolve(3))`. only fires when objectName resolved (i.e. the receiver
    // really is a recognised constructor); unresolved calls fall through unchanged
    if (objectName && (classifyTarget.type === 'CallExpression' || classifyTarget.type === 'OptionalCallExpression')
      && inlineCallHasObservableEffects({ callNode: classifyTarget, scope, adapter, path })) sideEffects.push(classifyTarget);
  }
  if (sideEffects.length) meta.sideEffects = sideEffects;
  return meta;
}

// `path` (optional) - the visitor path of `node`. threaded through to adapter.hasBinding so
// TS-runtime shadow detection (`enum X {}` / `namespace X {}` / `import X = require()`)
// inside a StaticBlock anchors at the actual visitor site instead of the enclosing
// scope owner. estree-toolkit reports `scope.path = ClassDeclaration` for code inside a
// StaticBlock since it doesn't register StaticBlock as a separate scope; without `path`,
// `findTSRuntimeBindingInPath` walks UP from ClassDeclaration and never enters the
// StaticBlock body, missing local enum/namespace shadows. babel's scope tracker does
// anchor at StaticBlock so it works without path - the threaded form is a no-op for it
export function handleMemberExpressionNode({ node, scope, adapter, handledObjects, suppressProxyGlobals, path }) {
  const symbolKey = resolveComputedSymbolKey({ node, scope, adapter, path });
  if (symbolKey) {
    // mark both positions so neither the member-visitor (outer MemberExpression.object) nor
    // the identifier-visitor (unwrapped Identifier) re-enters this node. `asSymbolRef`
    // already walked the `unwrapParens` chain and confirmed the binding guard
    handledObjects.add(symbolKey.ref.raw);
    handledObjects.add(symbolKey.ref.unwrapped);
    return { kind: 'property', object: null, key: symbolKey.key, placement: 'prototype' };
  }
  const meta = buildMemberMeta({ node, scope, adapter, path });
  // only mark when we actually resolved a receiver: meta.object === null means
  // `resolveObjectName` couldn't classify the receiver (unknown local, complex expression)
  // and the receiver identifier-visitor may still need to polyfill it as a standalone global
  if (meta?.object) markHandledObjects(node, handledObjects, suppressProxyGlobals);
  return meta;
}

// `resolveKey` can fold StringLiteral / TemplateLiteral / `+` concat to the string
// `'Symbol.X'`, but none of those are the well-known symbol. this predicate rejects
// string-sourced keys so `'Symbol.iterator' in Array` isn't miscategorised as an
// is-iterable check. parallel to resolveKey's Identifier / MemberExpression branches
// minus the string-folding cases
function isSymbolSourcedKey({ node, scope, adapter, seen, path, depth = 0 }) {
  if (depth > MAX_KEY_DEPTH) return false;
  node = unwrapParens(node);
  const { type } = node;
  // string-folded sources - plain strings, not the symbol
  if (adapter.isStringLiteral(node) || type === 'TemplateLiteral'
    || (type === 'BinaryExpression' && node.operator === '+')) return false;
  // Symbol[.X] direct / via chained proxy-global - canonical symbol-ref shape.
  // also verify the property reads a well-known symbol name (not `Symbol.someUserKey`):
  // well-known symbols live under specific names exposed by `symbolKeyToEntry`; random
  // dot-access on Symbol (`Symbol.foo`) resolves to `undefined` at runtime and should
  // not trigger symbol-routed polyfill dispatch.
  // for `Symbol[key]` with statically-resolvable computed key - resolve via `resolveKey`
  // and validate the resulting name. when the key isn't statically resolvable (dynamic
  // expression), return true conservatively: we know the shape is Symbol-indexed, even
  // if the specific well-known name is unknown - downstream callers rely on this to
  // avoid over-eliminating polyfill dispatch, and `resolveKey` pairing in the caller
  // filters on the string form anyway
  if (type === 'MemberExpression' || type === 'OptionalMemberExpression') {
    if (!asSymbolRef({ node: node.object, scope, adapter, seen: new Set(seen), path })) return false;
    if (!node.computed && node.property?.type === 'Identifier') {
      return symbolKeyToEntry(`Symbol.${ node.property.name }`) !== null;
    }
    if (node.computed) {
      const name = resolveKey({
        node: node.property, computed: true, scope, adapter, seen: new Set(seen), path, depth: depth + 1,
      });
      if (name !== null) return symbolKeyToEntry(`Symbol.${ name }`) !== null;
    }
    return true;
  }
  if (type !== 'Identifier') return false;
  const entry = enterIdentifierBindingFollow({ node, scope, adapter, seen });
  if (!entry) return false;
  // alias indirection (`const k = Symbol.iterator; k in X`) else plugin-managed binding
  // (`polyfillHint` in-place mutation / real `core-js/.../symbol/X` import, incl.
  // user-aliased polyfill packages from `additionalPackages`)
  if (entry.init) return isSymbolSourcedKey({
    node: entry.init, scope, adapter, seen: entry.nextSeen, path, depth: depth + 1,
  });
  return bindingSymbolKey(entry.binding, adapter.packages) !== null;
}

// Symbol.iterator -> is-iterable (replaces the whole BinaryExpression); others -> symbol/X (LHS only)
export function resolveSymbolInEntry(key) {
  if (key === 'Symbol.iterator') return { entry: 'is-iterable', hint: 'isIterable' };
  const entry = symbolKeyToEntry(key);
  if (!entry) return null;
  return { entry, hint: key.replace('.', '$') };
}

export function resolveSymbolIteratorEntry(node, parent) {
  const isCall = (parent?.type === 'CallExpression' || parent?.type === 'OptionalCallExpression')
    && parent.callee === node;
  return isCall && parent.arguments.length === 0 && !parent.optional ? 'get-iterator' : 'get-iterator-method';
}

// seeds `handledObjects` only for polyfillable Symbol.X. `isEntryAvailable`, when
// provided by the caller (plugin's `isEntryNeeded`), gates seeding on the actual entries
// map - non-existent entries (`Symbol.foo` -> synthetic `symbol/foo`) leave the `Symbol`
// identifier in place so it can still receive its constructor polyfill via the regular
// MemberExpression-fallback path. without the predicate (legacy callers), seed on the
// pure-string `symbolKeyToEntry` shape - older callers lose the fallback but stay
// behaviour-compatible
export function handleBinaryIn({ node, scope, adapter, handledObjects, isEntryAvailable, path }) {
  if (node.operator !== 'in') return null;
  const left = unwrapParens(node.left);
  // peel SequenceExpression-tail on the receiver: `(fn(), Symbol).iterator in obj`
  // should resolve to the symbol-in polyfill path same as bare `Symbol.iterator in obj`.
  // SE preceding-elements are preserved at emit time via `visitSymbolInLhsSe` walking
  // the original LHS subtree, so peeling here doesn't drop side-effects
  const ref = (left.type === 'MemberExpression' || left.type === 'OptionalMemberExpression')
    ? asSymbolRef({ node: peelReceiverSequenceTail(left.object), scope, adapter, path }) : null;
  if (ref) {
    const name = resolveKey({ node: left.property, computed: left.computed, scope, adapter, path });
    // nested `Symbol[Symbol.X]` - `resolveKey` already returns `Symbol.X`; double-prefixing
    // would build invalid `Symbol.Symbol.X`. user code (`Symbol[Symbol.iterator]` evaluates
    // to undefined regardless) is runtime-broken; bail rather than carry an invalid key
    if (name && !name.includes('.')) {
      const key = `Symbol.${ name }`;
      const inEntry = resolveSymbolInEntry(key);
      // gate seeding on actual rewrite viability. `resolveSymbolInEntry` only checks
      // string shape (`Symbol.foo` -> `symbol/foo`); `isEntryAvailable` consults the
      // resolved per-namespace entries map and rejects synthetic paths
      if (inEntry && (!isEntryAvailable || isEntryAvailable(inEntry.entry))) {
        handledObjects.add(node.left);
        handledObjects.add(left);
        handledObjects.add(ref.raw);
        handledObjects.add(ref.unwrapped);
        // proxy-global LHS (`globalThis.Symbol.iterator in x`) - the outer `_isIterable(x)`
        // rewrite subsumes the entire chain, so the leaf `globalThis` identifier must not
        // trigger its own polyfill. without this, unplugin's transform-queue fails to compose
        // the inner `globalThis`-replacement into the outer's eliminated-needle content
        markSubsumedProxyChain(ref.unwrapped, handledObjects, scope);
      }
      return { kind: 'in', key, object: null, placement: null, symbolSourced: true };
    }
  }
  // identifier bound to Symbol.X - `const k = Symbol.iterator; k in obj` works regardless of
  // object type. literal-string sources that happen to spell `Symbol.X` (`'Symbol.iterator'`,
  // `` `Symbol.iterator` ``, `'Symbol.' + 'iterator'`) are NOT symbol refs - `isSymbolSourcedKey`
  // filters them out; they fall through to the string-key branch below.
  // single-`.` shape filters out double-prefixed `Symbol.Symbol.X` from nested `Symbol[Symbol.X]`
  const resolvedLeft = resolveKey({ node: node.left, computed: true, scope, adapter, path });
  if (resolvedLeft?.startsWith('Symbol.') && !resolvedLeft.includes('.', 7)
    && isSymbolSourcedKey({ node: node.left, scope, adapter, path })) {
    return { kind: 'in', key: resolvedLeft, object: null, placement: null, symbolSourced: true };
  }
  // 'key' in Object - string key in static/global object. fresh `seen` Set because this
  // is a top-level entry point; downstream recursion through `resolveObjectName` reuses it
  if (resolvedLeft) {
    const objectName = resolveObjectName({ objectNode: node.right, scope, adapter, seen: new Set(), path });
    if (objectName) {
      const placement = isStaticPlacement(objectName);
      if (placement) return { kind: 'in', key: resolvedLeft, object: objectName, placement };
    }
  }
  return null;
}

// returns { key: 'Symbol.xxx', ref: { raw, unwrapped } } so the caller can mark handledObjects
// without re-walking the unwrap chain
function resolveComputedSymbolKey({ node, scope, adapter, path }) {
  if (!node.computed) return null;
  const prop = unwrapParens(node.property);
  if (prop?.type !== 'MemberExpression' && prop?.type !== 'OptionalMemberExpression') return null;
  const ref = asSymbolRef({ node: prop.object, scope, adapter, path });
  if (!ref) return null;
  const name = resolveKey({ node: prop.property, computed: prop.computed, scope, adapter, path });
  return name ? { key: `Symbol.${ name }`, ref } : null;
}

// walk the proxy-global chain at `node`, seeding every intermediate MemberExpression AND the
// leaf `globalThis`/`self`/`window` Identifier. used when an outer rewrite fully subsumes the
// chain (`handleBinaryIn`'s Symbol.X case) - without the leaf, the identifier visitor fires a
// parallel polyfill for `globalThis` that the text-transform queue can't compose into the
// outer's eliminated-needle replacement
// peel and record transparent wrappers (TS casts, parens) along the way. polyfill visitor
// lookups land on either form depending on the enclosing visitor, so marking both the wrapper
// and its unwrapped inner matches any of them
function peelMarkedWrappers(node, handledObjects) {
  while (node && isTransparentWrapper(node)) {
    handledObjects.add(node);
    node = node.expression;
  }
  return node;
}

// record the full proxy-global chain (including any wrappers at every level) so the outer
// rewrite that subsumes it doesn't re-fire on the leaves. handles `(globalThis as any).Symbol.iterator`
// and deeper nests like `(self as any)[(...)]` uniformly through `peelMarkedWrappers`.
// scope-aware leaf check: a user binding that shadows a known global (`function f(globalThis)
// { globalThis.Symbol.iterator in arr }`) must NOT be marked as handled - the local binding
// has its own value, and suppressing the polyfill here would silently drop a legitimate emit
function markSubsumedProxyChain(node, handledObjects, scope) {
  let current = peelMarkedWrappers(node, handledObjects);
  while (current && (current.type === 'MemberExpression' || current.type === 'OptionalMemberExpression')) {
    handledObjects.add(current);
    current = peelMarkedWrappers(current.object, handledObjects);
  }
  if (current?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(current.name) && !scope?.getBinding?.(current.name)) {
    handledObjects.add(current);
  }
}

// mark handled objects after processing a MemberExpression meta
// suppresses duplicate Identifier visitor firing for the object part
// called when `buildMemberMeta` returned truthy meta (receiver + key resolved). even when
// `meta.object === null` (receiver Identifier didn't match `isStaticPlacement` - bound local
// variable), marking the receiver is correct: a local binding shouldn't produce a polyfill
// import via the identifier visitor, so suppression is the right behaviour
function markHandledObjects(node, handledObjects, suppressProxyGlobals) {
  const obj = unwrapParens(node.object);
  if (obj.type === 'Identifier' && !POSSIBLE_GLOBAL_OBJECTS.has(obj.name)) {
    handledObjects.add(obj);
    return;
  }
  if (!suppressProxyGlobals) return;
  // walk down the proxy chain (`globalThis.Object`, `globalThis.self.Promise`, ...) and mark
  // every intermediate MemberExpression so the inner visitor doesn't re-process it. stop at
  // the proxy global leaf itself - it may need its own polyfill when the outer is not polyfilled.
  // usage-global intentionally does NOT suppress intermediate visits: chains like
  // `globalThis.self.Object.keys` rely on the `self` member visit to register `web.self`, which
  // is a real runtime dependency (bare `self` is undefined in workers / strict envs otherwise)
  let current = obj;
  while ((current.type === 'MemberExpression' || current.type === 'OptionalMemberExpression')
    && findProxyGlobal(current)) {
    handledObjects.add(current);
    current = unwrapParens(current.object);
  }
}
