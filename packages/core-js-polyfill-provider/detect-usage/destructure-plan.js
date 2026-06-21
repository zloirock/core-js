// nested-destructure flatten DECISION layer, shared by both emitters: classify every outer
// prop of a flatten-eligible declarator (proxy-global / bare-constructor / static-object
// receiver) into a parser-agnostic plan tree. emitters RENDER the tree (babel as AST
// mutation, unplugin as text) - key / source text, sentinel names, import bindings and
// rebuilt-text offsets are render concerns and stay out of the tree. plan node kinds:
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
  isChainAssignment,
  mayHaveSideEffects,
  peelZeroArgIifeReturn,
  propBindingIdentifier,
  propertyKeyName,
  reassignmentBlocksGlobalResolve,
  staticStringKey,
  unwrapExpressionChain,
} from '../helpers/ast-patterns.js';
import { POSSIBLE_GLOBAL_OBJECTS } from '../helpers/class-walk.js';
import { resolve as resolveBuiltIn } from '../index.js';
import { discardRescueNode } from './members.js';
import { isStaticPlacement, resolveKey as sharedResolveKey, resolveObjectName } from './resolve.js';
import {
  destructureRightIsReceiver, fallbackInitWhollyDiscardable, isUndefinedNode, resolveBranchProxyName, walkStaticReceiverChain,
} from './destructure.js';

// object-prop node across parsers: estree `Property`, babel `ObjectProperty`
function isPropertyNode(node) {
  return node?.type === 'Property' || node?.type === 'ObjectProperty';
}

// peel parallel transparent destructure wrappers:
//   - single-element ArrayPattern + matching ArrayExpression layer (`[{...}] = [globalThis]`,
//     `[[{...}]] = [[globalThis]]`, etc.)
//   - inner AssignmentPattern default (`[{...} = {}] = [globalThis]`) - default never fires
//     for proxy-global receivers since runtime value is always defined under polyfill-wins
// bail (stop iterating) on depth divergence or non-array intermediate - downstream shape
// check will reject ambiguous shapes. when scope + adapter are passed, dereferences a
// const-bound Identifier init through its binding so `const wrapper = [Array]; const
// [{x}] = wrapper` descends to the leaf via the wrapper's init
export function peelArrayWrapperPair({ pattern, init, scope = null, adapter = null, path = null }) {
  const visited = new Set();
  for (;;) {
    // strip AssignmentPattern wrapper on the destructure side - init has no AssignmentPattern
    // equivalent (defaults sit on the LHS slot), so we only peel pattern here. EXCEPTION: a
    // receiver-shaped inner default whose paired slot is literally `undefined` fires the default, so
    // ITS right is the receiver (`[{ from } = Array] = [undefined]` -> from off Array) - surface it
    // (the identification's resolveArrayInnerDefaultReceiver agrees, so both emitters stay consistent)
    if (pattern?.type === 'AssignmentPattern') {
      if (isUndefinedNode(init) && destructureRightIsReceiver(pattern.right)) {
        return { pattern: pattern.left, init: pattern.right };
      }
      pattern = pattern.left;
      continue;
    }
    if (pattern?.type !== 'ArrayPattern' || pattern.elements.length !== 1) {
      return { pattern, init };
    }
    // peel SE-tail / paren / TS wrappers first (`(se(), [Array])` descends into the tail's
    // array; the SE prefix is lifted separately by the host's own machinery, and the
    // descended element's span stays inside the original init for the residual splice)
    let effectiveInit = unwrapExpressionChain(init);
    // dereference const-bound Identifier (`= wrapper` where `const wrapper = [Array]`).
    // flow-sensitive bail mirrors the object-wrapper static-receiver walk: only a reassignment
    // that reaches the use aborts (a `wrapper = []` strictly AFTER the read leaves the read's
    // value provably `[Array]`), instead of bailing on every constantViolation
    if (scope && adapter) {
      // read site of the current hop (host use first, then each prior hop's declarator) so a write
      // AFTER the read does not dominate - threaded as the NODE since the adapter has no per-binding path
      let readNode = path?.node ?? null;
      while (effectiveInit?.type === 'Identifier' && !visited.has(effectiveInit.name)) {
        visited.add(effectiveInit.name);
        const binding = adapter.getBinding(scope, effectiveInit.name, path);
        if (!binding || reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode: readNode })) break;
        const bindingInit = binding.path?.node?.init ?? binding.node?.init;
        if (!bindingInit) break;
        effectiveInit = bindingInit;
        readNode = (binding.path?.node ?? binding.node) ?? readNode;
      }
    }
    if (effectiveInit?.type !== 'ArrayExpression') return { pattern, init };
    const [innerPattern] = pattern.elements;
    const [innerInit] = effectiveInit.elements;
    if (!innerPattern || !innerInit) return { pattern, init };
    pattern = innerPattern;
    init = innerInit;
  }
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
  switch (node?.type) {
    case 'AssignmentPattern': return true;
    case 'RestElement':
    case 'SpreadElement': return patternHasAnyDefault(node.argument);
    case 'ArrayPattern': return node.elements.some(patternHasAnyDefault);
    case 'ObjectPattern': return node.properties.some(prop => patternHasAnyDefault(
      prop.type === 'RestElement' || prop.type === 'SpreadElement' ? prop.argument : prop.value));
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

// narrowed to extractable shape: value must reduce to a binding Identifier
// (`propBindingIdentifier` peels AssignmentPattern defaults - user default fires only
// when receiver[Symbol.iterator] is undefined, dead under polyfill-always-wins). returns
// the local binding name when extractable, null otherwise
function symbolIteratorLocalName(outerProp) {
  if (!isSymbolIteratorComputedKey(outerProp)) return null;
  return propBindingIdentifier(outerProp.value)?.name ?? null;
}

// resolve a nested-flatten prop's key to its static name via the canonical property-key
// resolver: non-computed Identifier AND string-literal keys (`{ "Array": {...} }`), computed
// string / single-quasi literals. null for a dynamic computed key (`[k]`) - the flatten
// bails the prop to verbatim
function flattenKeyName(prop) {
  if (prop.computed) return staticStringKey(prop.key);
  return propertyKeyName(prop);
}

function hasExtractions(planNode) {
  return !!planNode.extractions?.length;
}

// plan cache keyed by declarator node identity (unique per parse, so a module-level
// WeakMap is per-file safe; entries GC with the program). the FIRST build wins: the
// AssignmentExpression cascade plans a synthetic `{ id, init }` host and the render-time
// re-entry on the same object must read THAT plan (the cascade also neutralizes
// `plan.discardSe` on the shared object before rendering)
const planCache = new WeakMap();

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
// the original init's span a residual receiver swap must target
export function buildNestedDestructurePlan({
  declarator, scope, adapter, path = null, resolvePure, resolveGlobalPolyfill,
  isDisabledProp = null,
}) {
  if (planCache.has(declarator)) return planCache.get(declarator);

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

  // inner prop (static method on the nested global): `{ Array: { from } }` - `from` on
  // `Array`. only simple Identifier values; rest / default / non-Identifier / unknown
  // keys fall back to verbatim. uses the bare `resolveBuiltIn` meta resolver first
  // to filter instance kind - `resolvePure` with no path would crash on `enhanceMeta`'s
  // `isMemberLike(path)` for instance resolutions
  function planInnerProp(prop, receiverName) {
    if (leafDisabled(prop)) return { kind: 'verbatim', prop };
    // side-effecting computed keys never reach the flatten (they route to the residual
    // path), so only a static-string / Identifier key resolves here
    const name = isPropertyNode(prop) ? flattenKeyName(prop) : null;
    if (name === null) return { kind: 'verbatim', prop };
    // accept `{ from }`, `{ from: alias }`, `{ from = default }`, `{ from: alias = default }`.
    // user's default is dropped: polyfill is always defined, the user's default would be
    // dead code (fires only on undefined property, which polyfill rules out)
    const valueNode = propBindingIdentifier(prop.value);
    if (!valueNode) return { kind: 'verbatim', prop };
    const meta = { kind: 'property', object: receiverName, key: name, placement: 'static' };
    if (resolveBuiltIn(meta)?.kind === 'instance') return { kind: 'verbatim', prop };
    const pure = resolvePure(meta);
    if (!pure || pure.kind === 'instance') return { kind: 'verbatim', prop };
    return {
      kind: 'consumed', prop,
      extractions: [{ entry: pure.entry, hint: pure.hintName, localName: valueNode.name }],
    };
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
      return { kind: 'consumed', prop: outerProp, extractions };
    }
    return { kind: 'rebuilt', prop: outerProp, pattern, extractions, children };
  }

  // proxy-global outer prop: five shapes
  //   - `{ Foo: { bar, ... } }` where Foo is a real global - inner pattern holds static methods
  //   - `{ Self: { ... } }` where Self is itself a proxy-global - alias hop, recurse keeping
  //     the chain transparent. enables N-level nests like `{ self: { window: { Array: { from } } } } = globalThis`
  //   - `{ Foo }` shorthand / `{ Foo: alias }` aliased - polyfill Foo as a global
  //   - `{ [Symbol.iterator]: ident }` computed Symbol.iterator key - synth extraction
  //     `ident = _getIteratorMethod(receiver)`
  //   - `{ [Symbol.iterator]: {nested} }` non-binding value - keep the prop, polyfill the key
  function planOuterProp(outerProp) {
    // Symbol.iterator shapes and global shorthands are extraction-producing LEAVES - a
    // disabled one stays verbatim ('symbol-iterator-key' included: it force-polyfills the
    // key text, while a verbatim prop leaves that to the directive-honoring natural visitor)
    if (isSymbolIteratorComputedKey(outerProp) && leafDisabled(outerProp)) {
      return { kind: 'verbatim', prop: outerProp };
    }
    const symbolIterLocal = symbolIteratorLocalName(outerProp);
    if (symbolIterLocal !== null) {
      return {
        kind: 'consumed', prop: outerProp,
        extractions: [{ synth: 'symbol-iterator', localName: symbolIterLocal }],
      };
    }
    if (isSymbolIteratorComputedKey(outerProp)) {
      return { kind: 'symbol-iterator-key', prop: outerProp };
    }
    const name = isPropertyNode(outerProp) ? flattenKeyName(outerProp) : null;
    if (name === null) return { kind: 'verbatim', prop: outerProp };
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
        kind: 'consumed', prop: outerProp,
        // `kind: 'global'` lets renderers register the binding as a GLOBAL alias (member
        // reads through the local must keep resolving: `const { Symbol } = globalThis;
        // Symbol.iterator` -> `_Symbol$iterator`), unlike static-method extractions which
        // register a body-extract alias
        extractions: [{ kind: 'global', entry: pure.entry, hint: pure.hintName, localName: value.name }],
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
    if (outerPattern.properties.some(p => p.type === 'RestElement')) return planned;
    const name = isPropertyNode(planned.prop) ? flattenKeyName(planned.prop) : null;
    if (name === null || POSSIBLE_GLOBAL_OBJECTS.has(name)) return planned;
    // a MUTATED ctor (`globalThis.Map = Shim` in-file) must read off the PATCHED native binding, not the
    // pure import - the user's replacement wins. mirror the single-ctor anchor's `anchorSlotMutated` bail
    if (adapter.isMutatedStatic?.(receiver, name)) return planned;
    const anchorPure = resolveGlobalPolyfill(name);
    if (!anchorPure) return planned;
    const inner = peelInnerDefault(planned.prop.value);
    if (inner?.type !== 'ObjectPattern' || inner.properties.some(p => p.type === 'RestElement')) return planned;
    const residualProps = planned.kind === 'verbatim'
      ? inner.properties
      : planned.children.filter(c => c.kind !== 'consumed').map(c => c.prop);
    // a residual leaf with a DEFAULT (top-level OR nested) bails: anchoring renders the residual
    // verbatim/skip-seeded, so a polyfillable default (`{ x = [1].at(0) }`) is dropped by both emitters,
    // and a top-level default also splits babel (re-visits + polyfills) from unplugin (leaves native).
    // a DISABLED leaf likewise stays native. the native residual (current behavior) keeps the default's
    // polyfill reachable by the natural visitor and both emitters consistent
    if (residualProps.some(p => patternHasAnyDefault(p.value) || leafDisabled(p))) return planned;
    return { kind: 'anchored', prop: planned.prop, anchorPure, residualProps, extractions: planned.extractions ?? [] };
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
    const name = isPropertyNode(outerProp) ? flattenKeyName(outerProp) : null;
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
    return foldNestedPattern(outerProp, value, innerProp => planOuterPropStatic(innerProp, hostInit, newPath));
  }

  let plan = null;
  const originalId = declarator.id;
  const peeled = peelArrayWrapperPair({ pattern: originalId, init: declarator.init, scope, adapter, path });
  const { pattern } = peeled;
  const arrayPeelHappened = pattern !== originalId;
  // the DESCENDED init element when an ArrayPattern wrapper was peeled WITHIN the original
  // init's span: a receiver swap in the residual render must target this element, not the
  // whole init (swapping the whole array dropped the brackets and broke the destructure).
  // a const-alias dereference lands OUTSIDE the init span - the residual keeps the alias
  // identifier verbatim, so no element targeting applies
  const initElement = arrayPeelHappened && peeled.init !== declarator.init
    && peeled.init.start >= declarator.init.start && peeled.init.end <= declarator.init.end ? peeled.init : null;
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
          init = resolveBranchProxyName({ branchNode: init.consequent, scope, adapter, path })
            && resolveBranchProxyName({ branchNode: init.alternate, scope, adapter, path })
            ? unwrapExpressionChain(init.consequent) : null;
        } else if (init.type === 'LogicalExpression') {
          init = unwrapExpressionChain(init.operator === '&&' ? init.right : init.left);
        } else break;
      }
    }
    // observable node in the init the flatten DISCARDS: a chain-assignment (rescued WHOLE - it
    // updates a binding and may contain an SE-bearing call) or an SE-bearing chain-root call.
    // harvested into the plan so the emit re-runs it once ahead of the extraction (full consume)
    // or keeps it verbatim in the residual init (partial consume).
    // span guard: `peelArrayWrapperPair` may have DEREFERENCED a const-alias wrapper
    // (`const w = [(IIFE)()]; [{x}] = w`) whose init lives OUTSIDE the discarded slot - its
    // setup already runs at the alias declaration, so harvesting it would double-run
    const probed = init ? discardRescueNode({ node: initBeforeCollapse, scope, adapter, path }) : null;
    const discardSe = probed && declarator.init
      && probed.start >= declarator.init.start && probed.end <= declarator.init.end ? probed : null;
    const receiver = init ? resolveObjectName({ objectNode: init, scope, adapter, path }) : null;
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
      const hopProp = !arrayPeelHappened && pattern.properties.length === 1
        && isPropertyNode(pattern.properties[0]) && !mayHaveSideEffects(declarator.init)
        && !isDisabledProp?.(declarator)
        ? pattern.properties[0] : null;
      const hopKey = hopProp ? sharedResolveKey({
        node: hopProp.key, computed: hopProp.computed, scope, adapter, bailOnSideEffectKey: true,
      }) : null;
      const hopInner = hopKey && !POSSIBLE_GLOBAL_OBJECTS.has(hopKey) && isStaticPlacement(hopKey)
        ? peelInnerDefault(hopProp.value) : null;
      if (hopInner?.type === 'ObjectPattern' && hopInner.properties.length) {
        const outerProps = hopInner.properties.map(p => planInnerProp(p, hopKey));
        // a SLOT-mutated ctor pair (`globalThis.Map = Shim` anywhere in the file) keeps the
        // residual on the RAW member read - a user-installed replacement must win there, so
        // `anchorPure` stays null and the renders emit `<proxyBinding>.<K>` instead of the
        // ctor binding. extractions stay leaf-gated (a mutated LEAF already planned verbatim
        // upstream). the pure-vs-member decision is resolved HERE once - the renders only
        // materialize bindings
        const anchorSlotMutated = !!adapter.isMutatedStatic?.(receiver, hopKey);
        plan = {
          receiver, anchor: hopKey,
          anchorPure: anchorSlotMutated ? null : resolveGlobalPolyfill(hopKey),
          outerProps, pattern: hopInner, discardSe, initElement: null,
        };
      } else {
        const planned = pattern.properties.map(planOuterProp);
        // re-anchor missing-able ctor residuals only in the CLEAN case: an SE-free init where EVERY prop is
        // already consumed or anchorable. a verbatim sibling (always-present ctor / global alias / disabled
        // leaf) or an SE init routes through native-residual / proxy-hop handling that does not split per-
        // ctor, so those stay on the native residual (current behavior - bounded, no regression)
        const reanchored = mayHaveSideEffects(declarator.init)
          ? planned : planned.map(p => anchorMissingAbleResidual(p, pattern, receiver));
        // require at least one CONSUMED (extracting) prop alongside the anchored one: babel's flatten
        // dispatch is usage-driven (it fires on a polyfillable leaf), so an ALL-anchored multi-ctor
        // declarator with no poly leaf never triggers babel while the shape-driven unplugin would - those
        // stay on the native residual (current behavior). a verbatim/rebuilt sibling also bails
        const outerProps = reanchored.every(p => p.kind === 'consumed' || p.kind === 'anchored')
          && reanchored.some(p => p.kind === 'anchored') && reanchored.some(p => p.kind === 'consumed')
          ? reanchored : planned;
        if (outerProps.some(p => hasExtractions(p) || p.kind === 'anchored')) {
          plan = { receiver, outerProps, pattern, discardSe, initElement };
        }
      }
    } else if (receiver && isStaticPlacement(receiver)) {
      // receiver is a known constructor (`Array` / `Map` / ...): pattern's properties
      // are direct method extractions. an ArrayPattern wrapper (with or without a rest
      // sibling) survives the residual render - the rebuilt pattern is spliced back into
      // the original LHS text
      const outerProps = pattern.properties.map(p => planInnerProp(p, receiver));
      if (outerProps.some(hasExtractions)) plan = { receiver, outerProps, pattern, discardSe, initElement };
    } else if (init) {
      const outerProps = pattern.properties.map(p => planOuterPropStatic(p, init, []));
      if (outerProps.some(hasExtractions)) plan = { receiver: null, outerProps, pattern, discardSe, initElement };
    }
  }
  planCache.set(declarator, plan);
  return plan;
}
