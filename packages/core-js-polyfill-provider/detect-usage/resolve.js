// AST-pattern resolvers shared across detect-usage submodules. covers the core walk
// primitives (`unwrapParens`, `unwrapParensCollectingEffects`, `isStaticPlacement`),
// binding-to-global resolution (`resolveBindingToGlobal` and friends), and the high-level
// resolvers used by callers (`resolveKey`, `resolveObjectName`, `patternBindingName`,
// `findProxyGlobal`, `createSelfRefVarGuard`). also hosts Symbol-ref helpers
// (`resolvesToGlobalSymbol`, `asSymbolRef`) consumed by the members submodule
import { POSSIBLE_GLOBAL_OBJECTS, globalProxyMemberName, isProxyGlobalIdentifierNode, memberKeyName } from '../helpers/class-walk.js';
import { staticReceiverHint } from './globals.js';
import {
  isTopLevelThisContext,
  isDirectiveStatement,
  isReassignedBeyondDeclarator,
  isVarDeclaratorInLoopBody,
  kebabToCamel,
  mayHaveSideEffects,
  peelZeroArgIifeReturn,
  reachingReassignmentValueNode,
  reassignBailApplies,
  reassignmentBlocksGlobalResolve,
  reassignmentValueNodes,
  sequencePrefixWithSideEffects,
  singleQuasiString,
  singleReturnBodyExpression,
  synthSwapPropKey,
  TS_EXPR_WRAPPERS,
  varInitDominatesUsage,
} from '../helpers/ast-patterns.js';

// same ceiling as `resolve-node-type.MAX_DEPTH`; 10 is too low for cross-module alias chains.
// exported so cohort recursive walkers (`isSymbolSourcedKey` in members.js) share the bound
export const MAX_KEY_DEPTH = 64;

// transparent wrapper types - both unwrap modes peel them identically
const TRANSPARENT_WRAPPER_TYPES = new Set(['ParenthesizedExpression', 'ChainExpression']);

export function isTransparentWrapper(node) {
  return TRANSPARENT_WRAPPER_TYPES.has(node.type) || TS_EXPR_WRAPPERS.has(node.type);
}

// SequenceExpression bail mode: stop unwrapping when preceding elements carry side effects.
// caller can't preserve them (inner resolveKey recursion, handleBinaryIn) - keep sequence intact
export function unwrapParens(node) {
  while (node) {
    if (isTransparentWrapper(node)) {
      node = node.expression;
    } else if (node.type === 'SequenceExpression') {
      const preceding = node.expressions.slice(0, -1);
      if (preceding.some(mayHaveSideEffects)) break;
      node = node.expressions.at(-1);
    } else break;
  }
  return node;
}

// SequenceExpression collect mode: push side-effect preceding elements into `effects` for
// the caller to re-attach via a SequenceExpression wrap around the polyfill replacement
export function unwrapParensCollectingEffects(node, effects) {
  while (node) {
    if (isTransparentWrapper(node)) {
      node = node.expression;
    } else if (node.type === 'SequenceExpression') {
      for (const e of node.expressions.slice(0, -1)) if (mayHaveSideEffects(e)) effects.push(e);
      node = node.expressions.at(-1);
    } else break;
  }
  return node;
}

// instance-dispatch receiver peel: when the polyfill emit memoizes `path.node.object`
// into `_ref = X` AND prepends sideEffects (collected upstream by `unwrapParensCollectingEffects`),
// the SE preceding-elements would otherwise run TWICE - once in the assign, once in the
// prepended SE. peeling the AST receiver to the SE tail aligns it with what `obj` was at
// meta-build time so memoize captures only the unwrapped tail. shared between babel-compat's
// `replaceInstanceLike` (mutates path.node.object before extractCheck) and unplugin emitter's
// `addInstanceTransform` (passes peeled node to resolveReceiverSource). idempotent for non-
// SE / non-wrapped receivers
export function peelReceiverSequenceTail(node) {
  while (node && (isTransparentWrapper(node)
    || (node.type === 'SequenceExpression' && node.expressions?.length))) {
    node = node.type === 'SequenceExpression' ? node.expressions.at(-1) : node.expression;
  }
  return node;
}

// classify how an instance-call rewrite must handle a SequenceExpression receiver:
//   `'peel'`     - non-optional case: peel receiver to SE tail so memoize captures only
//                  the unwrapped value; sideEffects (prepend) supplies preceding-effects
//   `'suppress'` - optional case: leave SE intact, the optional-guard memoize already
//                  captures it (`null == (_ref = (fn(), arr)) ? void 0 : ...`); suppress
//                  prepend to avoid double-emit on non-nullish branch
//   `null`       - no SE receiver / no sideEffects to prepend - no special handling
// detects SE through transparent wrappers (Paren / Chain / TS) so oxc + babel parser
// shapes work uniformly. shared between babel-compat and unplugin instance dispatch
export function classifyReceiverSE(receiver, isOptional, sideEffects) {
  if (!sideEffects?.length || !receiver) return null;
  let cur = receiver;
  while (cur && isTransparentWrapper(cur)) cur = cur.expression;
  if (cur?.type !== 'SequenceExpression') return null;
  return isOptional ? 'suppress' : 'peel';
}

// meta `sideEffects` carry the receiver-SE first then the computed-key SE (source order); the split
// point is `meta.receiverEffectCount`, RECORDED at build time (the resolver's full receiver collection -
// parens/sequence + chain-collapse + inline-call root). a recompute off the receiver node undercounted
// member-chain / inline-call receivers to 0, dropping the leading receiver-SE in the swaps below

// `suppress` mode (optional receiver) keeps the whole receiver in the null-guard memoize
// (`_ref = recv`), where its side effects already run, and folds only the trailing computed-key SE
// into the guard's alternate - so drop the leading receiver-SE slice (returns the whole list when
// the receiver contributed none, i.e. every effect is key-SE)
export function keySideEffectsOnly(receiverEffectCount, sideEffects) {
  if (!sideEffects?.length) return sideEffects;
  return sideEffects.slice(receiverEffectCount);
}

// inverse of keySideEffectsOnly: keep ONLY the leading receiver-SE, drop the trailing computed-key
// SE. a static-FALLBACK receiver-only swap (member name not a known static) replaces just the object
// slot and leaves the computed `[key]` property in place, so the key-SE re-runs there - prepending
// it to the receiver replacement too would double-evaluate it. returns [] when the receiver had none
export function receiverSideEffectsOnly(receiverEffectCount, sideEffects) {
  if (!sideEffects?.length) return sideEffects;
  return sideEffects.slice(0, receiverEffectCount);
}

// peel chain-assignment `=` chain, returning the rhs-most non-assignment node + the
// outermost assignment (evaluating it covers every nested `=` step in source). used by
// static-method dispatch to recover the actual constructor identifier from a receiver like
// `(a = Array)` / `(a = b = Array)` and to re-emit the assignment as a side effect.
// instance dispatch captures it via the `_ref = (a = Array)` memoize shape so doesn't need
// this. handles nested-with-parens shapes (`(a = (b = Array))`) by alternating paren/assign
// peel internally - safe regardless of caller's pre-unwrap, robust to babel's
// `createParenthesizedExpressions: true` option. returns null `outer` when input isn't a
// chain-assign shape
export function peelChainAssignment(node) {
  const peeled = unwrapParens(node);
  if (peeled?.type !== 'AssignmentExpression' || peeled.operator !== '=') return { value: peeled, outer: null };
  let cur = peeled.right;
  // alternate paren-peel + chain-assign-descend to fixpoint; covers `(a = (b = X))` and
  // multi-layer paren wraps around inner `=`
  for (;;) {
    cur = unwrapParens(cur);
    if (cur?.type !== 'AssignmentExpression' || cur.operator !== '=') break;
    cur = cur.right;
  }
  return { value: cur, outer: peeled };
}

// back-compat alias: `peelChainAssignment` already does the alternating peel internally,
// so deep-walking just extracts the value field. preserves the legacy two-function API
// for external callers
export function peelChainAssignmentDeep(node) {
  return peelChainAssignment(node).value;
}

// walk a receiver MemberExpression chain peeling chain-assigns at each `.object` hop.
// returns array of outermost AssignmentExpression nodes encountered, in source order.
// shared between top-level (`(a = Array).from(x)`) and mid-chain (`((a = globalThis)
// .Array).from(x)`) cases - top-level walks one iteration; mid-chain walks down through
// the .object levels until a non-member root surfaces. SE-prefix wrapping the chain-assign
// (`(prefix(), (a = Array)).from(x)`) is peeled to the tail at each hop - prefix effects
// are captured separately upstream by `unwrapParensCollectingEffects` in `buildMemberMeta`
function collectChainAssignsThroughMemberChain(receiverNode) {
  const collected = [];
  let cur = peelReceiverSequenceTail(receiverNode);
  while (cur) {
    const { outer } = peelChainAssignment(cur);
    if (outer) {
      // outer AE's runtime evaluation covers any nested chain-assigns in its RHS, so
      // returning here keeps each AE in the emitted prelude exactly once - descending
      // through `.object` after collecting `outer` would re-surface the inner AE and
      // double-evaluate its side-effecting initializer
      collected.push(outer);
      return collected;
    }
    if (cur?.type !== 'MemberExpression' && cur?.type !== 'OptionalMemberExpression') break;
    cur = peelReceiverSequenceTail(cur.object);
  }
  return collected;
}

// splice chain-assignment receivers into the side-effect prelude for static-method dispatch:
// `(a = Array).from(x)` -> emit `(a = Array, _Array$from)(x)`. mid-chain shapes like
// `((a = globalThis).Array).from(x)` also surface their assignments to the SE channel.
// the chain-assign IS a receiver effect, so per ECMA receiver-before-key it must land at the
// receiver/key boundary `insertAt` (`meta.receiverEffectCount`), AFTER any receiver-sequence
// prefix but BEFORE the computed-key SE: `(prefix(), (a = Array))[(eff(), 'from')](x)` ->
// `(prefix(), a = Array, eff(), _Array$from)(x)`. `insertAt` omitted appends (callers whose
// `baseEffects` are receiver-only). returns `baseEffects` unchanged when no chain-assign found
export function prependChainAssignmentEffect(receiverNode, baseEffects, insertAt) {
  const collected = collectChainAssignsThroughMemberChain(receiverNode);
  if (!collected.length) return baseEffects;
  if (!baseEffects?.length) return collected;
  const at = insertAt ?? baseEffects.length;
  return [...baseEffects.slice(0, at), ...collected, ...baseEffects.slice(at)];
}

export function isStaticPlacement(name) {
  if (POSSIBLE_GLOBAL_OBJECTS.has(name)) return 'static';
  if (name[0] >= 'A' && name[0] <= 'Z') return 'static';
  return null;
}

// capitalised-identifier probe for polyfillHint values like `Symbol`/`Map`/`Promise`
const CAPITALISED_IDENT = /^[A-Z]\w*$/;
// `import _Foo from 'core-js/pure/symbol/iterator'` - extract Symbol key from polyfill path.
// `.[cm]?js` suffix is tolerated (explicit-extension import styles under TS-aware bundlers).
// path must EITHER start with a known core-js package prefix OR with an internal core-js
// namespace (`actual/`, `es/`, etc.). babel's injector stores importSource without the
// package prefix (`actual/symbol/iterator`); unplug stores the full path. without this
// constraint, `my-lib/symbol/iterator` would be misclassified as Symbol.iterator
const CORE_JS_SOURCE_PREFIX = /^(?:core-js(?:-pure)?\/|@core-js\/pure\/|(?:actual|es|features|full|proposals|stable|stage)\/)/;
const SYMBOL_IMPORT_SOURCE = /(?:^|\/)symbol\/(?<name>[\w-]+)(?:\/index)?(?:\.[cm]?js)?$/;

const IMPORT_BINDING_TYPES = new Set(['ImportSpecifier', 'ImportDefaultSpecifier', 'ImportNamespaceSpecifier']);

// shared Identifier-binding gate for key-resolution walks: cycle guard via `seen`, fork
// before recurse, reject reassigned bindings. precomputes `VariableDeclarator` init for
// the common "follow alias" step so callsites converge on `entry.init ? recurse : fallback`.
// returns `{ binding, init, nextSeen }` on success, null on miss
export function enterIdentifierBindingFollow({ node, scope, adapter, seen, path = null }) {
  if (seen?.has(node.name)) return null;
  const binding = adapter.getBinding(scope, node.name, path);
  // method-aware reassignment bail: usage-global keeps following a reassigned key/value
  // alias when the reassignment does not dominate the use; pure / narrowing keep the flat bail
  if (!binding || reassignmentBlocksGlobalResolve({ binding, adapter, path })) return null;
  const nextSeen = new Set(seen);
  nextSeen.add(node.name);
  const init = binding.node?.type === 'VariableDeclarator' ? binding.node.init : null;
  return { binding, init, nextSeen };
}

// true when `node` binds the module's default export (either as default specifier or
// as named `default` re-export). namespace bindings and other named specifiers reject -
// they alias something other than the module's default, even if the module-source matches.
// `null` is accepted as "default-like" for adapter-supplied virtual bindings: the plugin
// only emits virtual bindings for its own default pure-imports, and reference-tracking
// / super-mapping rely on this helper returning true in that case
export function bindsModuleDefault(node) {
  if (!node) return true;
  if (node.type === 'ImportDefaultSpecifier') return true;
  if (node.type === 'ImportSpecifier') {
    const importedName = node.imported?.name ?? node.imported?.value;
    return !importedName || importedName === 'default';
  }
  return false;
}

// match `<pkg>/...` for any pkg in the user's resolved `packages` array (main + additional).
// allows aliased / monorepo polyfill packages to participate in Symbol.X detection alongside
// the built-in CORE_JS_SOURCE_PREFIX. lowercased prefix comparison mirrors `packages` already
// being lowercased at construction time (see polyfill-provider/index.js)
function importSourceMatchesUserPackage(source, packages) {
  if (!packages?.length) return false;
  const lower = source.toLowerCase();
  for (const pkg of packages) if (lower.startsWith(`${ pkg }/`)) return true;
  return false;
}

// resolve a plugin-managed binding to its Symbol.X key if any. covers two markers:
// `polyfillHint` (in-place AST mutation leaves this on the binding) and `importSource`
// (real `import X from '.../symbol/iterator'` that the plugin emitted). symbol modules
// export the well-known Symbol as their default - only default bindings count as Symbol.X refs.
// CORE_JS_SOURCE_PREFIX filter rejects unrelated user imports like `my-lib/symbol/iterator`
// whose `*/symbol/X` suffix would otherwise match the regex and route through Symbol.X polyfill.
// optional `packages` array extends the prefix check to user-aliased polyfill packages
// (`additionalPackages` config) so monorepo / vendor-fork imports are recognised
export function bindingSymbolKey(binding, packages = null) {
  if (binding.polyfillHint?.startsWith('Symbol.')) return binding.polyfillHint;
  if (!binding.importSource) return null;
  if (!CORE_JS_SOURCE_PREFIX.test(binding.importSource)
    && !importSourceMatchesUserPackage(binding.importSource, packages)) return null;
  const match = SYMBOL_IMPORT_SOURCE.exec(binding.importSource);
  if (!match || !bindsModuleDefault(binding.node)) return null;
  return `Symbol.${ kebabToCamel(match.groups.name) }`;
}

// `path` (optional) - an AST path inside the lookup site so the adapter can anchor TS-runtime
// shadow detection at a deeper scope than `scope.path`. estree-toolkit's scope tracker doesn't
// register StaticBlock as its own scope owner, so a member visit `Map.Foo` inside
// `static { enum Map {} ... }` lands at the enclosing ClassDeclaration scope; without path,
// `findTSRuntimeBindingInPath` walks UP from ClassDeclaration and never enters the StaticBlock
// to find the enum. babel's scope tracker does anchor at StaticBlock so the legacy `scope.path`
// fallback works for it; estree-toolkit needs the explicit path
function resolveBindingToGlobal({ name, scope, adapter, seen, path }) {
  seen ??= new Set();
  if (seen.has(name)) return null;
  seen.add(name);
  // single binding lookup - reused by polyfillHint, type gate, and VariableDeclarator init walk.
  // pass `path` so the adapter's var-hoist fallback can surface a nested-block `var` alias
  // (`var g = globalThis` inside an `if`) that estree-toolkit's name-only scope index misses
  const binding = adapter.getBinding(scope, name, path);
  // plugin-managed pure-import mutation (`globalThis` -> `_globalThis` / `Symbol` -> `_Symbol`)
  // leaves a real import binding; adapter's `polyfillHint` carries the source global name so
  // downstream proxy-global / constructor recognition survives the rewrite
  const hint = binding?.polyfillHint;
  if (hint && (CAPITALISED_IDENT.test(hint) || POSSIBLE_GLOBAL_OBJECTS.has(hint))) return hint;
  const bindingType = adapter.getBindingNodeType(scope, name, path);
  // imports without a polyfillHint don't map to a known global (their binding could point at
  // any user-imported value); param / catch / class name fall through to the final null
  if (IMPORT_BINDING_TYPES.has(bindingType)) return null;
  if (bindingType === 'VariableDeclarator') return resolveVariableBindingToGlobal({ name, binding, scope, adapter, seen, path });
  return null;
}

// usage-global: when following a reassigned alias's declarator init, an unconditional reassignment can
// kill that init before the use - including across a closure boundary, where it runs before the
// capturing closure is defined (`let K = 'of'; K = 'from'; () => Array[K]` / `let M = Object; M =
// Array; () => M.assign()`). returns the reaching value NODE to resolve instead of the dead init, or
// null to keep following the init (no reassignment / init still live / value indeterminable - over-
// inject-safe). shared by the key (resolveKey) and receiver (resolveVariableBindingToGlobal) follows
function reachingValueOverDeadInit({ binding, adapter, path }) {
  if (adapter.method !== 'usage-global' || !isReassignedBeyondDeclarator(binding)) return null;
  return reachingReassignmentValueNode({ binding, usagePath: path });
}

function resolveVariableBindingToGlobal({ name, binding, scope, adapter, seen, path }) {
  // a real reassignment (a constantViolation beyond a loop-reinit declarator-self) makes the alias
  // flow-dependent. usage-pure bails on ANY reassignment (its receiver-dropping rewrite is unsound);
  // usage-global bails ONLY when a reassignment DOMINATES the use (init provably dead) - a
  // conditional / after-use reassignment leaves the init live, and inject-if-maybe-needed keeps
  // resolving it. the bail returns early, before the `.node.init/.id` deref below (malformed shapes)
  if (isReassignedBeyondDeclarator(binding) && reassignBailApplies({ binding, adapter, path })) return null;
  // a function-scoped `var` whose assignment is conditional (`if (c) { var M = globalThis }`)
  // holds the global only on paths through that branch. usage-pure rewrites `M.Array.from` to a
  // receiver-less helper, DROPPING the guard - so a non-dominating assignment would mask the
  // native undefined-access on the skipped-branch path. global / entry modes keep the call site
  // (side-effect import only) and stay sound regardless, so the gate is pure-only
  if (adapter.method === 'usage-pure'
    && !varInitDominatesUsage({ declaratorNode: binding.node, usagePath: path, kind: binding.kind })) return null;
  // dead-init across a closure: resolve the reaching value as the receiver instead of the dead init
  // (`let M = Object; M = Array; () => M.assign()` resolves to Array, not the unreachable Object)
  const reaching = reachingValueOverDeadInit({ binding, adapter, path });
  if (reaching) return resolveObjectName({ objectNode: reaching, scope, adapter, seen: new Set(seen).add(name), path });
  const { init } = binding.node;
  const pattern = binding.node.id;
  // `{ from, ...rest } = Array` - rest !=== init
  const props = pattern?.properties ?? pattern?.elements;
  if (props?.some(p => p?.type === 'RestElement' && p.argument?.name === name)) return null;
  // destructures bind `name` to a property of init, not init itself. proxy-global shorthand
  // (`{ Symbol } = globalThis`) is the only exception - aliases to the property key
  if (pattern?.type === 'ObjectPattern' && init) {
    const alias = resolveProxyGlobalDestructureAlias({ pattern, init, name, scope, adapter, seen, path });
    if (alias) return alias;
  }
  if (pattern && pattern.type !== 'Identifier') return null;
  if (!init) return null;
  // parens/chain/TS wrappers vanish; SequenceExpression pulls the effective value off its tail.
  // the binding's init declaration stays verbatim (only USES of the binding are rewritten / import-
  // injected), so preceding SE effects are preserved in place - resolution peels to the tail value
  const unwrapped = peelReceiverSequenceTail(init);
  if (unwrapped?.type === 'Identifier') {
    // self-reference (`var Map = Map`) -> global; unbound -> global; bound -> follow chain
    // (recursion hits the top-level polyfillHint translation for plugin-managed imports)
    if (unwrapped.name === name || !adapter.hasBinding(scope, unwrapped.name, path)) return unwrapped.name;
    return resolveBindingToGlobal({ name: unwrapped.name, scope, adapter, seen, path });
  }
  // identity / param-free / SE-prefix IIFE peel applied ONLY in the binding-init walk,
  // not in `resolveObjectName`'s generic CallExpression branch: the const intermediate
  // (`const X = (arg => arg)(Array)`) keeps the IIFE detached from the eventual usage
  // site, so polyfill emit operates on the binding name (`X`) not the IIFE expression.
  // direct member-receiver IIFE (`((arg) => arg)(WeakMap).has(1)`) doesn't reach here
  // and preserves its AST shape -- the identifier-visitor's inner-arg rewrite stays
  // unrivalled, no double-rewrite overlap with a wide polyfill substitution
  const iifePeeled = peelZeroArgIifeReturn(unwrapped);
  if (iifePeeled) return resolveObjectName({ objectNode: iifePeeled, scope, adapter, seen, path });
  // MemberExpression / OptionalMemberExpression / CallExpression / OptionalCallExpression all
  // delegate to resolveObjectName - it handles each shape (proxy-global walk, call-inline).
  // unhandled shapes (NewExpression, BinaryExpression, etc.) safely return null
  return unwrapped ? resolveObjectName({ objectNode: unwrapped, scope, adapter, seen, path }) : null;
}

// `const { X } = globalThis` (or `self` / `window` / ...) -> X resolves to globalThis.X.
// returns the property key or null when init isn't a proxy-global or `name` isn't matched.
// nested patterns (`const { window: { Array } }`) follow the chain when every intermediate
// key is itself a proxy-global name (`window`/`self`/...) - matches the runtime where the
// chain re-enters the same global-object identity (`globalThis.window === globalThis` on
// browsers). conservative: only descends through proxy-global keys, so user-shape
// `const { foo: { Array } } = globalThis` (foo is non-global) bails. only known-global-
// shaped leaf keys (capitalised / `POSSIBLE_GLOBAL_OBJECTS`) returned - `const { foo } =
// globalThis` should not push `'foo'` into downstream global lookups
function resolveProxyGlobalDestructureAlias({ pattern, init, name, scope, adapter, seen, path }) {
  const receiver = resolveObjectName({ objectNode: init, scope, adapter, seen, path });
  if (!receiver || !POSSIBLE_GLOBAL_OBJECTS.has(receiver)) return null;
  return walkProxyDestructurePattern({ pattern, name, scope, adapter, seen, path });
}

function walkProxyDestructurePattern({ pattern, name, scope, adapter, seen, path }) {
  for (const p of pattern.properties) {
    if (p.type !== 'Property' && p.type !== 'ObjectProperty') continue;
    // propagate `seen` so computed keys backed by chained aliases (`const k = A; const A = k;`
    // -> { [k]: x }) reuse the outer cycle guard instead of starting a fresh walk
    const key = resolveKey({ node: p.key, computed: p.computed, scope, adapter, seen, path });
    if (!key || !isStaticPlacement(key)) continue;
    if (patternBindingName(p.value) === name) return key;
    // nested ObjectPattern through a proxy-global intermediate key (`window`, `self`, ...)
    // re-enters the same global-object surface at runtime - recurse so `const {window:
    // {Array}} = globalThis` resolves Array as a global just like the flat form
    const nested = p.value?.type === 'AssignmentPattern' ? p.value.left : p.value;
    if (nested?.type === 'ObjectPattern' && POSSIBLE_GLOBAL_OBJECTS.has(key)) {
      const inner = walkProxyDestructurePattern({ pattern: nested, name, scope, adapter, seen, path });
      if (inner) return inner;
    }
  }
  return null;
}

// top-level binding name of a destructuring element, skipping `=default` wrappers. nested
// patterns (`[a, b]`, `{x, y}`) don't produce a single name and return null
export function patternBindingName(node) {
  while (node?.type === 'AssignmentPattern') node = node.left;
  return node?.type === 'Identifier' ? node.name : null;
}

// walks a chain of proxy-global links (`globalThis.self.window.X`) to its root identifier;
// returns true when the root is a proxy global and every intermediate link is also one.
// IIFE-at-root (`(() => globalThis).Array.from(x)`) is inlined via `inlineCallReturnExpression`
// so the chain bottoms out on the proxy-global identifier inside the IIFE body. caller is
// responsible for marking the inner proxy-global identifier (`markReceiverChainHandled`) so
// unplugin's text-emit doesn't queue a parallel `globalThis -> _globalThis` rewrite that
// would overlap the outer polyfill replacement
function resolveProxyGlobalRoot({ receiver, scope, adapter, seen, path }) {
  // peel chain-assign AND SE-tail at every step: `((a = globalThis).Array).from(x)` buries
  // the assignment inside .object's .object, and `(eff(), globalThis).Map.groupBy` buries the
  // proxy root behind a sequence tail - a flat unwrapParens loses both. this is pure shape
  // classification: the SE prefix stays in the source and is collected by the emit side
  let obj = peelChainAssignmentDeep(peelReceiverSequenceTail(receiver));
  while (obj.type === 'MemberExpression' || obj.type === 'OptionalMemberExpression') {
    // carry `seen` into computed-key resolution so a shared alias chain across the
    // proxy-global walk and its intermediate member keys can't exceed the cycle guard
    const memberKey = obj.computed
      ? resolveKey({ node: obj.property, computed: true, scope, adapter, seen, path })
      : obj.property?.name;
    if (!memberKey || !POSSIBLE_GLOBAL_OBJECTS.has(memberKey)) return false;
    obj = peelChainAssignmentDeep(peelReceiverSequenceTail(obj.object));
  }
  if (obj.type === 'CallExpression' || obj.type === 'OptionalCallExpression') {
    const inlined = inlineCallReturnExpression({ callNode: obj, scope, adapter, seen, path });
    if (inlined) return resolveProxyGlobalRoot({ receiver: inlined, scope, adapter, seen, path });
  }
  // top-level `this` roots the chain as the global proxy (pragmatic assumption shared with
  // the type resolver via the same canon)
  if (obj.type === 'ThisExpression') return isTopLevelThisContext(path);
  return obj.type === 'Identifier' && isProxyGlobalIdentifier({ node: obj, scope, adapter, seen, path });
}

// `seen` threaded from resolveBindingToGlobal so cyclic const chains
// (`const a = b.x; const b = a.x;`) don't restart the cycle guard and stack-overflow.
// initialize at entry so the cycle guard accumulates across recursion regardless of whether
// the caller passed one - matches resolveBindingToGlobal's convention
export function resolveObjectName({ objectNode, scope, adapter, seen, path }) {
  seen ??= new Set();
  // peel chain-assign rhs + parens to a fixpoint (`(a = Array)`, `(a = b = Array)`,
  // `(a = (b = Array))`, `((a = Array))` all resolve to Array). closes binding-init walks
  // (`const X = (a = Array); X.from(...)`) and IIFE-return walks
  // (`(() => (a = Array))().from(...)`) symmetrically. SE preservation is downstream's
  // problem - resolveObjectName only classifies receiver shape
  objectNode = peelChainAssignmentDeep(objectNode);
  if (objectNode.type === 'Identifier') {
    if (adapter.hasBinding(scope, objectNode.name, path)) {
      return resolveBindingToGlobal({ name: objectNode.name, scope, adapter, seen, path });
    }
    // no binding - global only if starts with uppercase or is a known global proxy
    return isStaticPlacement(objectNode.name) ? objectNode.name : null;
  }
  // call expression: inline the function-like callee's body return when it bottoms out on
  // a resolvable receiver. covers IIFE (`(() => Map)()`), function-expression IIFE, and
  // identifier-bound arrow/fn (`const f = () => Map; 'X' in f()`). recursion through
  // resolveObjectName handles chains like `(() => globalThis)().Map`.
  // identity / param-free / SE-prefix IIFE peel (`peelZeroArgIifeReturn`) is intentionally
  // NOT applied at this generic call site -- it'd let `((Map) => Map)(WeakMap).has(1)`
  // resolve as a polyfillable receiver, and unplugin's text-rewrite would queue a wide
  // replacement overlapping the identifier-visitor's inner-arg rewrite (`WeakMap` ->
  // `_WeakMap`), producing broken `__WeakMap` output. binding-init walks apply the peel
  // separately (`resolveVariableBindingToGlobal`); direct member-receiver IIFE preserves
  // its AST shape so identifier-visitor's inner rewrite stays the single source of truth
  if (objectNode.type === 'CallExpression' || objectNode.type === 'OptionalCallExpression') {
    const inlined = inlineCallReturnExpression({ callNode: objectNode, scope, adapter, seen, path });
    return inlined ? resolveObjectName({ objectNode: inlined, scope, adapter, seen, path }) : null;
  }
  if (objectNode.type !== 'MemberExpression' && objectNode.type !== 'OptionalMemberExpression') return null;
  // computed: globalThis[`Array`] resolves the bracket expression; non-computed reads the
  // identifier name directly. either way the receiver chain must bottom out on a proxy global
  const propertyName = objectNode.computed
    ? resolveKey({ node: objectNode.property, computed: true, scope, adapter, path })
    : objectNode.property.type === 'Identifier' ? objectNode.property.name : null;
  if (!propertyName) return null;
  return resolveProxyGlobalRoot({ receiver: objectNode.object, scope, adapter, seen, path }) ? propertyName : null;
}

// the distinct values an alias can hold at the use for the usage-global union: the resolved primary
// (declarator init) plus every reachable reassignment RHS that resolves, deduped. a non-Identifier
// alias or one with no reassignment contributes only the primary. `resolve` maps a value node to its
// receiver name / key string
export function reachableAliasValues({ aliasNode, primary, resolve, scope, adapter, path, seen }) {
  const values = primary ? [primary] : [];
  if (aliasNode?.type === 'Identifier') {
    const binding = adapter.getBinding(scope, aliasNode.name, path);
    if (binding && isReassignedBeyondDeclarator(binding)) {
      // the alias name activates pattern-LHS pairing (`[A] = [Iterator]`) in the enumerator -
      // adapter binding wrappers do not all surface the bound identifier
      for (const rhs of reassignmentValueNodes({ binding, usagePath: path, name: aliasNode.name })) {
        const value = resolve(rhs);
        if (value) values.push(value);
      }
    } else if (binding) {
      // const-alias hop: a non-reassigned `const M = M0` aliases M0, so the union must see M0's
      // transitive reassignments (`let M0 = Object; if (c) M0 = Array; const M = M0; M.from()`).
      // the primary already captured M's resolved init value; recurse on the init Identifier to add
      // the underlying binding's reachable reassignments. `seen` guards alias cycles
      const init = unwrapParens(binding.node?.init);
      if (init?.type === 'Identifier' && init.name !== aliasNode.name && !seen?.has(init.name)) {
        values.push(...reachableAliasValues({
          aliasNode: init, primary: null, resolve, scope, adapter, path,
          seen: new Set(seen).add(aliasNode.name),
        }));
      }
    }
  } else if (aliasNode?.type === 'CallExpression' || aliasNode?.type === 'OptionalCallExpression') {
    // IIFE-callee receiver `f()` whose factory `f` is a reassigned alias: each reachable `() => X`
    // value returns X. recover each so a dominating reassignment to a polyfillable global (`let f =
    // () => Object; f = () => Array; f().from()`) still injects the reaching value's polyfill - the
    // direct-Identifier-receiver union path could not, since `f()` is not an Identifier alias
    const callee = unwrapParens(aliasNode.callee);
    const binding = callee.type === 'Identifier' ? adapter.getBinding(scope, callee.name, path) : null;
    if (binding && isReassignedBeyondDeclarator(binding)) {
      // pass the factory name so pattern-LHS reassignments (`[f] = [() => Array]`) pair via
      // patternSlotValues - the Identifier-receiver branch above passes it for the same reason
      for (const rhs of reassignmentValueNodes({ binding, usagePath: path, name: callee.name })) {
        const fn = unwrapParens(rhs);
        if ((fn.type === 'ArrowFunctionExpression' || fn.type === 'FunctionExpression')
          && !fn.params?.length && !fn.async && !fn.generator) {
          const ret = singleReturnBodyExpression(fn.body);
          const value = ret && resolve(ret);
          if (value) values.push(value);
        }
      }
    }
  }
  return [...new Set(values)];
}

// usage-global UNION of reachable member-dispatch targets for a conditionally reassigned receiver
// and/or computed-key. `let K='from'; if(c) K='of'; Array[K]()` can call Array.from OR Array.of;
// `var M={}; if(c) M=Array; M.from()` may dispatch on Array. when BOTH vary the reachable targets
// are the cross product, so each is emitted (over-inject-safe; an impossible pair just resolves to no
// polyfill). returns extra `{ kind:'property', object, key, placement }` metas minus the primary pair
// the caller already emits, empty in the common no-reassignment case. global-only: usage-pure bails
// on any reassignment upstream, so a reassigned alias never reaches a receiver-dropping substitute
export function collectMemberUnionCandidates(options) {
  const { objectNode, computedKeyNode, primaryObject, primaryKey, scope, adapter, path } = options;
  if (adapter.method !== 'usage-global') return [];
  const objects = reachableAliasValues({
    aliasNode: objectNode, primary: primaryObject, scope, adapter, path,
    resolve: rhs => resolveObjectName({ objectNode: rhs, scope, adapter, path }),
  });
  const keys = reachableAliasValues({
    aliasNode: computedKeyNode, primary: primaryKey, scope, adapter, path,
    resolve: rhs => resolveKey({ node: rhs, computed: true, scope, adapter, path }),
  });
  const extras = [];
  for (const object of objects) for (const key of keys) {
    if ((object === primaryObject && key === primaryKey) || key === 'prototype') continue;
    const placement = isStaticPlacement(object) ? 'static' : 'prototype';
    // mirror the primary meta's receiver-type gate so a union key that is an instance method on
    // the constructor (`Array[K]` with K reaching 'concat') bails instead of over-injecting
    extras.push({ kind: 'property', object, key, placement, receiverHint: staticReceiverHint(placement, object) });
  }
  return extras;
}

// resolve a call-expression callee to a function-like node (arrow / fn-expr) suitable
// for inlining. handles direct IIFE (callee = arrow/fn-expr) AND identifier-bound callees
// (`const f = () => X; f()` walks through the binding's init to the same form).
// rejects shapes where inlining would change semantics: non-VariableDeclarator bindings,
// reassigned bindings (constantViolations), parameter-bearing fn (would shadow free
// identifiers), async / generator fn (wrapped return value misrepresents the result type
// for downstream `resolveObjectName` consumers - `(async()=>Map)().has(1)` tags the
// receiver as Map and emits es.map.* polyfills for a Promise call site).
// `seen` (caller-owned Set) tracks binding names already in the resolution chain for
// cycle protection (`const f = () => g(); const g = () => f();`); pass an empty Set when
// recursion isn't possible at the call site
function resolveInlineCalleeFunction({ callNode, scope, adapter, path, seen }) {
  // SE-bail (unwrapParens), NOT peel-to-tail: recognizing a SE-callee IIFE (`(eff(), () => Array)()`)
  // makes the resolver inline it, but the emit layer cannot compose a receiver-less static
  // substitution over the SE-wrapped callee (transform-queue "could not locate inner needle" crash).
  // the SE-bail keeps the shape unresolved (native call survives) - the safe-from-crash outcome
  let callee = unwrapParens(callNode.callee);
  if (callee.type === 'Identifier') {
    const { name } = callee;
    if (!adapter.hasBinding(scope, name, path) || seen.has(name)) return null;
    const binding = adapter.getBinding(scope, name, path);
    // method-aware reassignment bail: usage-global keeps inlining the IIFE-callee when
    // the binding's reassignment does not dominate the use (init still live); pure / narrowing bail
    if (!binding || reassignmentBlocksGlobalResolve({ binding, adapter, path })) return null;
    if (adapter.getBindingNodeType(scope, name, path) === 'VariableDeclarator') {
      const initNode = binding.node?.init;
      if (!initNode) return null;
      callee = unwrapParens(initNode);
    } else {
      // a zero-param FunctionDeclaration is the same inline shape (`function g() { return X; }
      // const B = g();`) - the declaration node IS the callee function
      const declNode = binding.path?.node ?? binding.node;
      if (declNode?.type !== 'FunctionDeclaration') return null;
      callee = declNode;
    }
    seen.add(name);
  }
  if ((callee.type !== 'ArrowFunctionExpression' && callee.type !== 'FunctionExpression'
    && callee.type !== 'FunctionDeclaration')
    || callee.params?.length || callee.async || callee.generator) return null;
  return callee;
}

// resolve an inline-eligible call to its single-return expression. `null` if the callee
// isn't inlineable or the body has multiple returns / local bindings (see
// `singleReturnBodyExpression`). prefix ExpressionStatements ARE allowed - their effects
// are preserved at the call site via `inlineCallHasObservableEffects` + `meta.sideEffects`
export function inlineCallReturnExpression({ callNode, scope, adapter, seen, path }) {
  const callee = resolveInlineCalleeFunction({ callNode, scope, adapter, path, seen });
  return callee ? singleReturnBodyExpression(callee.body) : null;
}

export function isCallShape(node) {
  return node?.type === 'CallExpression' || node?.type === 'OptionalCallExpression';
}

// does the inline-resolved call carry prefix statements that would be lost if the site is
// replaced by the polyfill? expression-body (`() => X`) and direct-return block-body
// (`() => { return X; }`) - false. block bodies with any non-return statement - true;
// the caller pushes the original call into `meta.sideEffects` so emit re-emits it via
// SequenceExpression wrap, preserving `calls++; return Promise;` execution alongside
// the polyfilled static dispatch.
// recurses through alias chains: `outerSE = () => innerSE()` where innerSE has block-body
// prefix statements - effects propagate up the chain so the OUTER call site SE-wraps,
// preserving inner prefix execution. `seen` Set carries cycle protection across hops
export function inlineCallHasObservableEffects({ callNode, scope, adapter, path }) {
  return hasObservableEffectsRec({ callNode, scope, adapter, path, seen: new Set() });
}

function hasObservableEffectsRec({ callNode, scope, adapter, path, seen }) {
  const body = resolveInlineCalleeFunction({ callNode, scope, adapter, path, seen })?.body;
  if (!body) return false;
  const isBlock = body.type === 'BlockStatement';
  // filter out leading directive ExpressionStatements (`'use strict';`) - parser-shape
  // diff only: oxc inlines them in body[]; babel separates into `program.directives`.
  // either way `'use strict'` carries no observable runtime effect for SE-wrap purposes
  const stmts = isBlock ? body.body.filter(s => !isDirectiveStatement(s)) : null;
  // block w/ anything beyond a single `return X;` carries observable effects directly
  if (isBlock && (stmts.length !== 1 || stmts[0].type !== 'ReturnStatement')) return true;
  // chain target: block-body extracts return arg, expression-body is itself the target.
  const next = isBlock ? stmts[0].argument : body;
  // recurse when next is an inline-resolvable call (`() => inner()` with its own prefix effects)
  if (isCallShape(next)) return hasObservableEffectsRec({ callNode: next, scope, adapter, path, seen });
  // else the returned value IS the inlined receiver; it carries observable effects only when the
  // receiver is wrapped in a write or an SE-prefixed sequence (`a = Array`, `(eff(), Array)`) - the
  // substitution drops the whole call, so those must be preserved. a bare receiver ref has none
  return returnedReceiverHasEffects(next);
}

// the returned expression of an inlined call, beyond the receiver value the caller resolves: a
// chain-assignment / update writes a binding, an SE-prefixed sequence runs its leading elements -
// both are dropped when the call is replaced by the polyfill. a bare Identifier / member receiver
// has no such effect (a CallExpression receiver is handled by the recursion above). peel transparent
// wrappers first: oxc keeps the arrow-body parens (`() => (a = Array)`) babel strips, so the write
// hides under a ParenthesizedExpression on one adapter only
export function returnedReceiverHasEffects(node) {
  node &&= unwrapParens(node);
  if (!node) return false;
  if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') return true;
  if (node.type === 'SequenceExpression') {
    return node.expressions.slice(0, -1).some(mayHaveSideEffects) || returnedReceiverHasEffects(node.expressions.at(-1));
  }
  return false;
}

// check if an identifier refers to a proxy global: either directly (`globalThis`)
// or through a const alias (`const g = globalThis`).
// `seen` threaded so cyclic `const a = b.x; const b = a.x;` doesn't restart the guard
function isProxyGlobalIdentifier({ node, scope, adapter, seen, path }) {
  if (POSSIBLE_GLOBAL_OBJECTS.has(node.name) && !adapter.hasBinding(scope, node.name, path)) return true;
  // follow const alias: `const g = globalThis` / `const g = self`
  const resolved = resolveBindingToGlobal({ name: node.name, scope, adapter, seen, path });
  return resolved !== null && POSSIBLE_GLOBAL_OBJECTS.has(resolved);
}

export function resolveKey({ node, computed, scope, adapter, seen, path, depth = 0, bailOnSideEffectKey = false }) {
  if (depth > MAX_KEY_DEPTH) return null;
  // oxc-parser preserves ParenthesizedExpression / TS wrappers on computed keys and
  // binding inits; Babel strips them. unwrap up front so the identifier-alias and
  // Symbol-member branches below work uniformly across parsers.
  // SequenceExpression tail: only the last element's value drives key identity. SE
  // prefix is captured by unwrapParensCollectingEffects at meta-build sites (members.js);
  // direct callers without an effects channel (resolveStaticInheritedMember) get the
  // peeled tail so super[(fn(),'X')] still classifies as super.X
  if (computed) {
    node = unwrapParens(node);
    // a side-effecting key prefix (`[(fn(), 'X')]`) can only be re-emitted by callers with an
    // effects channel. callers without one (destructure detection) pass bailOnSideEffectKey to
    // leave the key unresolved, so the whole construct is skipped rather than silently dropping
    // the side effect (babel) or feeding the text composer a needle it cannot place (unplugin)
    if (bailOnSideEffectKey && node?.type === 'SequenceExpression' && sequencePrefixWithSideEffects(node)) return null;
    while (node?.type === 'SequenceExpression') node = node.expressions.at(-1);
  }
  if (!computed && node.type === 'Identifier') return node.name;
  if (adapter.isStringLiteral(node)) return adapter.getStringValue(node);
  // `at` -> 'at'; `${'iter'}${'ator'}` -> 'iterator' when every interpolation resolves to a literal
  if (node.type === 'TemplateLiteral') {
    const single = singleQuasiString(node);
    if (single !== null) return single;
    let out = '';
    for (let i = 0; i < node.quasis.length; i++) {
      // tagged template with invalid escape (`\\xZ`, `\\u{...}`) leaves `cooked === null`
      // post-ES2018. bailing here is right - the cooked form is what runtime concat would
      // see, so we can't form a valid lookup key without it
      const { cooked } = node.quasis[i].value;
      if (cooked === null || cooked === undefined) return null;
      out += cooked;
      if (i < node.expressions.length) {
        // fork `seen` per interpolation - same-binding reuse (`${k}${k}`) must not
        // trip the cycle guard after the first interpolation mutates a shared Set.
        // mirrors the fork pattern in the BinaryExpression `+` branch below
        const part = resolveKey({
          node: node.expressions[i], computed: true, scope, adapter, seen: new Set(seen), path, depth: depth + 1,
        });
        if (part === null) return null;
        out += part;
      }
    }
    return out;
  }
  // computed: const variable - follow to init, else fall back to plugin-managed bindings
  // (`polyfillHint` in-place mutation / `core-js/.../symbol/X` import, incl. user-aliased
  // polyfill packages from `additionalPackages`)
  if (node.type === 'Identifier' && computed) {
    const entry = enterIdentifierBindingFollow({ node, scope, adapter, seen, path });
    if (entry) {
      if (entry.init) {
        // usage-pure: a conditionally-initialized key alias (`if (c) var K = 'fromEntries'`) holds
        // the literal only on the guarded path, so following it would rewrite `Builtin[K]()` to a
        // receiver-less polyfill and mask the native TypeError on the skipped path. gate on
        // init-dominance like the receiver branch (usage-global over-injects, so it keeps following)
        if (adapter.method === 'usage-pure'
          && !varInitDominatesUsage({ declaratorNode: entry.binding.node, usagePath: path, kind: entry.binding.kind })) return null;
        // usage-global: an unconditional reassignment can kill the init before the use - including one
        // that completes before a capturing closure is defined (`let K = 'of'; K = 'from'; () =>
        // Array[K]` can never dispatch Array.of). prefer the reaching value so the dead init does not
        // become the primary key; fall through to the init when no such value is determinable
        const reaching = reachingValueOverDeadInit({ binding: entry.binding, adapter, path });
        if (reaching) return resolveKey({
          node: reaching, computed: true, scope, adapter, seen: entry.nextSeen, path, depth: depth + 1,
        });
        return resolveKey({
          node: entry.init, computed: true, scope, adapter, seen: entry.nextSeen, path, depth: depth + 1,
        });
      }
      const key = bindingSymbolKey(entry.binding, adapter.packages);
      if (key) return key;
    } else if (!seen?.has(node.name)) {
      // the alias-follow bailed on a reassignment (declarator init dead at the use). resolve the key
      // from the value the use actually sees - the reaching definition (`K = 'of'` in
      // `let K = 'from'; K = 'of'; Array[K]()`) when it is unambiguous. null when flow-dependent
      const binding = adapter.getBinding(scope, node.name, path);
      const reaching = binding && isReassignedBeyondDeclarator(binding)
        ? reachingReassignmentValueNode({ binding, usagePath: path }) : null;
      if (reaching) return resolveKey({
        node: reaching, computed: true, scope, adapter, seen: new Set(seen).add(node.name), path, depth: depth + 1,
      });
    }
  }
  // string concatenation: 'a' + 'b'
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    // fork `seen` per branch so `a + a` (same binding both sides) doesn't mis-trigger the
    // cycle guard on the right branch after the left added `a` to the shared Set
    const left = resolveKey({
      node: node.left, computed: true, scope, adapter, seen: new Set(seen), path, depth: depth + 1,
    });
    const right = resolveKey({
      node: node.right, computed: true, scope, adapter, seen: new Set(seen), path, depth: depth + 1,
    });
    if (left !== null && right !== null) return left + right;
  }
  // Symbol.X computed access - Symbol.iterator, Symbol['iterator'], Symbol[key] where key = 'iterator'
  // fork `seen` per side so shared-binding probe (e.g. `obj[s[s]]` re-entering `s`) doesn't
  // trip the cycle guard on the second side after the first side populated the Set. mirrors
  // the TemplateLiteral / `+` branches above.
  // reject the doubly-bracket-nested case `Symbol[Symbol.X]`: the inner `Symbol.X` resolves
  // to a well-known symbol VALUE (not the string 'X'), so the outer reads property keyed by
  // a symbol value - Symbol constructor itself doesn't carry well-known-symbol-valued
  // properties, so `Symbol[Symbol.iterator]` is `undefined` at runtime. recognising that as
  // a well-known polyfill dispatch is a misclassification
  if (computed && (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
    && asSymbolRef({ node: node.object, scope, adapter, seen: new Set(seen), path })) {
    const name = resolveKey({
      node: node.property, computed: node.computed, scope, adapter, seen: new Set(seen), path, depth: depth + 1,
    });
    if (name && !name.startsWith('Symbol.')) return `Symbol.${ name }`;
  }
  return null;
}

// the two keys a synth-swap pattern property needs, derived once so babel-plugin and unplugin agree:
// `lookupKey` is the resolved static NAME used to probe a receiver for a polyfillable static (a computed
// `[k]` with `const k = 'from'` resolves to 'from'); `slotKey` is the stable map / emit slot that
// distinguishes `[k]` from a plain `k` (`{ k: v, [k]: w }`). a non-computed key uses its name for both;
// a dynamic computed key (`resolveKey` -> null) yields `lookupKey: null` so the caller bails the synth
export function resolveSynthKeys({ node, scope, adapter, path }) {
  const slotKey = synthSwapPropKey(node);
  // pass `path` so `resolveKey`'s flow-sensitive gate (`varInitDominatesUsage`) sees the real usage
  // position: a flow-dependent computed key (`if (c) var K = 'from'; { [K]: m }`) must NOT fold to its
  // conditional init for usage-pure - a null path defaults the dominance check to true and folds wrongly
  const lookupKey = node.computed
    ? resolveKey({ node: node.key, computed: true, scope, adapter, path })
    : node.key.name;
  return { lookupKey, slotKey };
}

// bare unbound `Symbol` / capitalised const-alias (`const Sym = Symbol`) /
// proxy-global access (`globalThis.Symbol`, `self.window.Symbol`). lowercase idents skip
// the const-chain walk - `Symbol` aliases are capitalised by convention.
// `seen` threaded through so callers caught in a cyclic const-alias chain
// (`const a = b.Symbol; const b = a;`) don't restart the cycle guard
function resolvesToGlobalSymbol({ node, scope, adapter, seen, path }) {
  if (node.type === 'Identifier') {
    if (node.name === 'Symbol') return !adapter.hasBinding(scope, 'Symbol', path);
    if (!CAPITALISED_IDENT.test(node.name)) return false;
    return resolveBindingToGlobal({ name: node.name, scope, adapter, seen, path }) === 'Symbol';
  }
  return globalProxyMemberName({ node, scope, adapter, path }) === 'Symbol';
}

// preserve pre-unwrap node so callers can seed both forms into handledObjects;
// Set dedup absorbs the duplicate when raw === unwrapped
export function asSymbolRef({ node, scope, adapter, seen, path }) {
  const unwrapped = unwrapParens(node);
  return unwrapped && resolvesToGlobalSymbol({ node: unwrapped, scope, adapter, seen, path })
    ? { raw: node, unwrapped } : null;
}

// `var X = X` - hoisted var init references its own name, which at runtime reads the
// outer (global) scope before the local is assigned. Factory wraps a per-binding cache
// because the usage transform mutates `init.name` (X -> _X) after the first visit, so a
// non-cached recheck on later references would miss the invariant.
// `getKind` varies by adapter: babel has `binding.kind`, estree-toolkit reads `kind` off
// the parent VariableDeclaration.
// intentionally `var`-only: `let`/`const` self-ref (`let X = X`) hits the TDZ at runtime,
// so plugin shouldn't invent a global mapping. the duplicated shape in `resolveBindingToGlobal`
// for any kind exists because that code path handles the already-mutated binding (post-rewrite
// shape) and needs to resolve through it regardless of kind.
// constantViolations check: `var X = X; X = mock; X.method()` reassigns the binding before
// the use site, so subsequent reads MUST not be rewritten to the polyfill - mock would be
// silently ignored. without the check `Promise.try` after `var Promise = Promise; Promise = mock`
// would rewrite to `_Promise.try`, dropping the user's reassignment
export function createSelfRefVarGuard(getKind) {
  const cache = new WeakMap();
  return function isSelfRefVarBinding(binding) {
    if (!binding) return false;
    if (binding.constantViolations?.length) return false;
    const decl = binding.path?.node ?? binding.node;
    if (!decl || decl.type !== 'VariableDeclarator') return false;
    if (cache.has(decl)) return cache.get(decl);
    const { id, init } = decl;
    // oxc preserves `ParenthesizedExpression` while babel strips them - peel so
    // `var Promise = (Promise)` matches the self-ref shape in both parsers
    const peeled = unwrapParens(init);
    const result = getKind(binding) === 'var'
      && id?.type === 'Identifier'
      && peeled?.type === 'Identifier'
      && peeled.name === id.name
      // a self-ref re-run by a loop reads the local (undefined on iteration 1), so it must NOT map
      // to the global there. babel's native binding flags this via constantViolations (bailed
      // above); estree-toolkit's doesn't, so check the declarator's loop nesting to keep parity
      && !(binding.path && isVarDeclaratorInLoopBody(binding.path, id.name));
    cache.set(decl, result);
    return result;
  };
}

// find the proxy global identifier (globalThis, self, etc.) at the root of a MemberExpression chain.
// depth-ceiling protects against pathological chains - same MAX_KEY_DEPTH bound used elsewhere
// `aliasCtx` ({ scope, adapter, path }), when supplied, makes the root check follow const-alias
// roots through the canonical resolver (`const g = globalThis; g.self.X`); without it the root is
// classified by NAME only (POSSIBLE_GLOBAL_OBJECTS) - byte-identical to every existing node-only
// caller. the emit-side collapse passes it so an aliased proxy global drops its `.self` hop too
export function findProxyGlobal(node, aliasCtx = null) {
  // peel SE tails too (`(eff(), globalThis).Map`): pure shape classification - the SE prefix
  // stays in the source and the emit side collects it; a paren-only peel left the root
  // unclassified and the receiver subtree unskipped (overlapping-rewrite crash on unplugin)
  let obj = peelReceiverSequenceTail(node);
  let depth = 0;
  while (obj.type === 'MemberExpression' || obj.type === 'OptionalMemberExpression') {
    if (++depth > MAX_KEY_DEPTH) return null;
    obj = peelReceiverSequenceTail(obj.object);
  }
  if (obj.type !== 'Identifier') return null;
  return isProxyGlobalIdentifierNode({ node: obj, ...aliasCtx }) ? obj : null;
}

// like `findProxyGlobal`, but returns the root WITH any wrapper directly around it (paren /
// TS-cast / pure-sequence) retained, so `.start` / `.end` span the wrapper bytes. the unplugin
// text-emit layer slices source on these offsets; using `findProxyGlobal`'s peeled-identifier
// offsets leaves an unbalanced paren - a partial-overlap throw (deletion starts inside the
// root substitution) or a dangling `(` - when the root is parenthesized (`(globalThis).self.X`).
// returns the bare identifier (same span as `findProxyGlobal`) when no wrapper sits directly
// around the root, including the parens-around-prefix shape (`(globalThis.self).X`)
export function proxyGlobalWrappedRoot(node, aliasCtx = null) {
  if (!findProxyGlobal(node, aliasCtx)) return null;
  // peelReceiverSequenceTail (not SE-bailing unwrapParens): for a SE-prefix receiver
  // `(se(), globalThis.self.Array)` the bare root identifier sits in the SE tail - peeling to it
  // gives the correct deletion span. identical to unwrapParens for the directly-wrapped-root case
  // (`(globalThis).self.X` still returns the paren-inclusive `(globalThis)`), so byte-spans are kept
  let wrapped = peelReceiverSequenceTail(node);
  let root = wrapped;
  while (root.type === 'MemberExpression' || root.type === 'OptionalMemberExpression') {
    wrapped = root.object;
    root = peelReceiverSequenceTail(wrapped);
  }
  return wrapped;
}

// the largest pure proxy-global navigation sub-expression of `node`: the root proxy-global
// identifier plus any consecutive member hops whose key is itself a proxy-global (`globalThis.self`
// - `self` is a proxy-global alias of the global object). a non-proxy key (a constructor leaf or a
// user property) ends it. callers collapse this whole span to the substituted root, so the emitted
// expression reads the constructor off the global object directly instead of an intermediate proxy:
// `_globalThis.self.Array` would read an undefined `self` off the global object on hosts without it
// (ie:11 pure, non-browser), whereas the collapsed `_globalThis.Array` is safe across the target range
export function maximalProxyGlobalPrefix(node, aliasCtx = null) {
  const root = findProxyGlobal(node, aliasCtx);
  if (!root) return null;
  const chain = [];
  // peel the SE tail (matching findProxyGlobal above, which roots the chain via peelReceiverSequenceTail):
  // a SE-prefixed proxy receiver `(se(), globalThis.self.Array)` must still collapse its `.self` hop -
  // SE-bailing unwrapParens left the chain unwalked so `_globalThis.self.Array` survived to ie:11
  let cur = peelReceiverSequenceTail(node);
  while (cur.type === 'MemberExpression' || cur.type === 'OptionalMemberExpression') {
    chain.push(cur);
    cur = peelReceiverSequenceTail(cur.object);
  }
  let prefix = root;
  for (let i = chain.length - 1; i >= 0; i--) {
    const member = chain[i];
    // `memberKeyName` matches the resolution side: it reads identifier keys AND static
    // computed keys (string literal / ESTree Literal / single-quasi template), so a computed
    // proxy hop (`globalThis['self'].Array`) extends the prefix just like the dotted form.
    // collapse callers then read `_globalThis.Array` instead of leaving `_globalThis['self']`
    const key = memberKeyName(member);
    if (key && POSSIBLE_GLOBAL_OBJECTS.has(key)) prefix = member;
    else break;
  }
  return prefix;
}

// the maximal proxy-global prefix WHEN it spans at least one intermediate proxy hop
// (`globalThis.self` in `globalThis.self.Array`), else null. a bare root is an Identifier; an
// absorbed hop makes the prefix a member expression. distinguishes a chain whose collapse
// actually changes the output (root + hops) from a bare root (`globalThis.Array`) that the
// standard root substitution / natural global rewrite already handles. callers that only need
// to drop the "extra" hops gate on this and leave the bare-root case alone
export function maximalProxyGlobalHop(node, aliasCtx = null) {
  const prefix = maximalProxyGlobalPrefix(node, aliasCtx);
  return prefix && prefix.type !== 'Identifier' ? prefix : null;
}
