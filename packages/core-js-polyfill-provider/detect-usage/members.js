// member-expression resolution + `key in obj` BinaryExpression handler. produces meta for
// the polyfill resolver (kind / object / key / placement) and seeds `handledObjects` so
// downstream identifier visits don't double-process subsumed receiver chains
import {
  collectFoldedReceiverSideEffects,
  memberKeyName,
  proxyNavRootIsSequence,
  staticMemberKeyName,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
} from '../helpers/ast-patterns.js';
import { isAliasProxyRoot, POSSIBLE_GLOBAL_OBJECTS, symbolKeyToEntry } from '../helpers/class-walk.js';
import { staticReceiverHint } from './globals.js';
import {
  asSymbolRef,
  bindingSymbolKey,
  collectMemberUnionCandidates,
  descendToChainRoot,
  enterIdentifierBindingFollow,
  findProxyGlobal,
  inlineCallHasObservableEffects,
  inlineCallReturnExpression,
  isCallShape,
  isStaticPlacement,
  isTransparentWrapper,
  maximalProxyGlobalPrefix,
  MAX_KEY_DEPTH,
  peelChainAssignment,
  peelReceiverSequenceTail,
  resolveKey,
  resolveObjectName,
  unwrapTransparentSeq,
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

// the underlying CallExpression at a chain root (`f().X`, `(() => globalThis)().Array`), null otherwise -
// callers probe `inlineCallHasObservableEffects` for SE-preservation. `throughChainAssign` additionally
// sees the call under `(a = IIFE()).Symbol` (the subsumption gate needs it); the SE-harvest callers must
// NOT pass it - the preserved assignment already re-emits the call, so harvesting it too would double-run it
function findChainRootCallExpression(node, throughChainAssign = false) {
  const { root } = descendToChainRoot(node, throughChainAssign);
  return isCallShape(root) ? root : null;
}

// true when a single optional `?.` directly on a chain-root call keeps it LIVE in a null-guard memoize
// (`_ref = call`) - so its inner proxy-global must still be visitor-rewritten (`globalThis -> _globalThis`),
// like an SE-bearing root. requires EXACTLY ONE optional, the one on the call: a non-optional first hop
// (`(call).self.X`) inlines/collapses the call, and a SECOND optional anywhere (`(call)?.self?.Map.name`)
// makes the whole optional chain vestigially COLLAPSE to the always-defined polyfill on babel
// (`_nameMaybeFunction(_Map)`), dropping the call - both subsume the inner correctly
function chainRootCallKeptInOptionalGuard(node) {
  const { root, firstHop, optionalCount } = descendToChainRoot(node);
  // the single optional must be the hop ON the call (`firstHop.optional`): exactly one + on-the-call = the
  // rebind shape; zero / >1 / optional-elsewhere all collapse or inline, subsuming the inner correctly
  return optionalCount === 1 && isCallShape(root) && !!firstHop?.optional;
}

// true when a member ABOVE this one in the chain resolves to a receiver-WRAPPING `instance` polyfill
// (`_nameMaybeFunction(recv)` / `_flatMaybeArray(recv)`): such a leaf keeps the whole chain as a runtime
// receiver, so the optional rebind keeps the chain-root call LIVE (its inner must be visitor-rewritten).
// if NO wrapper sits above - the chain instead navigates a polyfilled ctor's prototype (`_Map.prototype.has`,
// whose leaf `resolveMeta` is null) or collapses to a ctor / static - the call is DROPPED, subsuming its
// inner. mirrors babel exactly: REBIND iff the leaf is a Maybe-wrapper, COLLAPSE for everything reached
// via `_Ctor...`. walks outward through the consuming member chain, peeling parser wrappers
function hasInstanceWrapperAbove({ path, scope, adapter, resolveMeta }) {
  if (!resolveMeta) return false;
  let parentPath = path?.parentPath;
  while (parentPath) {
    const type = parentPath.node?.type;
    if (type === 'ChainExpression' || type === 'ParenthesizedExpression' || type === 'TSNonNullExpression') {
      parentPath = parentPath.parentPath;
      continue;
    }
    if (type !== 'MemberExpression' && type !== 'OptionalMemberExpression') return false;
    const meta = buildMemberMeta({ node: parentPath.node, scope, adapter, path: parentPath });
    // a `[Symbol.iterator]` leaf is also a receiver-WRAPPING helper (`_getIteratorMethod(recv)`) but
    // `resolveMeta` does not classify the computed symbol key, so match it by key
    if (meta && (meta.key === 'Symbol.iterator' || resolveMeta(meta, parentPath)?.kind === 'instance')) return true;
    parentPath = parentPath.parentPath;
  }
  return false;
}

// SE-bearing call at the root of a chain (`(() => { c++; return X; })()`, direct or under member
// hops): a fold / flatten that DISCARDS the chain would silently drop the call's observable setup.
// returns the call node when it carries effects, null otherwise - callers either harvest it for
// re-emission or bail the discard entirely
export function seBearingChainRootCall({ node, scope, adapter, path }) {
  const rootCall = findChainRootCallExpression(node);
  return rootCall && inlineCallHasObservableEffects({ callNode: rootCall, scope, adapter, path })
    ? rootCall : null;
}

// collapse plan for a CALL/IIFE-rooted multi-hop proxy-global receiver (`(() => globalThis)().self.Array`):
// the proxy hop (`.self`) reads an undefined intermediate off the global object on hosts without it
// (ie:11 / Node throw). `maximalProxyGlobalPrefix` / `findProxyGlobal` validate only bare-Identifier
// roots, so a call root never collapses and the hop survives verbatim. returns the root global NAME the
// emitter substitutes for the dropped hop (resolved by inlining the call) and an SE-bearing chain-root
// call to preserve as a sequence prefix, so the rewrite is `(callSe, _root).leaf`. null unless the
// receiver is `<call-root>.<proxy-hop>.<leaf>` - a single-hop call (`(() => globalThis)().Array`) has
// no undefined intermediate and an Identifier-rooted chain is owned by the standard collapse
export function resolveCallRootedProxyCollapse({ receiver, scope, adapter, path }) {
  if (receiver?.type !== 'MemberExpression' && receiver?.type !== 'OptionalMemberExpression') return null;
  const hop = receiver.object;
  // the immediate hop is normally a proxy-nav MEMBER (`<call>.self` / `.window`); a SE-wrapping
  // SequenceExpression (`(c++, globalThis.self).Array`) hides that member as its TAIL - peel to it for the
  // key/root checks, but harvest SE from the WHOLE original `hop` below (`collectFoldedReceiverSideEffects`
  // recurses in source order, so nested sequences keep evaluation order)
  const hopMember = hop?.type === 'SequenceExpression' ? peelReceiverSequenceTail(hop) : hop;
  if (hopMember?.type !== 'MemberExpression' && hopMember?.type !== 'OptionalMemberExpression') return null;
  // the immediate hop must be a proxy navigation (`<call>.self` / `.window`): its own leaf key has to
  // be a proxy-global name. `resolveObjectName(hop)` is too weak - it returns truthy for a real ctor
  // leaf (`<root>.self.Map` resolves `'Map'`), wrongly accepting `globalThis.self.Map.prototype` as
  // proxy navigation and dropping `Map` to `_globalThis.prototype` (undefined off-engine)
  const hopKey = resolveKey({ node: hopMember.property, computed: hopMember.computed, scope, adapter, path });
  if (!hopKey || !POSSIBLE_GLOBAL_OBJECTS.has(hopKey)) return null;
  // resolve the CHAIN ROOT global, matching the Identifier collapse which substitutes the ROOT (not the
  // leaf hop): walk past the proxy hops to the call and resolve it by inlining. `.window` / `.self` chains
  // alike then read off the always-pure `_globalThis`, where the leaf-hop `window` may carry no pure entry
  const rootName = proxyGlobalChainRootName({ node: hopMember, scope, adapter, path });
  if (!rootName) return null;
  // harvest EVERY SE the collapse drops from the proxy-hop prefix: the chain-root call AND any hop-key SE
  // buried in a computed hop (`globalThis[(c++, 'self')]`). returning only the chain-root call missed a
  // key-buried effect in the memo path, silently dropping it on babel while unplugin kept it (desync + lost SE)
  const rescue = seedChainRootCallRescue({ node: receiver, scope, adapter, path });
  return { rootName, droppedSe: collectFoldedReceiverSideEffects(hop, [], rescue) };
}

// substrate-neutral proxy-global receiver collapse DECISION. the three emitter collapsers (babel
// `collapseProxyGlobalReceiver`, unplugin `resolveProxyGlobalChainSrc` / `substituteProxyGlobalRoot`)
// re-implemented this same decision (drop redundant `.self`/`.window` hops, swap the root to its pure import
// or keep an alias, harvest buried SE in eval order, recurse a deeper nav) against different substrates. this
// is the single source; each emitter RENDERS the result (babel builds AST, unplugin slices text). null when
// not collapsible. uses only shared provider primitives + the passed `resolvePure`. shapes:
//   { kind: 'collapse', rootBinding: { alias: node } | { pure: { entry, hintName } },
//     harvestedSE: node[], property: node, computed: bool }
//   { kind: 'member', inner: <plan>, property: node, computed: bool }   // deeper nav under a kept leaf chain
export function planProxyReceiver(receiver, { aliasCtx = null, isWriteTarget = false, bailOnPureLeaf = true, resolvePure }) {
  if (receiver?.type !== 'MemberExpression' && receiver?.type !== 'OptionalMemberExpression') return null;
  // collapsible only when the whole `.object` is the proxy-nav prefix; else try call/IIFE-rooted, then a deeper
  // nav stacked under a non-proxy leaf chain (`(c++, globalThis.self).Array.prototype`)
  if (maximalProxyGlobalPrefix(receiver, aliasCtx, isWriteTarget) !== receiver.object) {
    const callRooted = planCallRootedProxyReceiver(receiver, aliasCtx, resolvePure);
    if (callRooted) return callRooted;
    if (!findProxyGlobal(receiver, aliasCtx)) return null;
    const inner = planProxyReceiver(receiver.object, { aliasCtx, bailOnPureLeaf, resolvePure });
    return inner ? { kind: 'member', inner, property: receiver.property, computed: receiver.computed } : null;
  }
  // `bailOnPureLeaf` (synth-swap context): a pure-ctor leaf (`globalThis.self.Map`) is whole-swapped to `_Map`
  // elsewhere, so bail here (a root-collapse would emit native `_globalThis.Map` + a dead import). an INSTANCE-CALL
  // receiver keeps a pure ctor mid-chain (`globalThis.self.Array.prototype` -> `_globalThis.Array.prototype`) so it
  // passes bailOnPureLeaf=false to collapse through. a WRITE target's leaf is the assignment slot - hops still collapse
  const leafName = memberKeyName(receiver);
  if (bailOnPureLeaf && !isWriteTarget && leafName && resolvePure({ kind: 'global', name: leafName })) return null;
  // the leaf is itself a redundant proxy hop reached via a SE-bearing key (`globalThis[(e++, 'self')]`) - the
  // harvest reads the chain OBJECT not the key, so collapsing would re-root a proxy chain and loop; bail
  const hopLeaf = staticMemberKeyName(receiver);
  if (hopLeaf && POSSIBLE_GLOBAL_OBJECTS.has(hopLeaf)) return null;
  const root = findProxyGlobal(receiver, aliasCtx);
  const rootPure = root && resolvePure({ kind: 'global', name: root.name });
  // an ALIAS root (`const g = globalThis; g.self.X`) keeps its identifier and only drops the hops; a direct
  // root swaps to its pure ctor
  const isAliasRoot = isAliasProxyRoot(root, aliasCtx);
  if ((!rootPure || rootPure.kind === 'instance') && !isAliasRoot) return null;
  return {
    kind: 'collapse',
    rootBinding: isAliasRoot ? { alias: root } : { pure: { entry: rootPure.entry, hintName: rootPure.hintName } },
    harvestedSE: collectFoldedReceiverSideEffects(receiver.object),
    property: receiver.property,
    computed: receiver.computed,
  };
}

// call/IIFE-rooted proxy nav (`(() => globalThis)().self.Array`): `findProxyGlobal` validates only bare-Identifier
// roots, so the main path bails. resolve the root global (inlining the call), drop the proxy hop, keep an
// SE-bearing chain-root call as the harvested prefix
function planCallRootedProxyReceiver(receiver, aliasCtx, resolvePure) {
  if (!aliasCtx) return null;
  const plan = resolveCallRootedProxyCollapse({ receiver, ...aliasCtx });
  if (!plan) return null;
  const leafName = memberKeyName(receiver);
  if (leafName && resolvePure({ kind: 'global', name: leafName })) return null;
  const rootPure = resolvePure({ kind: 'global', name: plan.rootName });
  if (!rootPure || rootPure.kind === 'instance') return null;
  return {
    kind: 'collapse',
    rootBinding: { pure: { entry: rootPure.entry, hintName: rootPure.hintName } },
    harvestedSE: plan.droppedSe,
    property: receiver.property,
    computed: receiver.computed,
  };
}

// an inline-resolvable call at the root of a FOLDED chain (receiver collapsed into a static
// import, folded computed symbol key, folded `in` operand) carries observable setup the fold would
// silently drop - the parens/sequence walks only collect wrapper prefixes, not a folded call.
// harvest the call so the emit re-runs it in source order ahead of the polyfill value
function collectChainRootCallEffect({ node, sideEffects, scope, adapter, path }) {
  const rootCall = seBearingChainRootCall({ node, scope, adapter, path });
  if (rootCall) sideEffects.push(rootCall);
}

// seed a `rescue` Set with the chain-root call so an object-first fold walk emits it at the chain's source
// TERMINUS (deepest object, evaluated first) - interleaved ahead of shallower hop-key SE in a single pass.
// a two-step harvest-then-append would put the deep call LAST, reversing source `(call, key)` to `(key, call)`
function seedChainRootCallRescue({ node, scope, adapter, path }) {
  const rescue = new Set();
  const rootCall = seBearingChainRootCall({ node, scope, adapter, path });
  if (rootCall) rescue.add(rootCall);
  return rescue;
}

// resolve the ROOT proxy-global NAME of a member chain - the collapse substitutes the ROOT (`_globalThis`),
// not the leaf hop. descend to the root (call roots are kept so `resolveObjectName` can inline a chain-root
// IIFE), then resolve its name through the canonical resolver. returns null when the root isn't a proxy global
function proxyGlobalChainRootName({ node, scope, adapter, path }) {
  const { root } = descendToChainRoot(node);
  if (!root) return null;
  const name = resolveObjectName({ objectNode: root, scope, adapter, path });
  return name && POSSIBLE_GLOBAL_OBJECTS.has(name) ? name : null;
}

// outermost chain-assignment buried under a member chain (`(a = IIFE()).Array`, `(a = X).self.Y`).
// a fold that discards the chain must rescue the assignment WHOLE - it both updates the binding and
// re-runs everything inside it (including an SE-bearing call root), so the caller harvests it
// INSTEAD of probing the chain-root call (harvesting both would double-run the setup)
export function findBuriedChainAssignment(node) {
  let cur = node;
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    cur = unwrapTransparentSeq(cur.object);
    if (cur?.type === 'AssignmentExpression') return cur;
  }
  return null;
}

// observable node a DISCARD would silently drop: a chain-assignment (direct or buried under
// member hops - rescued WHOLE, see above), else an SE-bearing chain-root call. the destructure
// flatten consults this for the init it is about to discard; callers re-emit the returned node
// ahead of the extraction or bail the discard. NOT for the `in` fold, whose planner rescues a
// DIRECT assignment RHS itself - routing it through here would double-rescue
export function discardRescueNode({ node, scope, adapter, path }) {
  return (node.type === 'AssignmentExpression' ? node : findBuriedChainAssignment(node))
    ?? seBearingChainRootCall({ node, scope, adapter, path });
}

// ordered side effects a fallback-logical synth-collapse (`{from} = LEFT || Set`) must re-emit ahead
// of the polyfill literal: the structural prefixes of the resolved LEFT operand (`(eff(), Array)` ->
// `eff()`, plus the `+`-concat / template / computed-key fold-shapes the harvest already descends)
// AND a SE-bearing call at the chain ROOT of a call-rooted left (`IIFE().Array` / `mk().Array` -> the
// call), which the structural walk stops short of. the root call evaluates at its source position
// (after any structural prefix), so it appends last. shared by both emitters so the rescue set and
// its order cannot diverge between AST mutation and text compose
export function collectFallbackCollapseLeftSe({ leftNode, scope, adapter, path }) {
  const out = collectFoldedReceiverSideEffects(leftNode);
  const rootCall = seBearingChainRootCall({ node: leftNode, scope, adapter, path });
  if (rootCall && !out.includes(rootCall)) out.push(rootCall);
  return out;
}

// a rescued synth-swap receiver whose VALUE is discarded but whose verbatim re-emit would read an
// undefined INTERMEDIATE proxy hop off-browser (`globalThis[(eff(), 'self')].Array` ->
// `_globalThis.self...` / the AST emitter's `_self`, undefined on ie:11 / Node) must be DROPPED - re-emit
// ONLY the harvested side effects, the value is unused. true for a MULTI-hop member receiver (its
// `.object` is itself a member). the CALLER has already confirmed a rescue node exists (`rescueSe`: a
// folded-key effect OR an SE-bearing chain-root CALL / chain-assignment), so the drop keys on the SHAPE
// alone - the prior `collectFoldedReceiverSideEffects(inner).length` gate re-derived the rescue rescue-less
// and so re-EXCLUDED a chain-root-CALL receiver the caller's `rescueSe` already covered, leaving the
// `.self` hop verbatim (babel kept raw `.self`->throw, unplugin re-rooted `_self` + extra import).
// single-hop (`globalThis[(eff(), 'Array')]`) has no undefined intermediate -> keep the verbatim re-emit.
// shared so the AST and text emitters make the SAME drop decision (else they desync)
export function shouldDropRescueReceiver(inner) {
  if (!inner) return false;
  // unwrap the object through transparent wrappers / a SE-sequence tail before the type check - parsers
  // differ on keeping paren nodes (babel strips `((e(), gt).self)`, oxc keeps it as a wrapper)
  let obj = inner.object;
  for (let guard = 0; obj && guard < 32; guard++) {
    if (TRANSPARENT_EXPR_WRAPPER_TYPES.has(obj.type) || obj.type === 'ChainExpression') {
      obj = obj.expression;
    } else if (obj.type === 'SequenceExpression') {
      obj = obj.expressions.at(-1);
    } else break;
  }
  return obj?.type === 'MemberExpression' || obj?.type === 'OptionalMemberExpression';
}

// a static dispatch on a member-chain receiver collapses the WHOLE receiver into a single polyfill call
// (`globalThis[(o.push(1), 'Array')].from(x)` -> `_Array$from(x)`), so a side effect buried in the
// receiver's nested computed keys (incl `+` / template folds) OR its chain-root CALL would be silently
// dropped. walk the chain object-first (source eval order): the deepest object - a chain-root call seeded
// in `rescue` - is pushed FIRST, ahead of the shallower hop-key SE, so a two-step harvest-then-append
// can't reverse source `(call, key)` to `(key, call)`. STOPS at a chain-ASSIGNMENT (the emit re-emits the
// whole rhs, so harvesting it here too would double-run). instance dispatch memoizes the receiver,
// preserving its source + SE, so only the static path needs this
function collectCollapsingReceiverEffects(node, effects, rescue = null) {
  const peeled = unwrapParensCollectingEffects(node, effects);
  if (peeled?.type === 'MemberExpression' || peeled?.type === 'OptionalMemberExpression') {
    collectCollapsingReceiverEffects(peeled.object, effects, rescue);
    if (peeled.computed) collectFoldedReceiverSideEffects(peeled.property, effects);
  } else if (rescue?.has(peeled)) {
    effects.push(peeled);
  }
}

function buildMemberMeta({ node, scope, adapter, path }) {
  // collect side effects from both the receiver and the computed-key so a polyfill
  // replacement on this MemberExpression (which discards the whole subtree) can re-emit
  // them via a SequenceExpression wrap in the plugin's emission path
  const sideEffects = [];
  // `obj` is then passed to `resolveObjectName` which calls `unwrapTransparentSeq` again - idempotent
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
  // resolveKey can't walk identifier-alias chain through a TS expression wrapper root.
  // the outer key SE goes into a separate list so receiver-chain SE (collected below once the
  // receiver classifies as a collapsing static) can be ordered before it - source eval runs the
  // receiver, including its nested computed keys, before this property key
  const keyEffects = [];
  // peel the computed key to its sequence tail (reused below to enumerate the usage-global key union
  // when it is a conditionally reassigned alias). harvest the key SE through the fold-descending
  // collector - a folded-away key (`[(eff(), 'fr') + 'om']`, `` [`fr${(eff(),'o')}m`] ``) collapses
  // with the member, so a SE buried in a `+` / template operand must re-emit too, not just a top-level
  // sequence prefix. peel + collect are split so the side channel still collects exactly once
  const computedKeyNode = node.computed ? peelReceiverSequenceTail(node.property) : null;
  if (node.computed) collectFoldedReceiverSideEffects(node.property, keyEffects);
  const key = node.computed
    ? resolveKey({ node: computedKeyNode, computed: true, scope, adapter, path })
    : node.property.name || node.property.value;
  if (!key || key === 'prototype') return null;
  let meta = tryBuildPrototypeMeta({ obj, key, scope, adapter, path });
  // a SE-SEQUENCE-rooted ctor sub-receiver of a prototype-method read (`(c++, globalThis.self).Map.prototype
  // .has` OR the deeper `(c++, globalThis).self.Map.prototype.has`) buries its leading SE below `node.object`
  // (which is `X.Map.prototype`, a member - the top-level collect above saw none). descend the ctor sub-receiver
  // proxy nav to its root; when that root is a SequenceExpression, harvest the folded SE into a SEPARATE field
  // so ONLY the prototype-FALLBACK ctor swap re-emits it (`(c++, _Map).prototype.has`). the instance path
  // (`X.Array.prototype.flat`) also builds a prototype meta but already harvests its receiver SE via its own
  // collapse - putting this in `sideEffects` would double-count there and spuriously memoize. an IIFE-call /
  // chain-assignment / computed-key nav root is owned elsewhere; mirrors the resolver's matching gate
  if (meta && proxyNavRootIsSequence(obj.object)) {
    const protoCtorReceiverSE = [];
    collectFoldedReceiverSideEffects(obj.object, protoCtorReceiverSE);
    if (protoCtorReceiverSE.length) meta.protoCtorReceiverSE = protoCtorReceiverSE;
  }
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
    // static-position access on a known global: tag the receiver type so the resolver gates the
    // instance-method fallback (`Array.concat` bails - concat is `Array.prototype`, not on the
    // `Array` constructor; `Array.name` resolves via the function variant). same gate the
    // destructure path already applies to `const { concat } = Array`
    meta = { kind: 'property', object: objectName, key, placement, receiverHint: staticReceiverHint(placement, objectName) };
    // usage-global: a conditionally reassigned receiver / computed-key reaches more than the
    // declarator-init primary - emit a side-effect import for each reachable target too
    const extraCandidates = collectMemberUnionCandidates({
      objectNode: classifyTarget, computedKeyNode, primaryObject: objectName, primaryKey: key, scope, adapter, path,
    });
    if (extraCandidates.length) meta.extraCandidates = extraCandidates;
    // gated on `!chainAssignOuter` because a chain-assign receiver already re-emits its whole rhs
    // (including these nested keys) via the preserved assignment - collecting here too double-runs it.
    // static collapse discards the WHOLE receiver, so harvest its SE (chain-root call + buried hop-key) in
    // source-eval order via the rescue-seeded fold walk
    if (placement === 'static' && !chainAssignOuter) {
      const rescue = seedChainRootCallRescue({ node: classifyTarget, scope, adapter, path });
      collectCollapsingReceiverEffects(classifyTarget, sideEffects, rescue);
    }
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
    // probe the chain root when there's no chain-assign wrapper. the STATIC case already harvested its
    // chain-root call (interleaved via the rescue above), so only NON-static dispatch reaches here - its
    // memoized receiver keeps the hop SE in place, leaving just the chain-root call to preserve
    if (objectName && placement !== 'static' && !chainAssignOuter) {
      collectChainRootCallEffect({ node: classifyTarget, sideEffects, scope, adapter, path });
    }
  }
  // record where the receiver-SE ends (everything collected above: parens/sequence + chain-collapse +
  // inline-call root) so the emit-side receiver/key split uses the SAME boundary the build collected,
  // not a narrower recompute that undercounts a member-chain / inline-call receiver to 0
  meta.receiverEffectCount = sideEffects.length;
  // outer key SE runs after the receiver (including any nested key SE collected above)
  sideEffects.push(...keyEffects);
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
export function handleMemberExpressionNode({ node, scope, adapter, handledObjects, suppressProxyGlobals, path, resolveMeta }) {
  const symbolKey = resolveComputedSymbolKey({ node, scope, adapter, path });
  if (symbolKey) {
    // mark both positions so neither the member-visitor (outer MemberExpression.object) nor
    // the identifier-visitor (unwrapped Identifier) re-enters this node. `asSymbolRef`
    // already walked the `unwrapTransparentSeq` chain and confirmed the binding guard
    handledObjects.add(symbolKey.ref.raw);
    handledObjects.add(symbolKey.ref.unwrapped);
    // usage-pure rewrites the WHOLE member-expression (`obj[globalThis.Symbol.iterator]` ->
    // `_getIteratorMethod(obj)`), so a proxy-global root inside the computed key must be
    // subsumed too - otherwise the inner identifier visitor queues a parallel `globalThis ->
    // _globalThis` rewrite that overlaps the outer text replacement and crashes the queue.
    // usage-global keeps the member-expression, so the proxy-global stays visible and earns
    // its own polyfill (same mode split as `handleBinaryIn`)
    // the receiver is KEPT as the polyfill argument (`_getIteratorMethod(<receiver>)`). a proxy-global hop
    // in it (`globalThis.self[Symbol.iterator]`) must collapse to the proxy ROOT the SAME way on both
    // emitters - a kept leaf hop diverges (babel `_self`, dead `_globalThis.self.window`; unplugin crash /
    // root). resolve the proxy ROOT + the SE its hop chain drops ONCE here so both emitters render
    // `_getIteratorMethod((droppedSe, _root))` identically; `_<root>` (`_globalThis`) is always defined,
    // unlike a leaf-hop pure import. gate on a proxy-global root so a real-object receiver
    // (`arr[Symbol.iterator]`) stays untouched (it is the genuine argument)
    let symbolReceiverProxyRoot = null;
    if (suppressProxyGlobals) {
      markSubsumedProxyChain(symbolKey.ref.unwrapped, handledObjects, scope, adapter, path);
      // peel a SEQUENCE / paren wrapper to the receiver's actual proxy chain (`(n++, globalThis.self)` ->
      // `globalThis.self`) before resolving + subsuming it. its proxy tail MUST be subsumed too - else the
      // member visitor's `globalThis.self -> _self` rewrite collides with the collapsed receiver and the
      // text compose throws ("could not locate inner needle")
      const receiverObj = unwrapTransparentSeq(node.object);
      const receiverChain = peelReceiverSequenceTail(receiverObj);
      const receiverName = resolveObjectName({ objectNode: receiverChain, scope, adapter, path });
      if (receiverName && POSSIBLE_GLOBAL_OBJECTS.has(receiverName)) {
        // subsume the chain so the identifier visitor does not queue a parallel rewrite (unplugin crash)
        markSubsumedProxyChain(receiverChain, handledObjects, scope, adapter, path);
        // collapse to the proxy ROOT from the (sequence-peeled) tail chain; the prefix SE of a sequence
        // receiver re-emits via `droppedSe` (`(n++, globalThis.self)` -> `(n++, _globalThis)`). this keeps
        // BOTH emitters consistent with how they collapse a sequence-tail hop for other dispatch
        // (`(n++, globalThis.self).Map` -> `(n++, _Map)`); babel kept a leaf `_self` ONLY for symbol-iter
        const rootName = proxyGlobalChainRootName({ node: receiverChain, scope, adapter, path });
        if (rootName) {
          const rescue = seedChainRootCallRescue({ node: node.object, scope, adapter, path });
          symbolReceiverProxyRoot = { rootName, droppedSe: collectFoldedReceiverSideEffects(node.object, [], rescue) };
        }
      }
    }
    // re-emit side effects in source eval order: receiver first, then computed-key
    // (`(recv(), arr)[Symbol[(key(), 'iterator')]]`). the emit replays the receiver-SE by either
    // peeling + prepending (non-optional) or via the null-guard memoize (optional - where the
    // suppress path drops this prefix and folds only the key-SE), so collect both here in order
    const meta = { kind: 'property', object: null, key: symbolKey.key, placement: 'prototype' };
    const sideEffects = [];
    // a collapsed proxy receiver carries its OWN SE in `droppedSe` (embedded in `(droppedSe, _root)`), so
    // the receiver SE must NOT also enter meta.sideEffects (would double-run). otherwise collect it here
    if (symbolReceiverProxyRoot) meta.symbolReceiverProxyRoot = symbolReceiverProxyRoot;
    else unwrapParensCollectingEffects(node.object, sideEffects);
    meta.receiverEffectCount = sideEffects.length;
    sideEffects.push(...symbolKey.sideEffects);
    if (sideEffects.length) meta.sideEffects = sideEffects;
    return meta;
  }
  const meta = buildMemberMeta({ node, scope, adapter, path });
  // a static the user monkey-patches in this file is NOT a polyfillable static: binding the
  // read to the frozen receiver-less import would bypass the patch, and bailing whole leaves
  // code referencing a possibly-missing global. return no meta and leave the receiver
  // UNMARKED - the identifier machinery substitutes the CONSTRUCTOR itself, so the patch and
  // every read share the injected object (pure only; usage-global overlays the global slot)
  if (meta?.object && meta.placement === 'static' && adapter.isMutatedStatic?.(meta.object, meta.key)) return null;
  // only mark when we actually resolved a receiver: meta.object === null means
  // `resolveObjectName` couldn't classify the receiver (unknown local, complex expression)
  // and the receiver identifier-visitor may still need to polyfill it as a standalone global
  if (meta?.object) {
    // suppress the receiver's identifier / member visitors only when the member actually subsumes
    // the receiver. a "static" on a proxy-global itself (`globalThis.foo`, `(() => globalThis)().flat`)
    // resolves to a real polyfill ONLY when the key names a global (`self.Map` -> `_Map`); an
    // unresolved key emits no replacement (and proxy-globals never take the static fallback), so the
    // receiver survives and its inner proxy-global must keep its own substitution - marking it handled
    // would strand a raw `globalThis` / `self` (ReferenceError ie:11). a constructor-rooted chain collapses
    // via its ctor member ONLY when that ctor is pure-resolvable (`globalThis.Map.prototype.has` -> `_Map`);
    // a NON-pure ctor (`globalThis.self.Headers.prototype.append`, no `_Headers`) does NOT collapse, so it
    // must drop to the leaf-resolves check - which keeps an instance-method chain (`.Array.prototype.flat`,
    // method resolves) but un-subsumes a dead ctor whose SE-wrapped proxy root would otherwise strand raw
    const subsumesReceiver = (!POSSIBLE_GLOBAL_OBJECTS.has(meta.object)
        && !!resolveMeta?.({ kind: 'global', name: meta.object }, path))
      || !resolveMeta || !!resolveMeta(meta, path);
    markHandledObjects(node, handledObjects, suppressProxyGlobals, scope, adapter, path, subsumesReceiver);
    // a static-placement member collapses the WHOLE `X.prop` to one import (`Symbol.iterator` ->
    // `_Symbol$iterator`, `Promise.resolve` -> `_Promise$resolve`), so the receiver chain is SUBSUMED -
    // unlike a prototype-method receiver (`_Map.prototype.has`) whose constructor member stays the
    // single source of the receiver replacement. when the chain roots in an inline-resolvable call
    // (`(() => globalThis)().self.Symbol.iterator`, `(a = IIFE()).Promise.resolve(1)`), the hops are
    // invisible to `markHandledObjects` (its predicates only recognise Identifier-rooted chains), so
    // each hop would queue its own rewrite overlapping the outer collapse and crash unplugin's text
    // queue. delegate to the same chain subsumption the symbol-key / `in` paths use: it marks every
    // hop + wrapper, and its root marking skips the inner proxy-global leaf when the call carries
    // observable effects (the re-emitted body keeps a live reference that still needs `_globalThis`)
    if (suppressProxyGlobals && subsumesReceiver && meta.placement === 'static'
      && findChainRootCallExpression(node.object, true)) {
      // the chain-root call stays LIVE (its inner must be visitor-rewritten) when the optional `?.` guard
      // memoizes it AND a receiver-WRAPPING `instance` polyfill keeps the chain as a runtime receiver - either
      // THIS member is itself that wrapper leaf (`...Map.name` -> `_nameMaybeFunction(_ref.self.Map)`), or one
      // sits above it in the chain. otherwise the chain collapses to a receiver-less import (ctor / static / a
      // polyfilled ctor's `.prototype.method`, whose leaf resolves to null), dropping the call - subsume the inner
      const keepCallInner = chainRootCallKeptInOptionalGuard(node)
        && ((!POSSIBLE_GLOBAL_OBJECTS.has(meta.object) && resolveMeta?.(meta, path)?.kind === 'instance')
          || hasInstanceWrapperAbove({ path, scope, adapter, resolveMeta }));
      markSubsumedProxyChain(node.object, handledObjects, scope, adapter, path, keepCallInner);
    }
  }
  return meta;
}

// `resolveKey` can fold StringLiteral / TemplateLiteral / `+` concat to the string
// `'Symbol.X'`, but none of those are the well-known symbol. this predicate rejects
// string-sourced keys so `'Symbol.iterator' in Array` isn't miscategorised as an
// is-iterable check. parallel to resolveKey's Identifier / MemberExpression branches
// minus the string-folding cases
function isSymbolSourcedKey({ node, scope, adapter, seen, path, depth = 0 }) {
  if (depth > MAX_KEY_DEPTH) return false;
  node = unwrapTransparentSeq(node);
  const { type } = node;
  // string-folded sources - plain strings, not the symbol
  if (adapter.isStringLiteral(node) || type === 'TemplateLiteral'
    || (type === 'BinaryExpression' && node.operator === '+')) return false;
  // Symbol[.X] direct / via chained proxy-global - canonical symbol-ref shape.
  // also confirm the property is a symbol-name shape: `symbolKeyToEntry` maps ANY lowercase-first
  // name to a synthetic `symbol/<name>` entry, so it does not itself filter to well-known symbols
  // (`Symbol.someUserKey` passes here too). the real well-known gate is downstream `isEntryNeeded`
  // / `isEntryAvailable`, which turns a non-well-known name into a noop plan (no dead import), so a
  // random `Symbol.foo` never triggers symbol-routed dispatch.
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
  const entry = enterIdentifierBindingFollow({ node, scope, adapter, seen, path });
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

// `node[Symbol.iterator]` fetches the iterator directly (`get-iterator`) only when it is
// immediately and plainly called with zero args and no optional - `node[Symbol.iterator]()`. Any
// other shape (no call, args, optional, `new`) needs the method form so the call / optional / args
// stay on the caller's side. `isCall` ("is `parent` a plain call whose callee is `node`") is
// supplied by the caller because that test is AST-dialect-specific: babel has no parenthesis nodes
// so a strict callee match suffices, while oxc keeps them so unplugin unwraps the callee. The
// default is the babel-shape strict match
export function resolveSymbolIteratorEntry(node, parent, isCall = isCallShape(parent) && parent.callee === node) {
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
  const left = unwrapTransparentSeq(node.left);
  // peel SequenceExpression-tail on the receiver: `(fn(), Symbol).iterator in obj`
  // should resolve to the symbol-in polyfill path same as bare `Symbol.iterator in obj`.
  // SE preceding-elements are preserved at emit time by the structural harvest
  // (`collectFoldedReceiverSideEffects`) walking the original LHS subtree, so peeling here
  // doesn't drop side-effects
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
      // harvest the chain-root receiver call here rather than at emit - scope/adapter are live at
      // detection (a provably-pure inline receiver call is dropped); the emit-time structural harvest
      // threads it back in via `rescue` so it interleaves at its true source position
      const sideEffects = [];
      collectChainRootCallEffect({ node: left, sideEffects, scope, adapter, path });
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
      return { kind: 'in', key, object: null, placement: null, symbolSourced: true, sideEffects };
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
  let rightObject = unwrapTransparentSeq(node.right);
  if (rightObject?.type === 'SequenceExpression') rightObject = unwrapTransparentSeq(rightObject.expressions.at(-1));
  if (resolvedLeft) {
    const objectName = resolveObjectName({ objectNode: rightObject, scope, adapter, seen: new Set(), path });
    if (objectName) {
      const placement = isStaticPlacement(objectName);
      if (placement) {
        // a monkey-patched static must not FOLD: the fold's `true` assumes the polyfill key,
        // but the user's patch (or delete) owns the slot. no meta + no marking - the RHS
        // receiver substitutes through the identifier machinery and `in` evaluates live
        if (adapter.isMutatedStatic?.(objectName, resolvedLeft)) return null;
        const meta = { kind: 'in', key: resolvedLeft, object: objectName, placement };
        // usage-pure FOLDS this meta to `true`, discarding the RHS. the planner harvests the
        // discarded operand's STRUCTURAL effects (sequence prefixes + tails, computed keys, buried
        // assignments rescued WHOLE) off `node.right`. detection adds only the scope-aware bit the
        // structural walk can't decide: a provably-IMPURE inline receiver call at the chain root
        // (`'from' in mk().Array` keeps `mk()`; a pure `(() => Map)()` is dropped to bare `true`).
        // a chain-ASSIGNMENT root is NOT probed here - the planner rescues the whole assignment,
        // which already reruns any call inside it, so harvesting both would double-run the setup
        const sideEffects = [];
        collectChainRootCallEffect({ node: rightObject, sideEffects, scope, adapter, path });
        if (sideEffects.length) meta.sideEffects = sideEffects;
        return meta;
      }
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
  // the Symbol ref's proxy-global chain receiver (`(c++, globalThis.self).Symbol.iterator`,
  // `(c++, globalThis).self.Symbol.iterator`) is fully dropped when the eliminated `o[key]` rewrites to
  // `_getIteratorMethod(o)`; descend the whole chain receiver and harvest every buried effect at any hop
  // depth so they re-emit. only the chain form (`X.Symbol`, a member) drops it - a direct `(c++, Symbol)`
  // keeps the whole key (SE survives there). the chain-root CALL is left to `collectChainRootCallEffect`
  // (its purity is scope-aware), so no double-collect with the structural descent here
  if (prop.object.type === 'MemberExpression' || prop.object.type === 'OptionalMemberExpression') {
    collectFoldedReceiverSideEffects(prop.object, sideEffects);
  }
  collectChainRootCallEffect({ node: prop, sideEffects, scope, adapter, path });
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
// and its unwrapped inner matches any of them. a buried SequenceExpression is ALSO peeled to its
// TAIL (the chain value resolves through the last element) but NOT marked: its prefix effects
// survive and are re-emitted, so marking the whole sequence would skip them. without the SE peel a
// chain buried in a sequence tail (`(0, (() => globalThis)().self).Array`) left its inner proxy /
// IIFE root unmarked -> unplugin queued a parallel rewrite overlapping the outer subsumption -> crash
function peelMarkedWrappers(node, handledObjects) {
  while (node) {
    if (isTransparentWrapper(node)) {
      handledObjects.add(node);
      node = node.expression;
    } else if (node.type === 'SequenceExpression') {
      node = node.expressions.at(-1);
    } else break;
  }
  return node;
}

// mark a proxy-global leaf identifier as handled so the inner visitor doesn't queue a parallel
// `globalThis -> _globalThis` rewrite overlapping the outer subsumption. shadow detection via
// `adapter.hasBinding(scope, name, path)` (not raw `scope.getBinding`) catches TS-runtime bindings
// (`declare const globalThis` / `namespace X`) that estree-toolkit's scope tracker misses but the
// polyfill shadow rule must honor - a binding that shadows the global keeps its own polyfill
function markProxyGlobalLeaf(node, handledObjects, scope, adapter, path) {
  if (node?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(node.name)
    && !(adapter ? adapter.hasBinding(scope, node.name, path) : scope?.getBinding?.(node.name))) {
    handledObjects.add(node);
  }
}

// record the full proxy-global chain (including any wrappers at every level) so the outer
// rewrite that subsumes it doesn't re-fire on the leaves. handles `(globalThis as any).Symbol.iterator`
// and deeper nests like `(self as any)[(...)]` uniformly through `peelMarkedWrappers`.
// scope-aware leaf check: a user binding that shadows a known global (`function f(globalThis)
// { globalThis.Symbol.iterator in arr }`) must NOT be marked as handled - the local binding
// has its own value, and suppressing the polyfill here would silently drop a legitimate emit
function markSubsumedProxyChain(node, handledObjects, scope, adapter, path, keepCallInner = false) {
  let current = peelMarkedWrappers(node, handledObjects);
  while (current && (current.type === 'MemberExpression' || current.type === 'OptionalMemberExpression')) {
    handledObjects.add(current);
    current = peelMarkedWrappers(current.object, handledObjects);
  }
  if (current?.type === 'Identifier') {
    markProxyGlobalLeaf(current, handledObjects, scope, adapter, path);
  } else if (scope && adapter && isCallShape(current)) {
    // IIFE-rooted proxy-global receiver (`(() => globalThis)().Symbol.iterator in obj`): the
    // chain bottoms on a CallExpression that inlines to a proxy global. mark the call + its
    // inner identifier so the inner visitor doesn't queue a parallel `globalThis -> _globalThis`
    // rewrite overlapping the outer subsumption, the same way markHandledObjects treats an
    // IIFE-rooted constructor chain. without it unplugin's text-emit crashes the compose.
    // `keepCallInner`: the call is held LIVE by an optional `?.` guard, so leave its inner alone
    markInlinedProxyGlobalRoot({ callNode: current, scope, adapter, path, handledObjects, keepCallInner });
  }
}

// walk a proxy-global MemberExpression chain down to its leaf identifier, marking every
// link AND the leaf so unplugin's text-emit doesn't queue parallel rewrites that overlap
// an outer polyfill replacement. returns the unwalked node (typically a CallExpression
// for IIFE-rooted chains, terminator otherwise) so callers can chain further marking
function markChainLinksAndProxyLeaf(node, handledObjects) {
  let cur = unwrapTransparentSeq(node);
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    handledObjects.add(cur);
    cur = unwrapTransparentSeq(cur.object);
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
function markInlinedProxyGlobalRoot({ callNode, scope, adapter, path, handledObjects, keepCallInner = false }) {
  // an optional `?.` guard memoizes the call and keeps it live (`_ref = call`), so its inner survives in
  // the output and must still be visitor-rewritten - same reasoning as the observable-effects bail below
  if (keepCallInner) return;
  let current = callNode;
  while (isCallShape(current)) {
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
  // descend WITH chain-assignment peeling: a chain-assignment root (`(a = globalThis).Promise.resolve`) or an
  // SE-prefix root (`(n++, g).Map` with `const g = globalThis`) hides the proxy-global behind an
  // AssignmentExpression / SequenceExpression - without the peel the mid-chain ctor stays unmarked and
  // unplugin queues an overlapping rewrite. only an IDENTIFIER root classifies here (no call inlining)
  const { root } = descendToChainRoot(node, true);
  if (root?.type !== 'Identifier') return false;
  // null / undefined resolved name is not in the set, so no explicit nullish guard needed
  return POSSIBLE_GLOBAL_OBJECTS.has(resolveObjectName({ objectNode: root, scope, adapter, path }));
}

function markHandledObjects(node, handledObjects, suppressProxyGlobals, scope, adapter, path, subsumesReceiver = true) {
  let obj = unwrapTransparentSeq(node.object);
  // a sequence receiver `(eff(), globalThis.Array).from` resolves through its LAST element; the
  // prefix expressions survive in the output (their own polyfills must still fire), so descend to
  // the tail without marking the prefix. without this the proxy-global leaf stays unmarked and
  // unplugin queues a parallel `globalThis -> _globalThis` rewrite overlapping the outer subsumption
  // (`_Array$from`) - the text-transform queue can't compose the eliminated needle and throws
  const wasSequence = obj.type === 'SequenceExpression';
  while (obj.type === 'SequenceExpression') obj = unwrapTransparentSeq(obj.expressions.at(-1));
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
  let buriedSequence = false;
  while ((current.type === 'MemberExpression' || current.type === 'OptionalMemberExpression')
    && (findProxyGlobal(current) || chainRootResolvesToProxyGlobal({ node: current, scope, adapter, path }))) {
    handledObjects.add(current);
    // descend into a sequence BURIED below a static hop (`(eff(), globalThis.self).Array`, where the
    // top-level receiver is NOT itself a sequence): SE-blind unwrapTransparentSeq stopped at the sequence,
    // leaving its inner proxy leaf unmarked -> the member visitor queued a parallel rewrite the outer
    // collapse couldn't compose -> crash. a TOP-LEVEL sequence (wasSequence) is already peeled to its
    // tail, and its OWN nested sequence stays SE-blind here: peeling it would over-suppress a forwarder's
    // inner global (`(p(), (p(), globalThis).globalThis).Array`) into a dead `_globalThis` import
    if (!wasSequence && unwrapTransparentSeq(current.object).type === 'SequenceExpression') buriedSequence = true;
    current = wasSequence ? unwrapTransparentSeq(current.object) : peelReceiverSequenceTail(current.object);
  }
  // a sequence-tail proxy-global leaf is independently visited (the tail sits inside a separately
  // walked SequenceExpression), unlike a direct receiver whose nested leaf the member visitor's
  // subtree-skip suppresses. mark it when the chain descended through proxy-global member(s)
  // (`current !== obj`) and the tail sat inside a sequence - a top-level one (`(eff(), globalThis.Array)
  // .from` -> `_Array$from`) or one buried below a static hop. a BARE tail global (`(eff(), globalThis)
  // .flat`, `.flat` gated off the global) is the receiver itself and keeps its own `_globalThis` polyfill
  // gated on `subsumesReceiver` (like the IIFE path below): when the static does NOT resolve to a collapse
  // (`(eff(), globalThis.self).Array` - Array native, `.foo` non-global, a class-extends superclass), the SE
  // receiver survives and its proxy-global leaf keeps its own substitution - marking it strands a raw global
  if ((wasSequence || buriedSequence) && current !== obj && subsumesReceiver) {
    markProxyGlobalLeaf(current, handledObjects, scope, adapter, path);
  }
  // IIFE-rooted chain (`(() => globalThis)().self.Map.prototype.has`): the chain bottoms
  // out on a CallExpression that `resolveProxyGlobalRoot` inlines to a proxy-global identifier.
  // `findProxyGlobal` returns null for IIFE roots (it only validates bare-Identifier roots),
  // so the loop above doesn't enter. walk down the remaining MemberExpression links, marking
  // each whose property is a proxy-global key (`.self`, `.window`) - those intermediate hops
  // would otherwise queue parallel substitutions overlapping the outer constructor rewrite.
  // non-proxy keys (`.Map`, `.prototype`) deliberately stay unmarked so the constructor
  // member visit fires its own substitution and stays the single source of the receiver
  // replacement. then delegate to `markInlinedProxyGlobalRoot` for the IIFE + inner identifier.
  // gated on `subsumesReceiver`: an IIFE-rooted chain whose member does NOT resolve to a real
  // collapse (`(() => globalThis)().foo`, `(() => globalThis)().Array` where Array is native on
  // the target) keeps the IIFE in the output, so its inner proxy-global is a LIVE reference that
  // the identifier visitor must still substitute - marking it handled would strand a raw global.
  // a bare / SE-tail-rooted chain (handled above) always collapses, so it stays ungated
  if (scope && adapter && subsumesReceiver) {
    // an OPTIONAL hop keeps the chain-root call live in the null-guard (`_ref = call`) rather than inlining it
    // away, so its inner proxy-global stays a reference the identifier visitor must rewrite - subsuming it here
    // strands a raw `globalThis`. skip broadly on any optional hop; the static-leaf path (markSubsumedProxyChain
    // via the placement-static branch) re-subsumes the receiver-LESS collapse cases that genuinely drop the call
    let optionalToCall = node.type === 'OptionalMemberExpression' || node.optional;
    while (current?.type === 'MemberExpression' || current?.type === 'OptionalMemberExpression') {
      const propName = current.computed ? null : current.property?.name;
      if (!propName || !POSSIBLE_GLOBAL_OBJECTS.has(propName)) break;
      if (current.type === 'OptionalMemberExpression' || current.optional) optionalToCall = true;
      handledObjects.add(current);
      current = unwrapTransparentSeq(current.object);
    }
    if (isCallShape(current) && !optionalToCall) {
      markInlinedProxyGlobalRoot({ callNode: current, scope, adapter, path, handledObjects });
    }
  }
}

