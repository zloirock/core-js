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
  inlineCallReturnExpression,
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

// walk a chain root to its underlying CallExpression. direct call (`f().X`) returns the
// call node; MemberExpression chain (`(() => globalThis)().Array`, `globalThis.self.Array`)
// descends through `.object` peeling parens until either a CallExpression surfaces or the
// chain bottoms on a non-call (Identifier / proxy-global / etc.). returns null otherwise -
// caller uses it to probe `inlineCallHasObservableEffects` for SE-preservation
function findChainRootCallExpression(node) {
  let cur = node;
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    cur = unwrapParens(cur.object);
  }
  return cur?.type === 'CallExpression' || cur?.type === 'OptionalCallExpression' ? cur : null;
}

function buildMemberMeta({ node, scope, adapter, path }) {
  // collect side effects from both the receiver and the computed-key so a polyfill
  // replacement on this MemberExpression (which discards the whole subtree) can re-emit
  // them via a SequenceExpression wrap in the plugin's emission path
  const sideEffects = [];
  // `obj` is then passed to `resolveObjectName` which calls `unwrapParens` again - idempotent
  // for already-unwrapped Identifier / MemberExpression (O(1) no-op), so the apparent duplicate
  // walk is cheap; avoids threading an "already-unwrapped" flag through every caller.
  // receiver-SE comes first (source eval order). the emit decides how to replay it: peel +
  // prepend (non-optional) vs the null-guard memoize (optional, where it re-runs) - in the
  // memoize case the suppress path drops this prefix and folds only the trailing key-SE
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
    const { value: classifyTarget, outer: chainAssignOuter } = peelChainAssignment(obj);
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
    // really is a recognised constructor); unresolved calls fall through unchanged.
    // IIFE-rooted MemberExpression chain (`(() => globalThis)().Array.from(x)`): walk the
    // chain down to the root CallExpression and probe its prefix-SE the same way - without
    // the chain walk, IIFE-with-prefix inside a proxy-global chain silently drops its setup
    // when the receiver IS a chain-assignment (`(a = IIFE()).resolve(1)`), the emitter's
    // `prependChainAssignmentEffect` already preserves the whole rhs (including any inline
    // call) by re-emitting the outermost `=` expression. pushing the inner root-call into
    // sideEffects here would duplicate it - the SequenceExpression wrap would emit the
    // IIFE both as part of `(a = IIFE())` and as a standalone receiver re-eval. only
    // probe `findChainRootCallExpression` when there's no chain-assign wrapper.
    if (objectName && !chainAssignOuter) {
      const rootCall = findChainRootCallExpression(classifyTarget);
      if (rootCall && inlineCallHasObservableEffects({ callNode: rootCall, scope, adapter, path })) {
        sideEffects.push(rootCall);
      }
    }
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
    // usage-pure rewrites the WHOLE member-expression (`obj[globalThis.Symbol.iterator]` ->
    // `_getIteratorMethod(obj)`), so a proxy-global root inside the computed key must be
    // subsumed too - otherwise the inner identifier visitor queues a parallel `globalThis ->
    // _globalThis` rewrite that overlaps the outer text replacement and crashes the queue.
    // usage-global keeps the member-expression, so the proxy-global stays visible and earns
    // its own polyfill (same mode split as `handleBinaryIn`)
    if (suppressProxyGlobals) markSubsumedProxyChain(symbolKey.ref.unwrapped, handledObjects, scope, adapter, path);
    // re-emit side effects in source eval order: receiver first, then computed-key
    // (`(recv(), arr)[Symbol[(key(), 'iterator')]]`). the emit replays the receiver-SE by either
    // peeling + prepending (non-optional) or via the null-guard memoize (optional - where the
    // suppress path drops this prefix and folds only the key-SE), so collect both here in order
    const meta = { kind: 'property', object: null, key: symbolKey.key, placement: 'prototype' };
    const sideEffects = [];
    unwrapParensCollectingEffects(node.object, sideEffects);
    sideEffects.push(...symbolKey.sideEffects);
    if (sideEffects.length) meta.sideEffects = sideEffects;
    return meta;
  }
  const meta = buildMemberMeta({ node, scope, adapter, path });
  // only mark when we actually resolved a receiver: meta.object === null means
  // `resolveObjectName` couldn't classify the receiver (unknown local, complex expression)
  // and the receiver identifier-visitor may still need to polyfill it as a standalone global
  if (meta?.object) markHandledObjects(node, handledObjects, suppressProxyGlobals, scope, adapter, path);
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
export function handleBinaryIn({ node, scope, adapter, handledObjects, isEntryAvailable, suppressProxyGlobals, path }) {
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
        // proxy-global LHS (`globalThis.Symbol.iterator in x`): usage-pure rewrites the whole
        // BinaryExpression to `_isIterable(x)`, subsuming the chain, so the leaf `globalThis`
        // identifier must not trigger its own polyfill - else unplugin's transform-queue can't
        // compose the inner `globalThis`-replacement into the outer's eliminated-needle content.
        // usage-global keeps the `in` text verbatim, so the proxy-global leaf survives at runtime
        // and must still earn its own polyfill (`es.global-this` / `web.self` / `web.window`);
        // suppressing it there would UNDER-inject and ReferenceError in strict-env / IE11. same
        // mode split as `handleMemberExpressionNode`
        if (suppressProxyGlobals) markSubsumedProxyChain(ref.unwrapped, handledObjects, scope, adapter, path);
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
  // is a top-level entry point; downstream recursion through `resolveObjectName` reuses it.
  // peel a SequenceExpression tail off the RHS (`'k' in (fn(), Object)`): the `in` detection
  // only decides whether to inject (the expression is never rewritten), so the SE prefix runs
  // as written at runtime and the tail names the object to classify
  let rightObject = unwrapParens(node.right);
  if (rightObject?.type === 'SequenceExpression') rightObject = unwrapParens(rightObject.expressions.at(-1));
  if (resolvedLeft) {
    const objectName = resolveObjectName({ objectNode: rightObject, scope, adapter, seen: new Set(), path });
    if (objectName) {
      const placement = isStaticPlacement(objectName);
      if (placement) return { kind: 'in', key: resolvedLeft, object: objectName, placement };
    }
  }
  return null;
}

// returns { key: 'Symbol.xxx', ref: { raw, unwrapped }, sideEffects } so the caller can mark
// handledObjects without re-walking the unwrap chain. `sideEffects` aggregates SE-preceding
// elements peeled from `node.property` outer wrappers and the Symbol[X] computed-key argument -
// without that channel `recv[(fn(), Symbol)[(g(), 'iterator')]]` would silently drop both calls
// after the polyfill rewrite subsumes the member expression
function resolveComputedSymbolKey({ node, scope, adapter, path }) {
  if (!node.computed) return null;
  const sideEffects = [];
  const prop = unwrapParensCollectingEffects(node.property, sideEffects);
  if (prop?.type !== 'MemberExpression' && prop?.type !== 'OptionalMemberExpression') return null;
  const ref = asSymbolRef({ node: prop.object, scope, adapter, path });
  if (!ref) return null;
  const keyNode = prop.computed
    ? unwrapParensCollectingEffects(prop.property, sideEffects) : prop.property;
  const name = resolveKey({ node: keyNode, computed: prop.computed, scope, adapter, path });
  // reject `arr[Symbol[Symbol.X]]`: resolveKey returns `'Symbol.X'` when the inner key is
  // itself a Symbol.X form (well-known symbol VALUE used as bracket key). at runtime this
  // is `arr[<well-known-symbol-value>]` which doesn't match the `Symbol.X` polyfill dispatch
  // shape - Symbol constructor itself doesn't carry well-known-symbol-valued properties
  if (!name || name.startsWith('Symbol.')) return null;
  return { key: `Symbol.${ name }`, ref, sideEffects };
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
function markSubsumedProxyChain(node, handledObjects, scope, adapter, path) {
  let current = peelMarkedWrappers(node, handledObjects);
  while (current && (current.type === 'MemberExpression' || current.type === 'OptionalMemberExpression')) {
    handledObjects.add(current);
    current = peelMarkedWrappers(current.object, handledObjects);
  }
  // shadow detection through `adapter.hasBinding(scope, name, path)` matches the rest of
  // members.js - raw `scope.getBinding` misses TS-runtime bindings (declare const X /
  // namespace X) that estree-toolkit's scope tracker doesn't register but the polyfill
  // shadow rule still needs to honor. without it, `declare const globalThis: any;
  // globalThis.Symbol.iterator in x` would still mark the leaf as handled-global and
  // suppress the legitimate user-shadow emit
  if (current?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(current.name)
    && !(adapter ? adapter.hasBinding(scope, current.name, path) : scope?.getBinding?.(current.name))) {
    handledObjects.add(current);
  }
}

// walk a proxy-global MemberExpression chain down to its leaf identifier, marking every
// link AND the leaf so unplugin's text-emit doesn't queue parallel rewrites that overlap
// an outer polyfill replacement. returns the unwalked node (typically a CallExpression
// for IIFE-rooted chains, terminator otherwise) so callers can chain further marking
function markChainLinksAndProxyLeaf(node, handledObjects) {
  let cur = unwrapParens(node);
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    handledObjects.add(cur);
    cur = unwrapParens(cur.object);
  }
  if (cur?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(cur.name)) handledObjects.add(cur);
  return cur;
}

// IIFE-rooted receiver - mark the call node and the inner proxy-global identifier so
// unplugin's text-emit doesn't queue a parallel `globalThis -> _globalThis` rewrite that
// overlaps the outer polyfill replacement (`_Array$from([...])`). babel-plugin's AST
// mutation tolerates the overlap; the symmetric fix suppresses the inner visit on both
// adapters. fresh `seen` Set is required by `resolveInlineCalleeFunction` for cycle
// protection even though no recursion is possible at this call site.
// observable-SE bail: when the IIFE has prefix statements (`() => { setup++; return X; }`),
// `buildMemberMeta` pushes the IIFE call into `meta.sideEffects` and the outer polyfill
// emit re-emits the call source via a SequenceExpression wrap. the inner identifier
// SURVIVES in the output text, so its own polyfill (e.g. `globalThis -> _globalThis`)
// must still fire. skip marking in this case so the Identifier visit goes through.
// loop unrolls nested IIFE (`(() => (() => globalThis)())()`): when the inlined return is
// itself a CallExpression, continue marking the inner IIFE the same way
function markInlinedProxyGlobalRoot({ callNode, scope, adapter, path, handledObjects }) {
  let current = callNode;
  while (current?.type === 'CallExpression' || current?.type === 'OptionalCallExpression') {
    if (inlineCallHasObservableEffects({ callNode: current, scope, adapter, path })) return;
    const inlined = inlineCallReturnExpression({ callNode: current, scope, adapter, path, seen: new Set() });
    if (!inlined) return;
    handledObjects.add(current);
    current = markChainLinksAndProxyLeaf(inlined, handledObjects);
  }
}

// mark handled objects after processing a MemberExpression meta
// suppresses duplicate Identifier visitor firing for the object part
// called when `buildMemberMeta` returned truthy meta (receiver + key resolved). even when
// `meta.object === null` (receiver Identifier didn't match `isStaticPlacement` - bound local
// variable), marking the receiver is correct: a local binding shouldn't produce a polyfill
// import via the identifier visitor, so suppression is the right behaviour
// findProxyGlobal only matches a LITERAL proxy-global root (`globalThis.Map`). a root bound to a
// proxy-global through an alias (`var g = globalThis; g.Map`) is NOT matched, so the intermediate
// `g.Map` constructor member stays unmarked and unplugin queues a `g.Map -> _Map` rewrite that
// overlaps the outer `_Map$groupBy` substitution -> transform-queue composition crash. resolve the
// chain root's binding so an aliased proxy-global root is recognised like a literal one
function chainRootResolvesToProxyGlobal({ node, scope, adapter, path }) {
  if (!scope || !adapter) return false;
  let obj = unwrapParens(node);
  let depth = 0;
  while (obj.type === 'MemberExpression' || obj.type === 'OptionalMemberExpression') {
    if (++depth > MAX_KEY_DEPTH) return false;
    obj = unwrapParens(obj.object);
  }
  if (obj.type !== 'Identifier') return false;
  const resolved = resolveObjectName({ objectNode: obj, scope, adapter, path });
  // null / undefined resolved name is not in the set, so no explicit nullish guard needed
  return POSSIBLE_GLOBAL_OBJECTS.has(resolved);
}

function markHandledObjects(node, handledObjects, suppressProxyGlobals, scope, adapter, path) {
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
    && (findProxyGlobal(current) || chainRootResolvesToProxyGlobal({ node: current, scope, adapter, path }))) {
    handledObjects.add(current);
    current = unwrapParens(current.object);
  }
  // IIFE-rooted chain (`(() => globalThis)().self.Map.prototype.has`): the chain bottoms
  // out on a CallExpression that `resolveProxyGlobalRoot` inlines to a proxy-global identifier.
  // `findProxyGlobal` returns null for IIFE roots (it only validates bare-Identifier roots),
  // so the loop above doesn't enter. walk down the remaining MemberExpression links, marking
  // each whose property is a proxy-global key (`.self`, `.window`) - those intermediate hops
  // would otherwise queue parallel substitutions overlapping the outer constructor rewrite.
  // non-proxy keys (`.Map`, `.prototype`) deliberately stay unmarked so the constructor
  // member visit fires its own substitution and stays the single source of the receiver
  // replacement. then delegate to `markInlinedProxyGlobalRoot` for the IIFE + inner identifier
  if (scope && adapter) {
    while (current?.type === 'MemberExpression' || current?.type === 'OptionalMemberExpression') {
      const propName = current.computed ? null : current.property?.name;
      if (!propName || !POSSIBLE_GLOBAL_OBJECTS.has(propName)) break;
      handledObjects.add(current);
      current = unwrapParens(current.object);
    }
    if (current?.type === 'CallExpression' || current?.type === 'OptionalCallExpression') {
      markInlinedProxyGlobalRoot({ callNode: current, scope, adapter, path, handledObjects });
    }
  }
}
