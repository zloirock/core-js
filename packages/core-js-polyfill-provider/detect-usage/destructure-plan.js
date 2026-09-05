// nested-destructure flatten DECISION layer, shared by both emitters: classify every outer
// prop of a flatten-eligible declarator (proxy-global / bare-constructor / static-object
// receiver) into a parser-agnostic plan tree. both bindings RENDER the tree into their own
// dialect - keys, sentinel names and import bindings are render concerns and stay out of it.
// plan node kinds:
//   - { kind: 'verbatim', prop }               keep the prop untouched (residual)
//   - { kind: 'consumed', prop, extractions }  drop the prop, bind extractions instead
//     (under a rest sibling the renderer keeps a `key: <throwaway>` sentinel so rest
//     exclusion survives)
//   - { kind: 'symbol-iterator-key', prop }    keep the prop, polyfilling only its computed
//     `[Symbol.iterator]` key text (non-binding value - the synth extraction can't fire,
//     but a raw `Symbol.iterator` key would throw on engines without `Symbol`)
//   - { kind: 'rebuilt', prop, pattern, extractions, children }
//     partially-consumed nested pattern: one child plan per inner prop, survivors re-render
// extraction records: { entry, hint, localName } resolved pure entries, or
// { synth: 'symbol-iterator', localName } for the `_getIteratorMethod(receiver)` shape.
// a 'rebuilt' node's `extractions` already aggregates its children's - consumers read
// extractions at the OUTER level only and use child lists for residual rendering
import {
  aliasEscaped,
  aliasSlotWritten,
  catchPropRewriteObservable,
  createInstanceNodeCache,
  findObjectKeyBeforeSpread,
  followConstIdentifierInit,
  isChainAssignment,
  isDestructurePattern,
  isRestProperty,
  mayHaveSideEffects,
  objectInitSpreadSurvives,
  objectLiteralHoldsObservable,
  objectPropertyReadValue,
  peelNestedSequenceExpressions,
  peelZeroArgIifeReturn,
  plainSynthKeyName,
  POSSIBLE_GLOBAL_OBJECTS,
  propBindingIdentifier,
  propertyKeyName,
  receiverCarriesLiveOptional,
  spelledSlotName,
  unwrapCollectingSePrefixes,
  unwrapExpressionChain,
  unwrapRuntimeExpr,
} from '../helpers/ast-patterns.js';
import { resolve as resolveBuiltIn } from '../index.js';
import { computedPropKeyHostsMachinery } from './members.js';
import {
  chainSealsAShortCircuit,
  consumableHopSlotName,
  discardRescueNodes,
  guaranteedRealmObjectName,
  isStaticPlacement,
  isUndefinedNode,
  navValueCanShortCircuit,
  peelRealmLogicalDefault,
  proxyReceiverValueCanBeUndefined,
  resolveKey as sharedResolveKey,
  resolveObjectName,
} from './resolve.js';
import {
  mirrorAcceptedKey,
  buildDestructuringInitMeta,
  destructureHostInitNode,
  destructurePatternHostPath,
  destructureRightIsReceiver,
  fallbackInitWhollyDiscardable,
  resolveBranchProxyName,
  walkStaticReceiverChain,
} from './destructure.js';

// object-prop node across parsers: estree `Property`, babel `ObjectProperty`
function isPropertyNode(node) {
  return node?.type === 'Property' || node?.type === 'ObjectProperty';
}

// collapse a fallback init (logical / ternary / chain-assignment / transparent IIFE) to the
// operand the flatten binds to, exactly like the flat meta - see the call site's contract
// comments. `fallbackDropped` reports a REACHABLE branch was discarded: the fallback rescues
// the nullish path there, so the full-consume throw probe stays off
function collapseFallbackInit({ init, scope, adapter, path, resolveGlobalPolyfill }) {
  let fallbackDropped = false;
  if (init?.type === 'LogicalExpression' || init?.type === 'ConditionalExpression'
    || isChainAssignment(init)
    || ((init?.type === 'CallExpression' || init?.type === 'OptionalCallExpression') && peelZeroArgIifeReturn(init))) {
    if (!fallbackInitWhollyDiscardable(init)) init = null;
    else for (let guard = 0; guard < 8 && init; guard++) {
      const inlined = peelZeroArgIifeReturn(init);
      if (inlined) init = unwrapExpressionChain(inlined);
      // a chain assignment evaluates to its RHS; the harvest rescues it WHOLE
      else if (isChainAssignment(init)) init = unwrapExpressionChain(init.right);
      // a ternary collapses to its consequent ONLY when the alternate agrees on a global proxy
      // (the shared predicate the identification resolver uses); a diverging alternate means
      // the runtime may pick a receiver the polyfill is wrong for, so bail and stay native
      else if (init.type === 'ConditionalExpression') {
        // NO `fallbackDropped` here: the agreement gate admits only branches naming the SAME
        // proxy, so the dropped alternate is exactly as (un)definable as the kept consequent -
        // it rescues nothing, and the probe question stays with the collapsed operand
        // (`c ? globalThis.window : globalThis.window` still throws on a full consume)
        init = resolveBranchProxyName({ branchNode: init.consequent, scope, adapter, path })
          && resolveBranchProxyName({ branchNode: init.alternate, scope, adapter, path })
          ? unwrapExpressionChain(init.consequent) : null;
      } else if (init.type === 'LogicalExpression') {
        const collapsed = collapseLogicalInitOperand({ init, scope, adapter, path, resolveGlobalPolyfill });
        fallbackDropped ||= collapsed.dropped;
        init = collapsed.value;
      } else break;
    }
  }
  return { init, fallbackDropped };
}

// one step of the fallback-init collapse over a `||` / `??`: those select their RIGHT operand
// exactly when the left value is nullish / falsy - and a short-circuit hidden under a SEAL
// never hands nullish on (the read above the seal THROWS instead), so a sealed-read left keeps
// its fallback DEAD and collapses like a plain init. a genuinely nullish-able left makes the
// fallback reachable: the flatten may bind the polyfill to the left only when the fallback
// agrees on the same receiver (`nav ?? Array`); a diverging fallback (`nav ?? {}`) keeps the
// source native - its legitimate value must not become the polyfill. `&&` never reaches this
// arm: `fallbackInitWhollyDiscardable` refuses it. `dropped` reports a REACHABLE fallback was
// discarded - the probe question stays off there, the fallback rescues the nullish path
function collapseLogicalInitOperand({ init, scope, adapter, path, resolveGlobalPolyfill }) {
  const left = unwrapExpressionChain(init.left);
  const aliasCtx = { scope, adapter, path };
  if (!proxyReceiverValueCanBeUndefined(left, ({ name }) => resolveGlobalPolyfill(name), aliasCtx)
    || chainSealsAShortCircuit(left, ({ name }) => resolveGlobalPolyfill(name), aliasCtx)) {
    return { value: left, dropped: false };
  }
  const leftName = resolveObjectName({ objectNode: left, scope, adapter, path });
  return {
    value: leftName && leftName === resolveObjectName({
      objectNode: unwrapExpressionChain(init.right), scope, adapter, path,
    }) ? left : null,
    dropped: true,
  };
}

// an SE-bearing init joins the ANCHORED family only when every effect rides a channel the
// anchored renders re-emit: a sequence prefix (collected into `anchorSe` - the residual
// render replays it, the full-consume path lifts it standalone, and the assignment-cascade
// hosts null it in favor of their OWN standalone prefix lift) or a chain-assignment
// rescued WHOLE by the discard harvest. deeper effects (a ternary branch, an IIFE body)
// keep the nested handling - folding those would change the receiver shape the SE-lift
// machinery expects
function anchoredSeAccounting(declarator, peeledInit) {
  if (!mayHaveSideEffects(declarator.init)) return { accounted: true, anchorSe: null };
  const prefixes = [];
  const seTail = unwrapCollectingSePrefixes(peeledInit, prefixes);
  const accounted = !mayHaveSideEffects(seTail) || isChainAssignment(seTail);
  return { accounted, anchorSe: accounted && prefixes.length ? prefixes : null };
}

// does the literal this leaf reads THROUGH outlive the pairing? the walk that pairs the level owns
// the answer, and a slot over a surviving literal stays NAMED: it leaves a sentinel instead of
// dropping, so the husk keeps the key the residual still reads and every effect the literal owes
export function destructureHostLiteralSurvives(leafPath) {
  const host = destructurePatternHostPath(leafPath);
  // a DECLARATION host only: an assignment keeps its literal as a statement of its own
  // (`({ v: (se(), arr) });` - the pattern goes, the read stays), which is its own channel
  const pattern = host?.node?.type === 'VariableDeclarator' ? host.node.id : null;
  const init = destructureHostInitNode(leafPath);
  // asked of an OBJECT init only: an array wrapper answers the same flag for its own spread, and the
  // routes that own that shape already read it off the plan - re-deciding it here would move them
  return !!pattern && init?.type === 'ObjectExpression'
    && peelArrayWrapperPair({ pattern, init, liftTrailing: true }).wrapperSurvives;
}

// peel parallel transparent destructure wrappers - a level is a SINGLE-slot pair on both sides:
//   - single-element ArrayPattern + matching ArrayExpression layer (`[{...}] = [globalThis]`,
//     `[[{...}]] = [[globalThis]]`, etc.)
//   - sole-property ObjectPattern + the literal slot its key names (`{ w: {...} } = { w: globalThis }`),
//     whose own gates live in `objectHopPairedValue`
//   - inner AssignmentPattern default (`[{...} = {}] = [globalThis]`) - default never fires
//     for proxy-global receivers since runtime value is always defined under polyfill-wins
// bail (stop iterating) on depth divergence or an intermediate of the other shape - downstream
// shape check will reject ambiguous shapes. when scope + adapter are passed, dereferences a
// const-bound Identifier init through its binding so `const wrapper = [Array]; const
// [{x}] = wrapper` descends to the leaf via the wrapper's init.
// `liftTrailing`: the caller's host holds a statement slot ahead of the destructure, so an
// SE-bearing element the pattern does not bind is HARVESTED into `trailingEffects` instead of
// bailing the level - without it the level stays whole and every effect runs verbatim
// eslint-disable-next-line max-statements -- the peel: one arm per wrapper shape a level may take
export function peelArrayWrapperPair({ pattern, init, scope = null, adapter = null, path = null, liftTrailing = false }) {
  // the capture the levels consumed so far anchor at - the host use first, then the innermost
  // followed alias declarator (the detect side's `descendArrayWrapperInit` threads the same hop)
  let readNode = null;
  // sequence prefixes peeled off CONSUMED wrapper levels, source order. the flatten discards
  // those levels, so their effects must surface to the caller's lift - silently peeling them
  // lost the outer effect on the unplugin (`(outer(), [(inner(), R)])` kept only `inner`)
  // while babel's own descent lost the inner one: both sides re-emit from THIS list.
  // a bail level's prefixes are NOT committed - the returned `init` keeps them in place.
  // `firstArray` / `lastArray` bracket the consumed ArrayExpression chain (null when no level
  // was consumed): babel re-anchors `init` at the first and swaps the leaf element
  // of the last, so its re-visit guard needs no descent of its own
  const peeledPrefixes = [];
  // committed consumed levels, outermost first: `wrapper` is the level's raw init (its text /
  // AST includes the sequence prefixes lifted from that level), `array` the effective
  // ArrayExpression after the unwrap. residual renders strip each INLINE level's wrapper down
  // to its array - a kept `(mid(), [R])` would re-run the lifted effect (double-exec)
  const consumedLevels = [];
  // SE-bearing elements the pattern does not bind, per consumed INLINE level (outermost first).
  // native evaluates them AFTER the paired element and everything below it, so a full consume
  // re-emits them innermost level first, behind the element's own effects; a partial consume
  // keeps the level's array, where they still stand
  const trailingByLevel = [];
  // a SPREAD extra iterates its argument, which no statement re-emits: the level is still consumed
  // (the pattern below it plans), but its array has to SURVIVE the render - a sentinel keeps the
  // consumed slot and the residual runs the iteration where the source did
  let wrapperSurvives = false;
  // ... and whether a REST beside a hop is what keeps it: the render then EMPTIES the consumed hop and
  // binds the hop itself to a sentinel (`{ w: _unused, ...rest }`), the flat rest shape one level down,
  // where a spread's survivor keeps the leaf sentinel inside the hop
  let restKeepsLevel = false;
  let firstArray = null;
  let lastArray = null;
  // STICKY across levels: once a level dereferenced a const-bound alias, every DEEPER level
  // also lives in the alias's own init (outside the destructure host), so the trailing-extra
  // rule below never applies to them either
  let dereferenced = false;
  // the context a HOP KEY folds in: the pattern never leaves the host, so its keys read in the
  // host's scope however deep the INIT side has followed an alias out of it (the follow rebinds
  // `scope` below to the alias declaration's - a shadowing `k` there must not answer for the
  // pattern's own)
  const hopKeyCtx = adapter ? { scope, adapter, path } : null;
  // the peel's answer at whatever level the walk stopped: the pattern and init it reached plus
  // everything the consumed levels committed
  function done(peeledPattern, peeledInit) {
    return {
      pattern: peeledPattern, init: peeledInit, peeledPrefixes, firstArray, lastArray, consumedLevels,
      trailingEffects: trailingByLevel.toReversed().flat(), wrapperSurvives, restKeepsLevel,
    };
  }
  for (;;) {
    // strip AssignmentPattern wrapper on the destructure side - init has no AssignmentPattern
    // equivalent (defaults sit on the LHS slot), so we only peel pattern here. EXCEPTION: a
    // receiver-shaped inner default whose paired slot is literally `undefined` fires the default, so
    // ITS right is the receiver (`[{ from } = Array] = [undefined]` -> from off Array) - surface it
    // (the identification's resolveArrayInnerDefaultReceiver agrees, so both emitters stay consistent)
    if (pattern?.type === 'AssignmentPattern') {
      if (isUndefinedNode(init) && destructureRightIsReceiver(pattern.right)) return done(pattern.left, pattern.right);
      pattern = pattern.left;
      continue;
    }
    // a level is a single-slot wrapper on both sides: an array's SOLE element, or an object's SOLE
    // property naming a slot whose value is one more pattern (`{ w: { Map } } = { w: globalThis }`
    // pairs exactly as `[{ Map }] = [globalThis]` does). a wider level is the plan's own shape and
    // stops the peel, and so does a leaf value - the flat routes own that. the slot is asked through
    // the CONSUMING canon, so a bound computed key (`{ [k]: { Map } }`) names its level like a literal.
    // a REST beside the hop (`{ w: { Map }, ...rest }`) pairs the same slot and keeps the level ALIVE
    // exactly as a spread in the literal does: rest gathers what the pattern did not name, so the
    // consumed hop stays as a sentinel keeping its key excluded, and the residual runs where it stood
    const hopCandidates = pattern?.type === 'ObjectPattern' ? pattern.properties.filter(prop => !isRestProperty(prop)) : [];
    const hopRest = hopCandidates.length === 1 && pattern.properties.length === 2;
    const hopProp = hopCandidates.length === 1 && (pattern.properties.length === 1 || hopRest)
      && isDestructurePattern(peelInnerDefault(hopCandidates[0].value))
      && consumableHopSlotName(hopCandidates[0], hopKeyCtx) !== null ? hopCandidates[0] : null;
    if (!hopProp && (pattern?.type !== 'ArrayPattern' || pattern.elements.length !== 1)) {
      return done(pattern, init);
    }
    // peel SE-tail / paren / TS wrappers first (`(se(), [Array])` descends into the tail's
    // array); the crossed sequence prefixes are collected and committed only when this level's
    // wrapper is actually consumed, so a bail below leaves the original init (effects in place)
    const levelPrefixes = [];
    let effectiveInit = unwrapCollectingSePrefixes(init, levelPrefixes);
    // dereference const-bound Identifier (`= wrapper` where `const wrapper = [Array]`).
    // flow-sensitive bail mirrors the object-wrapper static-receiver walk: only a reassignment
    // that reaches the use aborts (a `wrapper = []` strictly AFTER the read leaves the read's
    // value provably `[Array]`), instead of bailing on every constantViolation
    if (scope && adapter) {
      // the detect side's own alias follow, so the plan consumes exactly the levels detection
      // classified: the pattern-gated init, each hop re-anchored in the followed binding's own
      // declaration scope, and the read site carried from the capture the level above recorded (a
      // write to the inner alias after that capture cannot change what the outer literal holds).
      // this plan feeds the pure flatten, so the inject-if-might relaxation never applies. the
      // followed value is EFFECTIVE - the alias's own paren / cast / sequence spelling evaluates at
      // ITS declaration, so only the value flows here
      const followed = followConstIdentifierInit({
        node: effectiveInit, readNode, ctx: { scope, adapter, path, resolveKey: sharedResolveKey },
      });
      // a dereferenced alias is only as good as its SLOTS: a container this file writes into, or
      // lets escape, may no longer hold what its literal spelled, and the level below binds a
      // polyfill to that literal. asked of the OBJECT level alone: its key names the slot, so the
      // question has an answer, while an array level's slot is positional and the census - keyed by
      // NAME, per file - would bail every common wrapper name a file also uses elsewhere
      if (followed.node !== effectiveInit && hopProp
        && (aliasEscaped(effectiveInit, adapter, path)
          || aliasSlotWritten(effectiveInit, spelledSlotName(hopProp), adapter))) return done(pattern, init);
      if (followed.node !== effectiveInit) dereferenced = true;
      effectiveInit = followed.node;
      ({ readNode } = followed);
      scope = followed.ctx.scope;
    }
    if (hopProp) {
      // the object level harvests nothing of its own - what keeps it whole is `objectHopPairedValue`'s
      // to decide - so it commits an empty trailing list and rides the same level bookkeeping
      // the hop key through the CONSUMING canon: a bound computed key folds to the slot it names
      // (`{ [k]: { Map } }` with `const k = 'w'`), the way the other leg's consume already read it
      const paired = objectHopPairedValue(effectiveInit, consumableHopSlotName(hopProp, hopKeyCtx), dereferenced,
        adapter ? { scope, adapter, path } : null);
      if (!paired) return done(pattern, init);
      if (paired.survives || hopRest) wrapperSurvives = true;
      if (hopRest) restKeepsLevel = true;
      consumedLevels.push({ wrapper: init, array: effectiveInit });
      trailingByLevel.push([]);
      pattern = peelInnerDefault(hopProp.value);
      init = paired.read;
      continue;
    }
    if (effectiveInit?.type !== 'ArrayExpression') return done(pattern, init);
    const [innerPattern] = pattern.elements;
    const [innerInit] = effectiveInit.elements;
    if (!innerPattern || !innerInit) return done(pattern, init);
    // an INLINE trailing init element is evaluated-then-discarded by the destructure at
    // runtime; its effect would vanish with the consumed wrapper level, so an SE-bearing extra
    // bails the consume - the init stays whole and every effect runs verbatim - unless the
    // caller lifts, where it is harvested for the host to re-emit. a SPREAD extra iterates,
    // which no statement re-emits: a lifting host keeps that level's ARRAY alive instead
    // (`wrapperSurvives`), with nothing harvested off it, and any other host bails. a pure
    // extra stays peelable - dropping a value-dead pure element is silent. a DEREFERENCED
    // wrapper is exempt: the alias's own declaration keeps the whole array (only the VALUE
    // flows here), so its effects were never at risk - and bailing mid-follow desynced the
    // peel from the detect pass
    const extras = dereferenced ? [] : effectiveInit.elements.slice(1).filter(Boolean);
    const spread = extras.some(el => el.type === 'SpreadElement');
    if (!liftTrailing && (spread || extras.some(mayHaveSideEffects))) return done(pattern, init);
    if (spread) wrapperSurvives = true;
    peeledPrefixes.push(...levelPrefixes);
    consumedLevels.push({ wrapper: init, array: effectiveInit });
    trailingByLevel.push(spread ? [] : extras.filter(mayHaveSideEffects));
    firstArray ??= effectiveInit;
    lastArray = effectiveInit;
    pattern = innerPattern;
    init = innerInit;
  }
}

// the value an object level's sole pattern property pairs with, or null when the level has to stay
// whole: a SPREAD anywhere in the literal (it could override the key, and its read of the source's
// own enumerable keys is an effect of its own), an unnameable key standing after the match that could
// BE it at runtime (last wins), an accessor or method whose read runs a body the consumed level
// would drop, a sibling effect with no re-emit channel here, and a value whose live `?.` belongs to
// the probe channel. a DEREFERENCED level skips the sibling rule: the alias's own declaration keeps
// the literal, so its siblings were never at risk
function objectHopPairedValue(objectNode, key, dereferenced, keyCtx) {
  if (objectNode?.type !== 'ObjectExpression') return null;
  const match = findObjectKeyBeforeSpread(objectNode.properties, prop => spelledSlotName(prop) === key);
  const read = objectPropertyReadValue(match);
  if (!read) return null;
  // ... a key standing after the match is dangerous only where NOTHING can name it: the same
  // scope-aware fold the hop's own key rides (`{ [K]: v }` with `const K = 'q'` names `q`), so a
  // bound key that provably spells another slot leaves the match standing
  if (objectNode.properties.slice(objectNode.properties.indexOf(match) + 1)
    .some(prop => consumableHopSlotName(prop, keyCtx) === null)) return null;
  // ... a `?.` that cannot short-circuit is dead text (`globalThis?.globalThis` - the object is a
  // guaranteed realm name): the value canon that every seal-aware channel asks answers here too, so
  // the level pairs with the nav the way the walk already resolves it for a static claim
  if (receiverCarriesLiveOptional(read) && (!keyCtx || navValueCanShortCircuit(
    unwrapRuntimeExpr(read), ({ name }) => resolveBuiltIn({ kind: 'global', name }), keyCtx))) return null;
  // ... and a value the level SELECTS between arms is not one value to pair with: which arm answers
  // is the selecting-receiver channel's question, asked where the source wrote the branch
  // ... EXCEPT the defensive realm default, where nothing selects: a guaranteed realm name is an
  // object, so the right side is dead text and the level pairs with the name (`(globalThis ?? {})`
  // names the realm, exactly as the flat spelling of the same receiver does)
  // ... at every depth of the default (`(globalThis ?? {}) ?? {}`), the way the walk canon reads it -
  // the discarding peel, since the level pairs with the name in place of the slot
  const realmPeeled = read.type === 'LogicalExpression' ? peelRealmLogicalDefault(read, { discarding: true }) : null;
  const realmNamed = realmPeeled?.type === 'Identifier' && guaranteedRealmObjectName(realmPeeled.name)
    ? realmPeeled : null;
  if (!realmNamed && (read.type === 'ConditionalExpression' || read.type === 'LogicalExpression')) return null;
  if (dereferenced) return { match, read };
  // a sibling's effect and a SPREAD's read of its source's own keys have no re-emit channel here -
  // the array level's harvest rides `peeledPrefixes` / `trailingEffects`, which the renders read off
  // the innermost consumed ARRAY - so a level holding either PAIRS AND SURVIVES, the way a
  // spread-bearing array wrapper does: the claim is still spelled from the slot its key names, and
  // the literal stays with its sentinels so every effect runs where the source wrote it
  // ... and a SEQUENCE around a value the dispatch COLLAPSES owes its prefix: a realm name is
  // re-spelled as its ponyfill (`_globalThis`), never as the comma run in front of it, so the
  // literal keeps that prefix. every other value rides INSIDE the dispatch, prefix and all
  // (`_at((log.push('c'), arr))`), which is the carry the corpus locks - asked through the wrappers
  // a source may spell (one parser keeps parens as nodes), but never through the sequence itself
  // ... read through the canon peel, so a NESTED run (`(f(), (g(), globalThis))`) and a realm default
  // on the tail (`(f(), globalThis ?? {})`) owe their prefix exactly like the flat spelling - read by
  // the outer level alone, the tail was no name, the level consumed, and the prefix vanished
  const { prefix: readPrefix, tail: readTailRaw } = peelNestedSequenceExpressions(unwrapRuntimeExpr(read));
  const readTail = readPrefix.length ? peelRealmLogicalDefault(unwrapRuntimeExpr(readTailRaw), { discarding: true }) : null;
  const seqPrefixOwed = !!readTail && readPrefix.some(mayHaveSideEffects)
    && readTail.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(readTail.name);
  return {
    match, read: realmNamed ?? read, survives: seqPrefixOwed || objectLiteralHoldsObservable(objectNode, match),
  };
}

// peel AssignmentPattern wrapping the inner pattern (`{ Foo: { x } = {} } = R`).
// proxy-global / static-object receivers always defined, so default never fires;
// transparent under "polyfill always wins". returns the bare value for non-wrapper
// shapes unchanged
function peelInnerDefault(value) {
  return value?.type === 'AssignmentPattern' ? value.left : value;
}

// does the pattern subtree carry ANY slot default (`X = d`) at ANY depth? a residual leaf default
// must defer anchoring at every nesting level, not just the top - a nested default (`nested: { x = d }`)
// re-anchored to the pure ctor renders verbatim, so a polyfillable `d` is never injected
function patternHasAnyDefault(node) {
  while (isRestProperty(node)) node = node.argument;
  switch (node?.type) {
    case 'AssignmentPattern': return true;
    case 'ArrayPattern': return node.elements.some(patternHasAnyDefault);
    case 'ObjectPattern': return node.properties.some(prop => patternHasAnyDefault(
      isRestProperty(prop) ? prop.argument : prop.value));
    default: return false;
  }
}

// structural check: outerProp is a Property with computed `[Symbol.iterator]` key. Symbol
// shadow not tracked here - matches the detection layer's shadowing trust. true for
// both extractable shape (`[Symbol.iterator]: ident`) and non-extractable shape
// (`[Symbol.iterator]: {nestedPattern}` / spread / etc.) - the plan kind decides
function isSymbolIteratorComputedKey(outerProp) {
  if (!isPropertyNode(outerProp) || !outerProp.computed) return false;
  const { key } = outerProp;
  if (key?.type !== 'MemberExpression' || key.computed) return false;
  if (key.object?.type !== 'Identifier' || key.object.name !== 'Symbol') return false;
  if (key.property?.type !== 'Identifier' || key.property.name !== 'iterator') return false;
  return true;
}

// narrowed to extractable shape: value must be a BARE binding Identifier. a defaulted
// value (`[Symbol.iterator]: it = fb`) is NOT extractable here - unlike a static polyfill
// import, the synth helper's result can be undefined (a non-iterable receiver), so the
// default is live; peeling it would drop it entirely. defaults keep the key-swap
// (see `planSymbolIteratorProp`). returns the local binding name when extractable
function symbolIteratorLocalName(outerProp) {
  if (!isSymbolIteratorComputedKey(outerProp)) return null;
  return outerProp.value?.type === 'Identifier' ? outerProp.value.name : null;
}

// pattern-valued `[Symbol.iterator]` prop - the shape both emitters extract by destructuring
// the get-iterator-method RESULT. the single predicate every dispatch / trigger / value gate
// shares, so the shape decision can't drift between them
export function isSymbolIteratorPatternProp(propNode) {
  return !!propNode && isSymbolIteratorComputedKey(propNode) && propNode.value?.type === 'ObjectPattern';
}

function hasExtractions(planNode) {
  return !!planNode.extractions?.length;
}

// resolve a destructure property to its polyfillable STATIC entry off `receiverName`, or null when it
// is NOT a consumable static: a computed / non-Identifier-value / rest / default-only key, an
// instance-kind member, an unresolved key, or a disabled leaf. shared by the flatten plan (which builds
// extractions from the entry) and the babel collapse gate (which needs only the yes/no to know whether a
// surviving sibling will be EXTRACTED - emptying the pattern and dropping a SE init's receiver tail).
// the bare `resolveBuiltIn` instance pre-filter is required: a pathless `resolvePure` crashes on
// `enhanceMeta`'s member-like check for instance resolutions
export function resolvePolyfillableStaticProp({ prop, receiverName, resolvePure, isDisabled = null, keyName = null }) {
  if (isDisabled?.(prop)) return null;
  // caller may pre-resolve a scope-aware key (an Identifier computed key `[K]` folds to its binding
  // value); structural propertyKeyName only reads literals, so without it an `[K]` residual reads an
  // unimported static off the pure ctor (undefined at runtime)
  const name = keyName ?? (isPropertyNode(prop) ? propertyKeyName(prop) : null);
  if (name === null) return null;
  const valueNode = propBindingIdentifier(prop.value);
  if (!valueNode) return null;
  const meta = { kind: 'property', object: receiverName, key: name, placement: 'static' };
  if (resolveBuiltIn(meta)?.kind === 'instance') return null;
  const pure = resolvePure(meta);
  if (!pure || pure.kind === 'instance') return null;
  return { pure, localName: valueNode.name };
}

// the extracted value IS the iterator method - a FUNCTION - so a leaf pulled out of it is an
// INSTANCE member of that function. only the plan can say so: the extracted pattern's properties
// are claimed (the re-visit must not re-enter the destructure pipeline on them), and that claim
// equally silences the member dispatch that would otherwise resolve the leaf. a shorthand leaf is
// not a member read either, so nothing downstream asks the question.
// ONE leaf only, and that bound is load-bearing rather than incidental: each polyfilled leaf needs
// the receiver again, and the receiver here is the synth CALL - re-running it would re-read the
// source's `Symbol.iterator` a second time (a getter would fire twice). two leaves therefore need
// a memo contract, which stays out of this plan
export function symbolIteratorInstanceLeaf({ value, resolvePure, isDisabled, keyNameOf }) {
  const inner = peelInnerDefault(value);
  if (inner?.type !== 'ObjectPattern' || inner.properties.length !== 1) return null;
  const [leaf] = inner.properties;
  if (!isPropertyNode(leaf) || leaf.computed || isDisabled?.(leaf)) return null;
  // a DEFAULTED leaf stays on the destructure: the dispatcher result would have to be guarded
  // (`(ref = _m(x)) === void 0 ? <default> : ref`), which is the instance-default channel's shape,
  // and binding it directly here would drop the user's default outright
  if (leaf.value?.type === 'AssignmentPattern') return null;
  const key = keyNameOf(leaf);
  const bound = key === null ? null : propBindingIdentifier(leaf.value);
  if (!bound) return null;
  const pure = resolvePure({ kind: 'property', object: 'function', key, placement: 'prototype' });
  return pure?.kind === 'instance'
    ? { localName: bound.name, instanceEntry: pure.entry, instanceHint: pure.hintName } : null;
}

// plan cache keyed by declarator node identity (unique per parse, so a module-level
// WeakMap is per-file safe; entries GC with the program). the FIRST build wins: the
// AssignmentExpression cascade plans a synthetic `{ id, init }` host and the render-time
// re-entry on the same object must read THAT plan (the cascade also neutralizes
// `plan.discardSe` on the shared object before rendering)
// the KEY a full-consume throw probe re-reads off the guarded PROBED value: native
// destructuring of the probe value throws BEFORE any key read (CoerceToObject), so a read of
// the source's own first key off the guard reproduces the TypeError ahead of the extractions.
// the anchored hop IS that first key; a flat plan reads its first prop's recorded scoped key
// name - which KIND the prop planned as ('consumed' extraction, 'anchored' re-homed residual)
// is a render concern, not a probe one, and a plan that keeps a residual never asks. returns
// `{ name }` for a nameable key, `{ symbolIterator: true }` for a computed `[Symbol.iterator]`
// first key (the probe reads through the polyfilled symbol binding), or null (no probe)
export function probedNavProbeKey(plan) {
  if (!plan?.probedNav) return null;
  if (plan.anchor) return { name: plan.anchor };
  const first = plan.outerProps?.[0];
  if (!first || (first.kind !== 'consumed' && first.kind !== 'anchored')) return null;
  if (first.keyName) return { name: first.keyName };
  return first.extractions?.[0]?.synth === 'symbol-iterator' ? { symbolIterator: true } : null;
}

const planCache = createInstanceNodeCache();

// does a pattern HOP name a ctor the targets may lack - one the pure flavor ships as its own entry
// (`Map`, `Iterator`, `AggregateError`)? a sentinel or a raw residual read under such a hop reads the
// native ctor off the realm, which is what the stripped realm lacks; the anchor asks the same question
export function hopNamesMissingAbleCtor(hopProp, resolveGlobalPolyfill) {
  const name = propertyKeyName(hopProp);
  return !!name && !POSSIBLE_GLOBAL_OBJECTS.has(name) && !!resolveGlobalPolyfill(name);
}

// classify a destructure declarator (`{ id, init }` - a real VariableDeclarator or the
// cascade's synthetic assignment host) into the plan tree, or null when the init isn't a
// recognisable receiver shape or nothing extracts. dispatches across three receiver shapes:
//   - proxy-global: `{Array: {from}} = globalThis` - outer key IS the constructor name
//   - bare constructor: `{from} = Array` reached through an array-wrapper peel - props are
//     direct static-method extractions
//   - static-object: `{a: {from}} = wrapper` where `wrapper = {a: Array}` - constructor
//     hidden behind const-bound ObjectExpression, walk init through the outer-key path
// a fallback init (logical / ternary / chain-assignment / transparent IIFE) collapses for
// identification like the flat meta, but the flatten BINDS the polyfill to the collapsed
// operand, so the init must be wholly discardable (a guarded / diverging operand bails to
// stay native) - for BOTH the declarator and the cascade. `discardSe` harvests the observable node
// the discard would drop (a chain assignment, an SE-bearing chain-root call) for the
// emitters to re-run exactly once; `initElement` is the descended array element within
// the original init's span a residual receiver swap must target. `liftsTrailingEffects`: the
// host can re-emit, as statements ahead of the extraction, the SE-bearing elements an array
// wrapper evaluates beside the consumed one - the peel harvests them into `trailingEffects`
// (innermost level first, behind the element's own effects) instead of keeping the wrapper
// whole; a host with no statement slot (a for-init head) leaves the option off and stays native
// eslint-disable-next-line max-statements -- sequential plan-building steps of one pattern
export function buildNestedDestructurePlan({
  declarator, scope, adapter, path = null, resolvePure, resolveGlobalPolyfill,
  isDisabledProp = null, liftsTrailingEffects = false,
}) {
  if (planCache.has(adapter, declarator)) return planCache.get(adapter, declarator);

  // a disable directive on a LEAF prop's line blocks that leaf's extraction (the prop plans
  // verbatim - native semantics, the natural visitor honors the same directive on the
  // residual). gated at extraction-producing leaves ONLY, matching the per-leaf dispatch
  // gate (a directive on an OUTER `Map: {` line with leaves on other lines does not block
  // them - the dispatch gate checks the leaf node's line). without this, the plan resolves
  // a disabled SIBLING leaf the dispatch gate never visited and the directive is silently
  // bypassed
  function leafDisabled(prop) {
    return !!isDisabledProp?.(prop);
  }

  // inner prop (static method on the nested global): `{ Array: { from } }` - `from` on `Array`. accepts
  // `{ from }`, `{ from: alias }`, `{ from = default }`, `{ from: alias = default }`; rest / default-only /
  // computed / instance / unresolved / disabled fall back to verbatim. user's default is dropped: the
  // polyfill is always defined, so the user's default fires only on undefined property (dead code)
  // a prop's key as a static name, scope-aware: an Identifier computed key `[K]` folds to its binding
  // value like a literal `["from"]`, so the static extracts + imports its module rather than staying a
  // residual reading the static off the pure ctor (unimported -> undefined at runtime, the unplugin
  // break vs babel). a SIDE-EFFECTING key bails to null - it must stay a residual so its effect runs
  // once in place (consuming would drop the key node). non-computed keys read structurally
  function propKeyNameScoped(prop) {
    if (!isPropertyNode(prop)) return null;
    return prop.computed
      ? sharedResolveKey({ node: prop.key, computed: true, scope, adapter, path, bailOnSideEffectKey: true })
      // through the synth namer, which also names a NUMERIC key: it addresses an array SLOT and the
      // static descent reads that slot like any other container member. the narrower namer stays for
      // the mutation pre-pass, which tracks NAMED statics a numeric slot can never be
      : plainSynthKeyName(prop.key);
  }

  function planInnerProp(prop, receiverName) {
    const keyName = propKeyNameScoped(prop);
    const resolved = resolvePolyfillableStaticProp({
      prop, receiverName, resolvePure, isDisabled: leafDisabled, keyName,
    });
    if (!resolved) return { kind: 'verbatim', prop };
    return {
      kind: 'consumed', prop, keyName,
      extractions: [{
        entry: resolved.pure.entry, hint: resolved.pure.hintName, localName: resolved.localName,
        defaultNode: leafDefaultNode(prop),
      }],
    };
  }

  // the user's own default on a consumed leaf (`{ from: alias = d }`): the polyfill is always defined,
  // so it is dead text at runtime, but the flat twin keeps its guard (`_Map === void 0 ? d : _Map`)
  // and so does the extraction - the render canon's static guard, on both legs
  function leafDefaultNode(prop) {
    return prop.value?.type === 'AssignmentPattern' ? prop.value.right : null;
  }

  // fold an ObjectPattern-valued outer prop: plan each child, aggregate extractions, pick
  // the node kind. no extraction anywhere -> the whole prop stays verbatim; every child
  // consumed -> the prop is consumed whole (an inner RestElement child always plans
  // verbatim, so a rest-bearing pattern lands in 'rebuilt' and the renderer keeps
  // sentinels for its consumed siblings); otherwise 'rebuilt' with per-child plans
  function foldNestedPattern(outerProp, pattern, planChild) {
    const children = pattern.properties.map(planChild);
    const extractions = children.flatMap(c => c.extractions ?? []);
    if (!extractions.length) return { kind: 'verbatim', prop: outerProp };
    if (children.every(c => c.kind === 'consumed')) {
      return { kind: 'consumed', prop: outerProp, keyName: propKeyNameScoped(outerProp), extractions };
    }
    return { kind: 'rebuilt', prop: outerProp, pattern, extractions, children };
  }

  // `[Symbol.iterator]`-keyed prop, shared by the proxy-outer level and the single-ctor-key
  // ANCHOR hop (where the synth receiver is the anchored constructor): a binding value
  // consumes into the synth extraction `ident = _getIteratorMethod(receiver)`; a nested
  // ObjectPattern value consumes the same way, destructuring the helper RESULT
  // (`{ next } = _getIteratorMethod(receiver)`) - value-correct on modern engines (the helper
  // returns the same method a raw read yields) and polyfill-visible on engines without native
  // Symbol, where a raw `receiver[_Symbol$iterator]` read misses the iterators the helper's
  // fallbacks cover. a prop-level DEFAULT (`[Symbol.iterator]: {...} = fb`) keeps the key-swap
  // instead: the helper result is defined where the raw read is undefined, so extracting would
  // flip which side of the default runs. a disabled leaf stays verbatim (the directive-honoring
  // natural visitor owns the key then). null for non-symbol keys
  function planSymbolIteratorProp(prop) {
    if (!isSymbolIteratorComputedKey(prop)) return null;
    // a scope-shadowed `Symbol` is the user's own object, its computed key a PLAIN property
    // read. the detection layer's shadow gate never dispatches these leaves themselves, but
    // a SIBLING / ctor-key meta still dispatches the HOST - so the plan re-checks, else the
    // structural match above steals the user's key into a synth extraction
    if (scope && adapter?.hasBinding(scope, 'Symbol', path)) return { kind: 'verbatim', prop };
    if (leafDisabled(prop)) return { kind: 'verbatim', prop };
    const localName = symbolIteratorLocalName(prop);
    if (localName !== null) {
      return { kind: 'consumed', prop, extractions: [{ synth: 'symbol-iterator', localName }] };
    }
    if (isSymbolIteratorPatternProp(prop)) {
      const leaf = symbolIteratorInstanceLeaf({
        value: prop.value, resolvePure, isDisabled: leafDisabled, keyNameOf: propKeyNameScoped,
      });
      if (leaf) return { kind: 'consumed', prop, extractions: [{ synth: 'symbol-iterator', ...leaf }] };
      return { kind: 'consumed', prop, extractions: [{ synth: 'symbol-iterator', pattern: prop.value }] };
    }
    return { kind: 'symbol-iterator-key', prop };
  }

  // proxy-global outer prop: five shapes
  //   - `{ Foo: { bar, ... } }` where Foo is a real global - inner pattern holds static methods
  //   - `{ Self: { ... } }` where Self is itself a proxy-global - alias hop, recurse keeping
  //     the chain transparent. enables N-level nests like `{ self: { window: { Array: { from } } } } = globalThis`
  //   - `{ Foo }` shorthand / `{ Foo: alias }` aliased - polyfill Foo as a global
  //   - `{ [Symbol.iterator]: ident }` computed Symbol.iterator key - synth extraction
  //     `ident = _getIteratorMethod(receiver)`
  //   - `{ [Symbol.iterator]: {nested} }` non-binding value - keep the prop, polyfill the key
  // the resolved proxy receiver name, mirrored to function scope for the closures above the
  // resolution block (the mutation bail in `planOuterProp` reads it lazily at plan time)
  let planReceiverName = null;

  function planOuterProp(outerProp) {
    const symbolPlanned = planSymbolIteratorProp(outerProp);
    if (symbolPlanned) return symbolPlanned;
    const name = propKeyNameScoped(outerProp);
    if (name === null) return { kind: 'verbatim', prop: outerProp };
    // a MUTATED slot (`globalThis.Promise = Shim` / `window.self = fake` in-file) must read off
    // the patched native binding, not the pure import - the user's replacement wins for the
    // VALUE leaf, for every static behind a mutated ctor key, and for every hop behind a
    // mutated proxy key. mirrors the single-ctor anchor's `anchorSlotMutated` bail and the
    // flat-path meta gate. `planReceiverName` is the function-scope mirror of the block-scoped
    // receiver (canonical at every fold depth - the hops alias the one global object)
    if (adapter.isMutatedStatic?.(planReceiverName, name)) return { kind: 'verbatim', prop: outerProp };
    const value = peelInnerDefault(outerProp.value);
    if (value?.type === 'ObjectPattern') {
      const planChild = POSSIBLE_GLOBAL_OBJECTS.has(name)
        ? planOuterProp
        : innerProp => planInnerProp(innerProp, name);
      return foldNestedPattern(outerProp, value, planChild);
    }
    if (value?.type === 'Identifier') {
      if (leafDisabled(outerProp)) return { kind: 'verbatim', prop: outerProp };
      const pure = resolveGlobalPolyfill(name);
      if (!pure) return { kind: 'verbatim', prop: outerProp };
      return {
        kind: 'consumed', prop: outerProp, keyName: name,
        // `kind: 'global'` lets renderers register the binding as a GLOBAL alias (member
        // reads through the local must keep resolving: `const { Symbol } = globalThis;
        // Symbol.iterator` -> `_Symbol$iterator`), unlike static-method extractions which
        // register a body-extract alias
        extractions: [{
          kind: 'global', entry: pure.entry, hint: pure.hintName, localName: value.name, defaultNode: leafDefaultNode(outerProp),
        }],
      };
    }
    return { kind: 'verbatim', prop: outerProp };
  }

  // a DIRECT missing-able ctor whose residual leaves would otherwise read off the native proxy
  // (`{ Set: { union } } = _globalThis` - throws off-engine and reads native undefined) re-anchors them on
  // the pure CONSTRUCTOR binding (`{ union } = _Set` - the single-ctor anchor generalized per prop). poly
  // leaves still extract through their dedicated imports. bails to the native residual for an outer / inner
  // REST (rest gathers the ctor's OTHER keys, which differ on the pure ctor), a proxy-global nest (owned by
  // the recursive fold), and ALWAYS-PRESENT ctors (the native residual is safe - the ctor always exists)
  function anchorMissingAbleResidual(planned, outerPattern, receiver) {
    if (planned.kind !== 'verbatim' && planned.kind !== 'rebuilt') return planned;
    // a `core-js-disable`d prop opts out of polyfilling: keep it on the native residual
    if (leafDisabled(planned.prop)) return planned;
    if (outerPattern.properties.some(isRestProperty)) return planned;
    const name = propKeyNameScoped(planned.prop);
    if (name === null || POSSIBLE_GLOBAL_OBJECTS.has(name)) return planned;
    // a MUTATED ctor (`globalThis.Map = Shim` in-file) must read off the PATCHED native binding, not the
    // pure import - the user's replacement wins. mirror the single-ctor anchor's `anchorSlotMutated` bail
    if (adapter.isMutatedStatic?.(receiver, name)) return planned;
    const anchorPure = resolveGlobalPolyfill(name);
    if (!anchorPure) return planned;
    const inner = peelInnerDefault(planned.prop.value);
    if (inner?.type !== 'ObjectPattern' || inner.properties.some(isRestProperty)) return planned;
    const residualProps = planned.kind === 'verbatim'
      ? inner.properties
      : planned.children.filter(c => c.kind !== 'consumed').map(c => c.prop);
    // a residual leaf with a DEFAULT (top-level OR nested) bails: anchoring renders the residual
    // verbatim/skip-seeded, so a polyfillable default (`{ x = [1].at(0) }`) is dropped by both emitters,
    // and a top-level default also splits babel (re-visits + polyfills) from unplugin (leaves native).
    // a DISABLED leaf likewise stays native. the native residual (current behavior) keeps the default's
    // polyfill reachable by the natural visitor and both emitters consistent
    if (residualProps.some(p => patternHasAnyDefault(p.value) || leafDisabled(p))) return planned;
    return { kind: 'anchored', prop: planned.prop, keyName: name, anchorPure, residualProps, extractions: planned.extractions ?? [] };
  }

  // static-object descent. given an outer prop `key: ObjectPattern` at depth N (walkPath =
  // [k1, k2, ...] from declarator-root to here), walk hostInit through `walkPath + key`:
  //   - leaf Identifier (constructor name): plan inner ObjectPattern via `planInnerProp`
  //   - proxy-global intermediate (`{root: {Array: {from}}} = {root: globalThis}`): NOT a
  //     constructor - recurse one level deeper so the next hop reaches the real constructor
  //     via `walkStaticReceiverStep`'s proxy-global mid-chain lift
  // non-Property / computed / non-ObjectPattern values bail to verbatim. shorthand /
  // Identifier-valued outer props are NOT supported here - they would name a local binding
  // outside the static path, so static-object descent doesn't apply
  function planOuterPropStatic(outerProp, hostInit, walkPath) {
    const name = propKeyNameScoped(outerProp);
    if (name === null) return { kind: 'verbatim', prop: outerProp };
    const value = peelInnerDefault(outerProp.value);
    if (value?.type !== 'ObjectPattern') return { kind: 'verbatim', prop: outerProp };
    const newPath = [...walkPath, name];
    // `path` (the declaration / assignment site) lets the usage-pure reassignment gate inside
    // walkStaticReceiverStep prove a reassigned RECEIVER (`w = {}` after `{Arr:{from}} = w`) is
    // written AFTER the read - so the flatten resolves and collapses to `const from = _Array$from`
    // (polyfill-always-wins) instead of bailing to the native-wins default-injection
    const constructor = walkStaticReceiverChain({
      receiverNode: hostInit, walkPath: newPath, scope, adapter, path,
    });
    if (constructor && !POSSIBLE_GLOBAL_OBJECTS.has(constructor)) {
      return foldNestedPattern(outerProp, value, innerProp => planInnerProp(innerProp, constructor));
    }
    // a slot holding the REALM itself (`{ w: globalThis }`) is a proxy level: its ctor leaves consume
    // like the ones read off a proxy-global init (`{ w: { Map } } = { w: globalThis }` -> `const Map
    // = _Map`), and its ctor hops descend the same way - the static walk's own proxy lift, one level up
    if (constructor && POSSIBLE_GLOBAL_OBJECTS.has(constructor)) return foldNestedPattern(outerProp, value, planOuterProp);
    return foldNestedPattern(outerProp, value, innerProp => planOuterPropStatic(innerProp, hostInit, newPath));
  }

  // the ONE unknown-span rule (bias-safe = KEEP): a node a co-transform synthesized carries
  // no positions, and its effect exists only where it stands - excluding it on
  // `undefined >= X` silently DROPPED the rescue (the observable user effect vanished),
  // while the sibling guards merely skipped an optimization in the opposite direction.
  // containment applies only when both spans are known
  function spanWithinSlot(node, host) {
    if (typeof node?.start !== 'number' || typeof host?.start !== 'number') return true;
    return node.start >= host.start && node.end <= host.end;
  }
  let plan = null;
  const originalId = declarator.id;
  const peeled = peelArrayWrapperPair({
    pattern: originalId, init: declarator.init, scope, adapter, path, liftTrailing: liftsTrailingEffects,
  });
  const { pattern } = peeled;
  // the harvested neighbours a FULL consume discards with the wrapper: the render re-emits them
  // once, behind the element's own effects; a partial consume keeps the array they stand in
  const trailingEffects = peeled.trailingEffects.length ? peeled.trailingEffects : null;
  // a level a SPREAD keeps alive: the render keeps every consumed slot as a sentinel and the
  // declarator with it, so the array still iterates where the source did
  const { wrapperSurvives } = peeled;
  const arrayPeelHappened = pattern !== originalId;
  // the DESCENDED init element when an ArrayPattern wrapper was peeled WITHIN the original
  // init's span: a receiver swap in the residual render must target this element, not the
  // whole init (swapping the whole array dropped the brackets and broke the destructure).
  // a const-alias dereference lands OUTSIDE the init span - the residual keeps the alias
  // identifier verbatim, so no element targeting applies
  const initElement = arrayPeelHappened && peeled.init !== declarator.init
    && spanWithinSlot(peeled.init, declarator.init) ? peeled.init : null;
  // INLINE consumed wrapper levels whose sequence prefixes were lifted: the residual render
  // strips each down to its bare array so the lifted effect never re-runs. an alias-dereferenced
  // level (array outside the wrapper span) keeps its identifier verbatim - nothing to strip
  const consumedLevelStrips = (peeled.consumedLevels ?? []).filter(l => l.wrapper !== l.array
    && spanWithinSlot(l.array, l.wrapper) && spanWithinSlot(l.wrapper, declarator.init));
  if (pattern?.type === 'ObjectPattern' && pattern.properties.length) {
    // peel parens / chain / TS wrappers AND SE tail to a fixpoint so `(se(), R) as any`
    // (and nested forms like `(se(), (R as any))`) reach the receiver. without this,
    // TS-wrapped destructure inits bail the flatten path and the SE prefix never lifts
    let init = unwrapExpressionChain(peeled.init);
    // the discard-rescue harvest below must see the PRE-collapse node (a rescued IIFE call,
    // a chain assignment) - the collapse rewrites `init` to the resolution representative
    const initBeforeCollapse = init;
    // a fallback init collapses for identification like the flat meta (left for `||` / `??`,
    // right for `&&`, the consequent for an AGREEING ternary, the inlined return for a
    // transparent IIFE) - but the flatten BINDS the polyfill to the collapsed operand, so that
    // operand must be unconditionally taken: the init has to be wholly discardable (pure test,
    // no `&&` guard - a guard can select its falsy LEFT and that path's native short-circuit /
    // TypeError must survive). this holds for the cascade too - keeping the RHS tail verbatim
    // does not make a conditionally-evaluated receiver safe to bind unconditionally
    const fallback = collapseFallbackInit({ init, scope, adapter, path, resolveGlobalPolyfill });
    init = fallback.init;
    const { fallbackDropped } = fallback;
    // observable node in the init the flatten DISCARDS: a chain-assignment (rescued WHOLE - it
    // updates a binding and may contain an SE-bearing call) or an SE-bearing chain-root call.
    // harvested into the plan so the emit re-runs it once ahead of the extraction (full consume)
    // or keeps it verbatim in the residual init (partial consume).
    // span guard: `peelArrayWrapperPair` may have DEREFERENCED a const-alias wrapper
    // (`const w = [(IIFE)()]; [{x}] = w`) whose init lives OUTSIDE the discarded slot - its
    // setup already runs at the alias declaration, so harvesting it would double-run
    const probed = init ? discardRescueNodes({ node: initBeforeCollapse, scope, adapter, path }) : [];
    const inSlot = declarator.init
      ? probed.filter(n => spanWithinSlot(n, declarator.init)) : [];
    const discardSe = inSlot.length ? inSlot : null;
    const receiver = init ? resolveObjectName({ objectNode: init, scope, adapter, path }) : null;
    planReceiverName = receiver;
    // an UNDEFINABLE probe nav as the init (`globalThis.window?.self`, `globalThis.window?.Array`,
    // their sealed paren spellings): destructuring THROWS where the probe yields undefined, so an
    // anchored / flattened render reading an always-defined binding would erase that throw (and
    // run computed-key effects the source never reaches). asked of the init's VALUE - not its leaf
    // NAME - so every receiver shape (proxy global, constructor leaf, static object) carries the
    // verdict. a collapse that dropped a `||` / `??` / ternary fallback rescues the nullish path
    // by construction - the fallback IS the value there - so the probe stays off
    const probedNav = !!init && !fallbackDropped && proxyReceiverValueCanBeUndefined(init,
      ({ name }) => resolveGlobalPolyfill(name), { scope, adapter, path });
    // the PROBED value is the collapsed init - a fallback logical hands its selected operand
    // on (`(nav).Array ?? {}` probes `(nav).Array`), and the renders must not re-derive the
    // nav from the raw declarator slot, whose logical shape no guard render owns
    const probedNavNode = probedNav ? init : null;
    if (receiver && POSSIBLE_GLOBAL_OBJECTS.has(receiver)) {
      // single-key proxy-hop ANCHOR: `{ K: <pattern> } = <proxy>` on a value-discarded host
      // (the callers' contract - declarator inits are never read, the cascade gates on
      // statement context) plans like its flat twin `<pattern> = <proxy>.K`: inner props are
      // K's statics, and a residual re-anchors to the CONSTRUCTOR binding instead of reading
      // the native key off the proxy root (patch-visible for mutated statics, defined on
      // missing-global targets). qualification mirrors the retired normalize pre-passes:
      // exactly one Property, static non-proxy constructor key, non-empty (default-peeled)
      // inner ObjectPattern, effect-free init, no array wrapper. the anchored plan exists
      // even with ZERO extractions - the re-anchored residual is the point (a slot-mutated
      // ctor's patch lands on the routed binding). an SE-bearing init keeps the nested
      // handling: a member synthesized off a sequence would change the receiver shape the
      // SE-lift machinery expects; a side-effecting computed key keeps its in-place run
      // a disabled host line opts out of the reshaping (cascade callers stamp loc/start
      // onto their synthetic host so the per-line check reaches the real statement)
      // single-key ctor ANCHOR plan over `hostPattern` (`{ K: <inner> }` on the proxy receiver):
      // inner props are K's statics, and a residual re-anchors to the CONSTRUCTOR binding. a
      // `[Symbol.iterator]` leaf under the anchor extracts like its proxy-outer twin, with the
      // ANCHORED constructor as the synth receiver (`x = _getIteratorMethod(_Map)` /
      // `(_globalThis.Array)`) - the emitters' synth renders read the anchor base. a SLOT-mutated
      // ctor pair (`globalThis.Map = Shim` anywhere in the file) keeps the residual on the RAW
      // member read - a user-installed replacement must win there, so `anchorPure` stays null and
      // the renders emit `<proxyBinding>.<K>` instead of the ctor binding. extractions stay
      // leaf-gated (a mutated LEAF already planned verbatim upstream). null when the key is not a
      // static non-proxy constructor, the inner is not a non-empty ObjectPattern, or an opt-out
      // covers the hop or a leaf under it - that residual stays the user's raw read
      function planCtorKeyAnchor(hostPattern) {
        const prop = hostPattern.properties.length === 1 && isPropertyNode(hostPattern.properties[0])
          ? hostPattern.properties[0] : null;
        const key = prop ? propKeyNameScoped(prop) : null;
        const inner = key && !POSSIBLE_GLOBAL_OBJECTS.has(key) && isStaticPlacement(key)
          ? peelInnerDefault(prop.value) : null;
        if (inner?.type !== 'ObjectPattern' || !inner.properties.length) return null;
        // an opt-out on the hop or on any leaf under it keeps the residual the user's own raw read:
        // anchored on the ponyfill constructor, a leaf the directive kept from importing its static
        // reads `undefined` off it (`{ groupBy } = _Map` without `map/group-by`) where the realm
        // object still carries the native - the unplugin's re-anchor render answers the same
        if (leafDisabled(prop) || inner.properties.some(leafDisabled)) return null;
        // a SLOT-mutated anchor holds the user's replacement: its STATICS are the shim's own,
        // so static leaves stay verbatim on the raw residual instead of extracting pure
        // statics. a `[Symbol.iterator]` leaf still extracts - the synth is receiver-based
        // and reads off the RAW anchor member, so the replacement stays visible through it
        const anchorSlotMutated = !!adapter.isMutatedStatic?.(receiver, key);
        const outerProps = inner.properties.map(p => planSymbolIteratorProp(p)
          ?? (anchorSlotMutated ? { kind: 'verbatim', prop: p } : planInnerProp(p, key)));
        return {
          receiver, anchor: key, probedNav, probedNavNode,
          anchorPure: anchorSlotMutated ? null : resolveGlobalPolyfill(key),
          outerProps, pattern: inner, discardSe, anchorSe, initElement: null, consumedLevelStrips,
        };
      }
      const { accounted: anchoredSeAccounted, anchorSe } = anchoredSeAccounting(declarator, peeled.init);
      const hopHostEligible = !arrayPeelHappened && anchoredSeAccounted
        && !isDisabledProp?.(declarator) && pattern.properties.length === 1
        && isPropertyNode(pattern.properties[0]);
      if (hopHostEligible) plan = planCtorKeyAnchor(pattern);
      if (!plan) {
        const planned = pattern.properties.map(planOuterProp);
        // re-anchor missing-able ctor residuals only in the CLEAN case: an SE-free init where EVERY prop is
        // already consumed or anchorable. a verbatim sibling (always-present ctor / global alias / disabled
        // leaf) or an SE init routes through native-residual / proxy-hop handling that does not split per-
        // ctor, so those stay on the native residual (current behavior - bounded, no regression).
        // the SE that matters is the init's TAIL: a sequence prefix lifts to its own statement on every
        // host ahead of the render, so what the anchored residual would read is the quiet tail - the
        // same init the prefix-less twin anchors on (`{ Array: { from }, Set: { union } } = (eff(),
        // globalThis)` left `Set` on the proxy while its twin anchored `{ union } = _Set`). a chain
        // ASSIGNMENT tail is accounted the same way the single-key anchor accounts it: the discard
        // harvest rescues the write whole, and the residual reads the value it stored
        // ... and a wrapper a SPREAD keeps alive changes nothing here: the anchored prop leaves the
        // pattern for a declarator of its own like anywhere else, and the emitters keep the wrapper
        // standing as a husk for the iteration (the native residual would read the missing ctor)
        const initTail = unwrapCollectingSePrefixes(peeled.init, []);
        const reanchored = mayHaveSideEffects(initTail) && !isChainAssignment(initTail)
          ? planned : planned.map(p => anchorMissingAbleResidual(p, pattern, receiver));
        // require at least one CONSUMED (extracting) prop alongside the anchored one: babel's flatten
        // dispatch is usage-driven (it fires on a polyfillable leaf), so an ALL-anchored multi-ctor
        // declarator with no poly leaf never triggers babel while the shape-driven unplugin would - those
        // stay on the native residual (current behavior). a verbatim/rebuilt sibling also bails
        const outerProps = reanchored.every(p => p.kind === 'consumed' || p.kind === 'anchored')
          && reanchored.some(p => p.kind === 'anchored') && reanchored.some(p => p.kind === 'consumed')
          ? reanchored : planned;
        if (outerProps.some(hasExtractions)) {
          plan = { receiver, probedNav, probedNavNode, outerProps, pattern, discardSe, initElement, consumedLevelStrips };
        }
      }
      // a pattern hop that is ITSELF a proxy-global alias (`{ self: { x } } = globalThis`, deeper
      // `{ self: { window: { y } } }`, `{ globalThis: { Map: {...} } }`) binds nothing at the hop
      // levels: without a resolvable leaf it falls between the recursive fold (all-verbatim, no
      // plan) and the missing-able re-anchor (proxy names bail), and the raw residual reads the
      // hop off the pure root - undefined off-engine, destructure TypeError. peel consecutive
      // single-prop proxy hops like the member-chain prefix walk (`globalThis.self.x` ->
      // `_globalThis.x`), then re-try the ctor anchor on the peeled pattern (`{ globalThis:
      // { Map: { x } } }` -> `({ x } = _Map)`) or anchor the remainder on the receiver's own
      // always-defined binding. a slot-mutated hop, an opted-out one or an un-importable receiver
      // keeps the raw residual (patch visibility / the user's own read / no binding to anchor on)
      function planPeeledProxyHop() {
        const receiverPure = resolveGlobalPolyfill(receiver);
        if (!receiverPure) return null;
        let effPattern = pattern;
        let lastHop = null;
        while (effPattern.properties.length === 1 && isPropertyNode(effPattern.properties[0])) {
          const [prop] = effPattern.properties;
          const key = propKeyNameScoped(prop);
          if (!key || !POSSIBLE_GLOBAL_OBJECTS.has(key) || adapter.isMutatedStatic?.(receiver, key) || leafDisabled(prop)) break;
          const inner = peelInnerDefault(prop.value);
          if (inner?.type !== 'ObjectPattern' || !inner.properties.length
            || inner.properties.some(isRestProperty)) break;
          effPattern = inner;
          lastHop = key;
        }
        if (!lastHop) return null;
        return planCtorKeyAnchor(effPattern) ?? {
          receiver, anchor: lastHop, anchorPure: receiverPure, probedNav, probedNavNode,
          outerProps: effPattern.properties.map(planOuterProp),
          pattern: effPattern, discardSe, anchorSe, initElement: null, consumedLevelStrips,
        };
      }
      if (!plan && hopHostEligible) plan = planPeeledProxyHop();
    } else if (receiver && isStaticPlacement(receiver)) {
      // receiver is a known constructor (`Array` / `Map` / ...): pattern's properties
      // are direct method extractions. an ArrayPattern wrapper (with or without a rest
      // sibling) survives the residual render - the rebuilt pattern is spliced back into
      // the original LHS text
      const outerProps = pattern.properties.map(p => planInnerProp(p, receiver));
      if (outerProps.some(hasExtractions)) {
        plan = { receiver, probedNav, probedNavNode, outerProps, pattern, discardSe, initElement, consumedLevelStrips };
      }
    } else if (init) {
      const outerProps = pattern.properties.map(p => planOuterPropStatic(p, init, []));
      if (outerProps.some(hasExtractions)) {
        plan = { receiver: null, probedNav, probedNavNode, outerProps, pattern, discardSe, initElement, consumedLevelStrips };
      }
    }
  }
  if (plan && trailingEffects) plan.trailingEffects = trailingEffects;
  if (plan && (wrapperSurvives || objectInitSpreadSurvives(declarator.init))) plan.wrapperSurvives = true;
  if (plan && peeled.restKeepsLevel) plan.restKeepsLevel = true;
  planCache.set(adapter, declarator, plan);
  return plan;
}

// --- catch-clause relocation ---

// whether `catch ({ pattern })` has to become `catch (_ref) { let { pattern } = _ref;` - the
// receiver a key lookup and a defaulted key both rewrite against. the answer is per PATTERN
// but composed of per-prop ones: a computed key hosting machinery forces the relocation on
// its own, and a plainly-resolvable key earns it only where the body actually READS what it
// binds - an unread one would buy an import plus a dead dispatcher call for nothing. those
// unread props come back so the caller can skip them, keeping them native reads in the
// residual. shallow by design: a nested pattern without outer-level machinery destructures
// in place, and its leaf bindings are catch-local, not polyfill candidates. an ARRAY pattern asks
// none of these questions - its bindings are positional, so there is no key to rewrite against a
// named receiver - and takes the single question its own branch asks instead
// the values a for-x head binds in TURN, when the source spells them: an array literal names its
// own elements, and nothing else makes an iterated value's identity provable. a spread hides every
// later position, so one anywhere takes the whole answer away
function iterableElementNodes(node) {
  if (node?.type !== 'ArrayExpression') return [];
  const elements = node.elements ?? [];
  if (elements.some(item => item?.type === 'SpreadElement')) return [];
  return elements.filter(Boolean);
}

// does a leaf ANYWHERE below this pattern name a polyfillable member? this is the relocation's own
// question - what it buys is a DECLARATION HOST, and every claim below takes it, whatever else the
// pattern binds. the positional walk beside it answers a different one (may this element be RENAMED
// to a minted binding), and its sole-slot and bare-leaf rules exist because a rename drops what the
// pattern's other slots bind - restrictions with no bearing here, which is why a leaf with a
// SIBLING (`{ y: { flat, keep } }`) or under a DEFAULT (`{ y: { flat = x } }`) stayed native
// `undefaultedOnly`: the ELEMENT routes bind the dispatch IN PLACE of the slot, which leaves a
// default no arm to run - they decline it, so a pattern whose only claim carries one buys nothing
// from the relocation. the direct hosts fold that arm with a test ref and keep counting it
function patternHoldsClaim(node, resolvePure, undefaultedOnly = false) {
  const pattern = node?.type === 'AssignmentPattern' ? node.left : node;
  if (pattern?.type === 'ArrayPattern') {
    return (pattern.elements ?? []).some(element => patternHoldsClaim(element, resolvePure, undefaultedOnly));
  }
  if (pattern?.type !== 'ObjectPattern') return false;
  return (pattern.properties ?? []).some(prop => {
    if (!isPropertyNode(prop)) return false;
    const key = spelledSlotName(prop);
    const defaulted = prop.value?.type === 'AssignmentPattern';
    const value = defaulted ? prop.value.left : prop.value;
    if (key !== null && value?.type === 'Identifier' && !(undefaultedOnly && defaulted)
      && resolvePure({ kind: 'property', object: null, key, placement: null })) return true;
    return patternHoldsClaim(prop.value, resolvePure, undefaultedOnly);
  });
}

export function planCatchClauseExtraction({
  paramNode, bodyNode, scope, adapter, path, resolvePure, walkNode,
  objectHint = null, iterableNode = null, mirrorHosts = false,
}) {
  // an ARRAY param relocates for a claim under any of its elements: they bind by ITERATION, so the
  // per-prop questions below (which key is resolvable, which rewrite is observable) have no subject
  // here - what the relocation buys is a DECLARATION HOST, and the element rename takes it from
  // there, with everything the pattern binds beside the claim riding the residual that host can now
  // hold. the rename's own walk re-asks the narrower questions (plain key, statement slot) at emit
  if (paramNode?.type === 'ArrayPattern') {
    return (paramNode.elements ?? []).some(element => patternHoldsClaim(element, resolvePure, true))
      ? { unobservable: [] } : null;
  }
  if (paramNode?.type !== 'ObjectPattern' || !paramNode.properties?.length) return null;
  const elementNodes = iterableElementNodes(iterableNode);
  // WHICH channel answers decides whether the relocation is needed at all. the type channel buys a
  // DECLARATION HOST its dispatch cannot do without; a static off an element the source SPELLS is
  // something the receiver mirror puts in that element instead - no host, no minted name, no guard,
  // and it survives a later for-of lowering, which the relocated shape does not
  const viaElement = [];
  const resolvableProps = paramNode.properties.filter(prop => {
    if (!isPropertyNode(prop)) return false;
    // through the consuming canon: a bound computed key (`{ [k]: { at } }`) names the slot its
    // fold spells, so the relocation buys that claim its host like the literal spelling's
    const key = consumableHopSlotName(prop, adapter ? { scope, adapter, path } : null);
    if (key === null) return false;
    // `objectHint` is what the relocated value is KNOWN to be - a loop head can type its element
    // where a catch clause never can. asking with it keeps the relocation to claims that are
    // really lost: a plain data key off a typed element resolves to no polyfill and the pattern
    // stays where it is, with the binding types its own destructure still carries
    if (resolvePure(objectHint
      ? { kind: 'property', object: objectHint, key, placement: 'prototype' }
      : { kind: 'property', object: null, key, placement: null })) return true;
    // ... and where the value's IDENTITY is spelled rather than its type, ask the question the
    // relocated declaration itself will ask (`const { K } = <element>`). a CONSTRUCTOR has no
    // value-type for the hint to carry, so a static claim off one is invisible above and only
    // this name channel sees it - which is the whole of `{ fromEntries } of [Object]`. the meta
    // must NAME its receiver: the typeless one resolves for any plain data key, and relocating on
    // that answer moves a pattern whose claim then reads a receiver the ladder can no longer type
    // (a `{ name }` off a string-valued slot degraded from the string helper to the generic one)
    const spelled = elementNodes.some(element => {
      // a PRISTINE global read is the only element that proves its own identity: a bound name may
      // hold whatever its scope writes, and a minted import alias is exactly the shape the
      // downstream routes refuse to judge stable - predicting an extraction there relocates a
      // pattern for nothing
      if (element?.type !== 'Identifier' || adapter?.hasBinding?.(scope, element.name, path)) return false;
      // a DEFAULTED prop is out: the relocated read reaches its receiver through a guard (the
      // minted binding is the iterated value, not the element the source spelled), and that guard
      // picks between the polyfill and the raw read - a default is a third arm it has no shape for,
      // so the extraction declines and the relocation buys nothing. the direct-receiver hosts fold
      // the same default because they need no guard at all
      if (prop.value?.type === 'AssignmentPattern') return false;
      const meta = buildDestructuringInitMeta({ initNode: element, key, scope, adapter, path });
      // ... and it must SPELL what it names: an alias resolves to the same constructor while
      // holding whatever was written into it, and a plugin-minted one (`_Symbol`) is invisible to
      // the scope check above because the import that binds it is born mid-transform
      if (meta?.object !== element.name) return false;
      // ask the question the EXTRACTION asks, not a weaker one: a prop this predicts and the
      // static route then declines is a pattern relocated for nothing
      return !!resolvePolyfillableStaticProp({ prop, receiverName: meta.object, resolvePure });
    });
    if (spelled) viaElement.push(prop);
    return spelled;
  });
  const hasMachinery = paramNode.properties.some(prop => computedPropKeyHostsMachinery({
    propNode: prop, scope, adapter, path, resolvePure,
  }));
  // ... and a prop whose VALUE is a nested pattern buys the same thing the array param buys: the
  // key here names no member, the claim sits below it, and what it lacks is a declaration host -
  // the relocation gives it one and its own route takes it from there (`catch ({ y: { flat } })`
  // stayed native while both its neighbours in this host - the flat prop and the array element -
  // claimed)
  // ... under a key the consume can NAME: a bound computed one folds, an evaluating one stays out
  const nestedClaim = paramNode.properties.some(prop => isPropertyNode(prop)
    && consumableHopSlotName(prop, adapter ? { scope, adapter, path } : null) !== null
    && patternHoldsClaim(prop.value, resolvePure));
  if (!hasMachinery && !nestedClaim && !resolvableProps.length) return null;
  // ... so a pattern the mirror HOSTS, whose every claim came from the element channel and whose
  // every key the literal can carry, is left to it: a rest gathers what no read names, a duplicate
  // key would need one property twice, and a key with no static spelling has no slot to sit in
  if (mirrorHosts && !hasMachinery && !nestedClaim && viaElement.length === resolvableProps.length
    && patternKeysMirrorable({ paramNode, scope, adapter, path })) return null;
  const unobservable = resolvableProps.filter(prop => !catchPropRewriteObservable({
    propNode: prop,
    patternNode: paramNode,
    bodyNode,
    localName: prop.value?.type === 'Identifier' ? prop.value.name : null,
    walkNode,
  }));
  if (!hasMachinery && !nestedClaim && unobservable.length === resolvableProps.length) return null;
  return { unobservable };
}

// can the mirror's literal carry EVERY key this pattern binds? the render spells one property per
// key, so a shape its key predicate refuses leaves the literal unable to stand in for the receiver
function patternKeysMirrorable({ paramNode, scope, adapter, path }) {
  const seenKeys = new Set();
  for (const prop of paramNode.properties) {
    const key = mirrorAcceptedKey({ prop, scope, adapter, path, seenKeys });
    if (key === null) return false;
    seenKeys.add(key);
  }
  return true;
}
