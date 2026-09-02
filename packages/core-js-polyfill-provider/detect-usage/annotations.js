// TS / Flow type-annotation detection. exposes:
//   - `isTypeAnnotationNodeType(type)` predicate (used to skip type-only positions during
//     polyfill detection)
//   - `walkTypeAnnotationGlobals(annotation, onGlobal, ctx)` walker (entry-global needs to pull
//     `Foo` from `let x: Foo` so `es.foo.constructor` lands at file level)
//   - `checkTypeAnnotations(node, onGlobal, ctx)` helper for class / function annotation slots
//   - `isPolyfillableOptional({ node, scope, adapter, resolve })` - the polyfill replacement
//     consumes `?.`, so the receiver null-check is redundant. `node` may be the optional member
//     OR the optional call wrapping it (`Array.from?.(...)`); a call unwraps to its callee
import {
  getSuperTypeArgs,
  importBindingIsTypeOnly, isMutatedStaticMeta, memberKeyName, POSSIBLE_GLOBAL_OBJECTS,
  TRANSPARENT_EXPR_WRAPPER_TYPES, unwrapRuntimeExpr,
} from '../helpers/ast-patterns.js';
import {
  globalProxyMemberName,
  proxyGlobalRootName,
  maximalProxyGlobalPrefix,
  peelChainAssignment,
  peelChainRootValue,
  peelReceiverSequenceTail,
  proxyReceiverValueCanBeUndefined,
  resolveKey,
  resolveObjectName,
  undefinableProxyRootValue,
  unwrapTransparentSeq,
} from './resolve.js';

// allow-list of TS type-only nodes - unknown `TS*` defaults to runtime (false positive is
// louder than silent skip). runtime-carrying wrappers (TSAsExpression, ...) stay out
const TS_TYPE_ONLY_NODES = new Set([
  'TSTypeAnnotation',
  'TSTypeParameterDeclaration',
  'TSTypeParameterInstantiation',
  'TSTypeParameter',
  'TSStringKeyword',
  'TSNumberKeyword',
  'TSBooleanKeyword',
  'TSBigIntKeyword',
  'TSSymbolKeyword',
  'TSVoidKeyword',
  'TSUndefinedKeyword',
  'TSNullKeyword',
  'TSNeverKeyword',
  'TSAnyKeyword',
  'TSObjectKeyword',
  'TSUnknownKeyword',
  'TSIntrinsicKeyword',
  'TSThisType',
  'TSArrayType',
  'TSTupleType',
  'TSUnionType',
  'TSIntersectionType',
  'TSParenthesizedType',
  'TSOptionalType',
  'TSRestType',
  'TSConditionalType',
  'TSInferType',
  'TSTypeOperator',
  'TSIndexedAccessType',
  'TSMappedType',
  'TSNamedTupleMember',
  'TSLiteralType',
  'TSTemplateLiteralType',
  'TSTypeReference',
  'TSTypeQuery',
  'TSTypePredicate',
  'TSQualifiedName',
  'TSImportType',
  'TSFunctionType',
  'TSConstructorType',
  'TSTypeLiteral',
  'TSInterfaceDeclaration',
  'TSInterfaceBody',
  'TSTypeAliasDeclaration',
  'TSPropertySignature',
  'TSMethodSignature',
  'TSIndexSignature',
  'TSCallSignatureDeclaration',
  'TSConstructSignatureDeclaration',
  'TSDeclareFunction',
  'TSDeclareMethod',
  // oxc-emitted nodes Babel doesn't surface (some are subtypes of TSExpressionWithTypeArguments
  // / TSTypeReference under different names). leaving them out misses type-only contexts on
  // oxc paths, causing false-positive polyfill detection inside `class C implements Foo` etc.
  // NOTE: `TSEnumBody` is intentionally NOT here - enum members carry RUNTIME initializer
  // expressions (`A = [1,2,3].at(0)`) that need polyfill detection. Same for
  // `TSExternalModuleReference` (the `require(...)` in `import x = require(...)`)
  'TSClassImplements',
  'TSInterfaceHeritage',
  'TSNamespaceExportDeclaration',
  'TSJSDocNullableType',
  'TSJSDocNonNullableType',
  'TSJSDocUnknownType',
]);

// Flow type-only nodes (stable naming, no forward-compat concern)
const FLOW_TYPE_ONLY_NODES = new Set([
  'TypeAnnotation',
  'InterfaceDeclaration',
  'InterfaceTypeAnnotation',
  'InterfaceExtends',
  'TypeAlias',
  'OpaqueType',
  'TypeParameter',
  'TypeParameterDeclaration',
  'TypeParameterInstantiation',
  'GenericTypeAnnotation',
  'StringTypeAnnotation',
  'NumberTypeAnnotation',
  'BooleanTypeAnnotation',
  'NullLiteralTypeAnnotation',
  'VoidTypeAnnotation',
  'EmptyTypeAnnotation',
  'AnyTypeAnnotation',
  'MixedTypeAnnotation',
  'ExistsTypeAnnotation',
  'SymbolTypeAnnotation',
  'BigIntTypeAnnotation',
  'UnionTypeAnnotation',
  'IntersectionTypeAnnotation',
  'NullableTypeAnnotation',
  'ArrayTypeAnnotation',
  'TupleTypeAnnotation',
  'ObjectTypeAnnotation',
  'ObjectTypeProperty',
  'ObjectTypeSpreadProperty',
  'ObjectTypeIndexer',
  'ObjectTypeCallProperty',
  'ObjectTypeInternalSlot',
  'FunctionTypeAnnotation',
  'FunctionTypeParam',
  'TypeofTypeAnnotation',
  'IndexedAccessType',
  'OptionalIndexedAccessType',
  'StringLiteralTypeAnnotation',
  'NumberLiteralTypeAnnotation',
  'BooleanLiteralTypeAnnotation',
  'QualifiedTypeIdentifier',
]);

// a TYPE position and a VALUE position ask different shadow questions of the same name, and
// `adapter.hasBinding` answers the value one: it deliberately ignores a type-only import because
// tsc elides it, so a VALUE of that name really is the global. in a TYPE position that same import
// IS the shadow - `import type { Set } from 'immutable'` makes `x: Set<number>` name immutable's
// Set, and injecting es.set.* for it polyfills a global the annotation never named. both detection
// lanes ask this: the shared annotation walk, and babel's identifier visitor, which reports a type
// reference as a referenced identifier and so reaches type positions through the value path
export function typeOnlyImportShadows({ adapter, scope, name, path, hostType }) {
  // `typeof X` names the RUNTIME binding, so the elided import leaves the global exposed there -
  // the type-space answer applies to a plain type reference only
  if (hostType === 'TSTypeQuery') return false;
  return importBindingIsTypeOnly(adapter.getBinding?.(scope, name, path));
}

// does a name read from a type position stand for the real global here? both shadow questions
// together - a runtime binding and a type-only import. the usage sink asks it of every name the
// walk hands it, and the walk itself asks it of a qualified chain's ROOT before promoting the
// chain's further segments to globals: spelled once, so a user `const self = {...}` cannot make
// `x: self.Reflect` report the global Reflect the way a name-only proxy test did
export function annotationNameIsGlobal({ adapter, scope, name, path, hostType }) {
  return !adapter.hasBinding(scope, name, path)
    && !typeOnlyImportShadows({ adapter, scope, name, path, hostType });
}

// is `type` a TS/Flow type-only node? `Declare*` is a stable Flow prefix
export function isTypeAnnotationNodeType(type) {
  if (!type) return false;
  if (TS_TYPE_ONLY_NODES.has(type) || FLOW_TYPE_ONLY_NODES.has(type)) return true;
  return type.startsWith('Declare');
}

// param positions (`(x: Foo) => Bar`) - pattern nodes hosting a child `typeAnnotation`
const TYPE_ANNOTATION_PARAM_HOSTS = new Set([
  'Identifier',
  'RestElement',
  'AssignmentPattern',
  'ObjectPattern',
  'ArrayPattern',
  'TSParameterProperty',
]);

// should the walker descend into `node` when walking a type annotation?
function isTypeWalkable(node) {
  if (!node || typeof node !== 'object') return false;
  const { type } = node;
  if (!type) return false;
  if (isTypeAnnotationNodeType(type)) return true;
  return TYPE_ANNOTATION_PARAM_HOSTS.has(type);
}

// AST child keys that may hold nested type annotations across TS + Flow dialects
const TYPE_CHILD_KEYS = [
  'typeAnnotation',
  'types',
  'elementType',
  'elementTypes', // TSTupleType members; 'elementType' above covers only TSArrayType
  'objectType',
  'indexType',
  'checkType',
  'extendsType',
  'trueType',
  'falseType',
  'constraint',
  'default',
  'typeArguments',
  'typeParameters',
  'returnType',
  'params',
  // babel holds fn-type signature params (TSFunctionType / TSConstructorType / TSCall- /
  // TSConstruct- / TSMethodSignature) under `parameters`; oxc uses `params` above. without
  // this the walker can't reach a global referenced only in a fn-type param on babel ASTs
  'parameters',
  'value',
  'argument',
  'impltype',
  'supertype',
  'nameType',
  'typeParameter',
  'members',
  'body',
  // Flow object-type members: babel spells them `properties` (+ the three dedicated member lists),
  // never `members` - without these the walk returns EMPTY for `x: { m: Map<number> }`
  'properties',
  'indexers',
  'callProperties',
  'internalSlots',
  // Flow function-type slots the `params` / `returnType` pair does not cover
  'rest',
  'this',
  // the two peels a class / function node's own param list needs: a parameter PROPERTY wraps the
  // annotated binding (`constructor(public m: Map<...>)`), and a defaulted parameter carries it on
  // the pattern's left. spelled here rather than in a hand loop beside the walk, which is what the
  // slot descent below already does for every other annotation key
  'parameter',
  'left',
];

// per-node-type: which property holds the bare Identifier that names a type / runtime binding.
// `TSTypeReference.typeName` / `GenericTypeAnnotation.id` - bare type names (Flow vs TS).
// `TSTypeQuery.exprName` - `typeof X` in annotation pulls in the runtime binding `X` as a
// real global reference. qualified names (TSQualifiedName) land on the Identifier `X` in
// `typeof NS.X` through the object position - we deliberately take the root `NS` only when
// it already matches the Identifier shape here
const TYPE_REFERENCE_SLOTS = {
  TSTypeReference: 'typeName',
  GenericTypeAnnotation: 'id',
  TSTypeQuery: 'exprName',
};

// walk a type annotation subtree, invoking `onGlobal(name, hostType)` for every bare type
// reference. `hostType` is the node the name was read from - `typeof X` READS the runtime binding,
// so a consumer asking a type-space question has to tell that host apart from a plain type reference.
// `isTypeWalkable` keeps the walker out of runtime bodies; `seen` bounds cyclic inputs.
// `ctx` (`{ scope, adapter, path }`) is what the qualified-chain arm resolves its ROOT against - a
// proxy-global NAME is only the realm when nothing local shadows it, and the sink's own per-name
// filter cannot answer for the chain's further segments
export function walkTypeAnnotationGlobals(annotation, onGlobal, ctx) {
  if (!annotation) return;
  const seen = new WeakSet();
  const stack = [annotation];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object' || seen.has(node)) continue;
    seen.add(node);
    const refSlot = TYPE_REFERENCE_SLOTS[node.type];
    const ref = refSlot ? node[refSlot] : null;
    if (ref?.type === 'Identifier') onGlobal(ref.name, node.type);
    // a qualified type name (`globalThis.Map.prototype`): `exprName` / `typeName` is a TSQualifiedName
    // whose leftmost `left` is the chain root. unplugin's estree-toolkit scope tracker does not visit
    // the chain, so surface the runtime globals here or the two pipelines diverge (babel reaches them
    // via ReferencedIdentifier). the chain is a runtime reference when it roots at a runtime value:
    //   - TSTypeQuery (`typeof NS.X`) reads NS as a runtime binding, so its root always counts;
    //   - a qualified TSTypeReference (`x: globalThis.Set`) is type-only, so its root counts ONLY when
    //     it is a proxy-global - then the qualified member names a real global TYPE (`globalThis.Set`
    //     is the global `Set`), matching babel's es.set.* + es.global-this. a plain `NS.Foo` over a
    //     type-only namespace stays silent
    else if (ref?.type === 'TSQualifiedName') {
      // collect the qualified chain root-first: `globalThis.Map.prototype` -> [globalThis, Map, ...]
      const segments = [];
      for (let cur = ref; cur; cur = cur.left) {
        if (cur.type === 'TSQualifiedName') segments.unshift(cur.right);
        else { segments.unshift(cur); break; }
      }
      const [root] = segments;
      // the root's proxy-ness is a SCOPE question, not a name one: `const self = { Reflect: {} };
      // let x: self.Reflect` names the user's object, and promoting its segments reported the global
      // Reflect. the sink filters the root itself by the same rule, but it is handed names one at a
      // time and cannot tell a promoted segment from a bare reference
      const rootIsProxy = root?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(root.name)
        && annotationNameIsGlobal({ ...ctx, name: root.name, hostType: node.type });
      if (node.type === 'TSTypeQuery' || rootIsProxy) {
        if (root?.type === 'Identifier') onGlobal(root.name, node.type);
        // when the root is a proxy-global, EACH subsequent segment is itself a real global reference for
        // as long as the chain so far is all proxy-globals (`globalThis` / `self` / `window`): a proxy
        // member resolves back to a global (`globalThis.self.Map` references globalThis AND self AND Map),
        // so surface every proxy-chain link. the chain stops at the first NON-proxy segment - its further
        // members are properties of an ordinary value, not globals (`globalThis.Array.Map` reads Array's
        // `Map` property, NOT the global Map). both emitters route qualified type-name surfacing through
        // this shared walker (babel's ReferencedIdentifier does not fire on a TSQualifiedName's `right`
        // member positions), so they agree here - no cross-emitter over-injection divergence
        let prevIsProxy = rootIsProxy;
        for (let i = 1; i < segments.length && prevIsProxy; i++) {
          const seg = segments[i];
          if (seg?.type !== 'Identifier') break;
          onGlobal(seg.name, node.type);
          prevIsProxy = POSSIBLE_GLOBAL_OBJECTS.has(seg.name);
        }
      }
    }
    for (const key of TYPE_CHILD_KEYS) {
      const child = node[key];
      if (Array.isArray(child)) {
        for (const c of child) if (isTypeWalkable(c)) stack.push(c);
      } else if (isTypeWalkable(child)) {
        stack.push(child);
      }
    }
  }
}

// the static key of a member, dotted or computed: the literal name when the spelling carries one,
// otherwise the canonical key resolver's fold (an SE-prefixed / concat / alias-bound computed key
// names the same static as the dotted form). null when the key is genuinely dynamic. one spelling -
// the three sites here differ only in which path anchors the fold
function memberStaticKey(memberNode, { scope, adapter, path }) {
  return memberKeyName(memberNode)
    ?? (memberNode.computed ? resolveKey({ node: memberNode.property, computed: true, scope, adapter, path }) : null);
}

// walk the ENCLOSING chain from an optional proxy hop UP to its static landing: the first
// member key outside the proxy-global family is the effective global (`.Array`), the next
// member key is the static (`.of`). a MUTATED landing cancels the always-defined claim the
// proxy-prefix deopt relies on - the substitution bails and the raw navigation really reads
// through the guarded value, so the `?.` must keep its guard (the emit then memoizes the
// chain ROOT, the unplugin emitter's canon). a chain that never reaches a second member has no
// static landing to be mutated - the deopt stays.
// THREE-valued (`yes` / `no` / `unknown`), because a key the walk cannot name is not a landing
// verdict at all and the consumers owe it OPPOSITE defaults: the deopt must keep its `?.` on
// `unknown` (dropping a guard over a value that can be undefined is unsound), the render-anchor
// choice must keep its own path. a boolean forced both to read it as "no mutated landing"
export function mutatedStaticLandingVerdict({ path, node = path?.node, scope, adapter, mutatedSet }) {
  if (!mutatedSet?.size) return 'no';
  if (!path) return 'unknown';
  let current = path;
  let globalName = null;
  // the walk may START at the landing's own member (`(v = gw)?.self?.Set` as an optional
  // chainStart): seed the global from the starting member's OWN key - a parent-only walk
  // read the tail key (`name`) as the global and missed the mutated `Set` entirely.
  // `node` may sit BELOW the anchoring path (the unplugin emitter anchors at the trailing
  // instance member while deciding an inner optional): the seed comes from the node, the
  // parent walk from the path - the ctor-slot clause answers even when the walked keys
  // belong to members above the landing
  const ownNode = node;
  if (ownNode?.type === 'MemberExpression' || ownNode?.type === 'OptionalMemberExpression') {
    const ownKey = memberStaticKey(ownNode, { scope, adapter, path });
    if (ownKey === null || ownKey === undefined) return 'unknown';
    if (!POSSIBLE_GLOBAL_OBJECTS.has(ownKey)) globalName = ownKey;
  }
  for (let guard = 0; guard < 64 && current; guard++) {
    const parent = current.parentPath;
    const parentNode = parent?.node;
    if (!parentNode) return 'no';
    if (TRANSPARENT_EXPR_WRAPPER_TYPES.has(parentNode.type) && parentNode.expression === current.node) {
      current = parent;
      continue;
    }
    if ((parentNode.type === 'MemberExpression' || parentNode.type === 'OptionalMemberExpression')
      && parentNode.object === current.node) {
      const key = memberStaticKey(parentNode, { scope, adapter, path: parent });
      if (key === null || key === undefined) return 'unknown';
      if (globalName === null) {
        if (!POSSIBLE_GLOBAL_OBJECTS.has(key)) globalName = key;
        current = parent;
        continue;
      }
      return isMutatedStaticMeta({ kind: 'property', object: globalName, key, placement: 'static' }, mutatedSet)
        ? 'yes' : 'no';
    }
    // the chain ended right after the global (a helper call consumed the static member on a
    // re-visit): a SLOT-mutated constructor poisons every read through it, so the nav must
    // stay raw exactly like the explicit static landing
    return globalName !== null
      && isMutatedStaticMeta({ kind: 'property', object: 'globalThis', key: globalName, placement: 'static' }, mutatedSet)
      ? 'yes' : 'no';
  }
  return 'unknown';
}

// true when the guarded value of a chain-assign-rooted proxy nav can genuinely be undefined:
// the stored value navigates a hop with no ponyfill entry (`n = globalThis.window`). an
// always-defined root (bare proxy name, resolvable nav) keeps the deopt even under a mutated
// landing - the raw read then hangs off a defined object and cannot throw
function proxyNavRootCanBeUndefined(navNode, resolve, aliasCtx) {
  let root = unwrapRuntimeExpr(unwrapTransparentSeq(navNode));
  for (let guard = 0; guard < 64; guard++) {
    if (root?.type === 'MemberExpression' || root?.type === 'OptionalMemberExpression') {
      root = unwrapRuntimeExpr(unwrapTransparentSeq(root.object));
      continue;
    }
    break;
  }
  // a SEQUENCE-wrapped root (`(sc++, n = gw)?.self...`) carries the assign as its TAIL -
  // definedness is the tail's, exactly like the deopt branches' own sequence handling
  root = peelReceiverSequenceTail(root ?? navNode);
  const { value, outer } = peelChainAssignment(root ?? navNode);
  if (!outer) return false;
  const valueCore = unwrapRuntimeExpr(peelReceiverSequenceTail(value));
  return undefinableProxyRootValue(valueCore, resolve, aliasCtx);
}

// does a chain-assign STORE prove the `?.` over it dead? the `?.` guards the assign RESULT, so it is
// dead exactly when that RESULT is always defined once substituted - INDEPENDENT of which member
// follows, since the guard tests the receiver, not the member. that holds for a bare proxy name AND
// for a navigation core-js ponyfills end to end (`(q = globalThis.self)?.x` -> `_self`); it does NOT
// hold when the value navigates a hop with no entry (`(w = globalThis.window)?.x`) - a raw read that
// really can be undefined off-browser, its guard has to fire. ONE verdict for both emitters: the
// babel skip-check's chain-assign arm and the unplugin dispatch's provability walk ask it alike
export function storedProxyNavProvesHop(storeNode, { scope, adapter, path, resolve }) {
  const { value, outer } = peelChainAssignment(storeNode);
  if (!outer) return false;
  // definedness of a sequence value is decided by its TAIL (`(e++, globalThis.self)` is exactly as
  // defined as `globalThis.self`), so peel SE-bearing tails too - the SE-bailing unwrap left such a
  // value unclassified and the guard stayed, while the other side's collapse dropped it: same
  // object at runtime, drifting emit shapes and import sets
  const valueCore = unwrapRuntimeExpr(peelReceiverSequenceTail(value ?? storeNode));
  // a call value that inline-resolves to a proxy-global (`(w = f())?.self.X`, `f = () =>
  // globalThis`) is as always-defined as a bare `globalThis`, and the receiver collapse ALREADY
  // roots through it (`resolveObjectName` inlines the callee) - resolve it the same way here so
  // the dead guard erases in step with that collapse, instead of a kept guard leaving babel a raw
  // static and unplugin a re-run of the call in the fold. the `POSSIBLE_GLOBAL_OBJECTS` gate below
  // discards any non-proxy resolution (an inlined ctor call)
  // every arm answers with a RESOLVED name, the Identifier one included: pairing a boolean predicate
  // with the raw spelling meant only a literal `globalThis` / `self` / `window` could pass the gate
  // below, so an ALIAS store (`const gw = globalThis; (a = gw)?.self.X`) declined the erase its
  // literal twin gets - and the recogniser's positive answer for aliases was dead weight
  const valueName = valueCore?.type === 'Identifier'
    ? proxyGlobalRootName({ node: valueCore, scope, adapter, path })
    : valueCore?.type === 'CallExpression' || valueCore?.type === 'OptionalCallExpression'
      ? resolveObjectName({ objectNode: valueCore, scope, adapter, path })
      : globalProxyMemberName({ node: valueCore, scope, adapter, path });
  // definedness of the stored VALUE is the shared verdict's question, not a hop scan of the node:
  // once the name resolves through an alias, the nav that could be undefined sits behind the
  // binding (`const gw = globalThis.window; (a = gw)?.X`) where a hop scan of the bare identifier
  // finds nothing at all and would erase a load-bearing guard
  return !!valueName && POSSIBLE_GLOBAL_OBJECTS.has(valueName)
    && !undefinableProxyRootValue(valueCore, resolve, { scope, adapter, path });
}

// the same navigation with the CARRIER at its root peeled away, so a name walk sees what the
// carrier-less twin spells (`(t = globalThis).self.Array` names `globalThis.self.Array`). only a
// store of an ALWAYS-DEFINED realm value is transparent this way: one holding a value that can be
// absent (`v = globalThis.window`, an alias of one) IS the environment probe, and naming through it
// would deopt a guard both legs keep. the rebuild is shallow - the copies are read for a name and
// never emitted
function navWithoutRootStore(nav, valueIsDefined) {
  let core = nav;
  for (;;) {
    const stored = core?.type === 'AssignmentExpression' ? peelChainAssignment(core).value : null;
    if (!stored || stored === core || !valueIsDefined(stored)) break;
    core = stored;
  }
  if (core !== nav) return core;
  if (nav?.type !== 'MemberExpression' && nav?.type !== 'OptionalMemberExpression') return nav;
  const object = navWithoutRootStore(nav.object, valueIsDefined);
  return object === nav.object ? nav : { ...nav, object };
}

// the polyfill replacement consumes `?.`, so the receiver null-check is redundant.
// `unwrapTransparentSeq` peels ParenthesizedExpression (oxc preserves; babel strips) and the
// SequenceExpression tail when preceding elements are SE-free (`(0, globalThis)?.Array`).
// `unwrapRuntimeExpr` follow-up strips TS expression wrappers so `(globalThis as any)?.Array`
// also reaches the Identifier check and the polyfill consumes the optional `?.`.
// `path` (when provided) anchors the `adapter.hasBinding` lookup at the reference site,
// catching TS-runtime shadows (`enum`, `namespace`, `import X = require()`) that babel's
// raw scope index misses. extractCheck/replaceInstanceLike pass it through their
// `skipOptional` callback hop; legacy callers without a path-aware adapter still work
// because the third argument is optional on `hasBinding`
export function isPolyfillableOptional({
  node, scope, adapter, resolve, path, resolveSuperStatic, mutatedSet, isShadowedByClassOwnMember,
}) {
  // an optional CALL (`Array.from?.(...)`) carries the polyfillable target on its `callee`, not
  // `.object`; unwrap to the callee so a call-shaped optional resolves against the member below.
  // a non-member callee (`foo?.()`) leaves `.object` undefined and falls through to false
  const member = node.type === 'OptionalCallExpression' || node.type === 'CallExpression' ? node.callee : node;
  const obj = unwrapRuntimeExpr(unwrapTransparentSeq(member.object));
  // static key of the optional callee: Identifier (`Array.from`), static-string computed key
  // (`Array["from"]`, single-quasi `Array[`from`]`), or - through the canonical fold - an
  // SE-prefixed / concat / alias-bound computed key (`Array[(n++, "from")]`); each resolves to
  // the same static as the dotted form, so the callee is equally always-defined post-rewrite
  // (the key text, incl. its SE, stays in place - the deopt only drops the dead `?.`, and the
  // static substitution re-emits the harvested key effects). a genuinely dynamic key stays
  // unresolved (the static visitor never collapses it) and keeps its guard
  const memberKey = memberStaticKey(member, { scope, adapter, path });
  // `super.from?.()` / `this.from?.()` in a static method is an inherited static resolving to the
  // same always-defined polyfill as the bare form (`_Array$from`), so the `?.` deopts just like
  // `Array.from?.()`. resolveSuperStatic (wired with a path inside the static method) resolves it to
  // its static meta; without it (legacy callers) supers fall through to false (no deopt). this keeps
  // the deopt off the generic optional-chain path, which would crash composing the static call-split
  if ((obj?.type === 'Super' || obj?.type === 'ThisExpression') && resolveSuperStatic && path) {
    // an OWN static shadows the inherited name for `this.X` (super skips own statics): the
    // dispatch target is the user's method, no always-defined polyfill backs the read, so the
    // `?.` keeps its guard - the generic optional path then renders the same guarded shape it
    // does for any non-polyfillable inner
    if (obj.type === 'ThisExpression' && memberKey
      && isShadowedByClassOwnMember?.(path, memberKey)) return false;
    const meta = memberKey ? resolveSuperStatic(path, memberKey) : null;
    // a monkey-patched inherited static keeps its `?.` for the same reason as the bare form below
    if (meta && isMutatedStaticMeta(meta, mutatedSet)) return false;
    const resolvedSuper = meta && resolve(meta);
    return resolvedSuper?.kind === 'static' || resolvedSuper?.kind === 'global';
  }
  // effective global name: a bare Identifier (`Array`), or a proxy-global chain resolved through the
  // SAME canonical resolver the emit side uses (`globalProxyMemberName`) so EVERY proxy-global shape
  // it handles - `globalThis.Array`, nested `globalThis.self.Array`, const-alias `const g =
  // globalThis; g.Array`, computed links - deopts identically to the bare static. these must deopt to
  // the always-defined `_Array$from`; otherwise the chain falls into the generic optional-chain path
  // and emits a guarded native `.from` (and the static rewrite collides into the body: `_Array$fromcall`)
  // a SE-wrapping SequenceExpression receiver (`(eff(), globalThis.self)?.X`) carries the proxy-global as its
  // TAIL; the `?.` guards that always-defined value, so resolve the deopt against the tail (the prefix effect
  // is preserved by the receiver collapse, NOT dropped by the deopt). matches both emitters' SE-tail collapse
  const objCore = obj?.type === 'SequenceExpression' ? unwrapRuntimeExpr(unwrapTransparentSeq(obj.expressions.at(-1))) : obj;
  // a member-shape `?.` whose receiver is ENTIRELY proxy navigation (`globalThis.self`, multi-hop `.self.window`,
  // a SE-bearing computed hop `globalThis[(eff(), 'self')]`, a chain-assign root `(q = globalThis).self`,
  // or any of those sequence-wrapped) is dead: the chain collapses to the always-defined pure root, and the
  // hop-key / prefix / assignment effect rides the collapsed receiver, NOT the dropped guard.
  // `globalProxyMemberName` below is literal-only (a SE computed key yields null), so resolve this directly
  // off the SE-aware maximal prefix - both emitters then drop the guard identically. `throughChainAssign`
  // matches the emit-side collapse walkers, which see through the assignment and preserve it as a SE
  // an UNDEFINABLE receiver VALUE keeps its `?.` LIVE against EVERY member-shape deopt arm
  // below (they all reason "always-defined once collapsed", which needs a value-defined
  // receiver): an alias holding `globalThis.window?...` (the verdict canon counts it
  // undefinable), and the inline paren-sealed spelling of the same value (`(globalThis
  // .window?.self.window)?.X`) - a live internal `?.` over an unresolvable read short-circuits
  // where the deopt would run the branch. an ALL-PLAIN multi-hop nav stays deoptable (the
  // proxy-collapse assumption keeps it the always-defined realm global)
  const undefinableReceiver = member === node
    && proxyReceiverValueCanBeUndefined(objCore, resolve, { scope, adapter, path });
  if (member === node
    && !undefinableReceiver
    && maximalProxyGlobalPrefix(objCore, { scope, adapter, path },
      { allowSideEffectKeys: true, throughChainAssign: true }) === objCore
    // MUTATED landing over an undefinable root: the claim this deopt leans on is cancelled,
    // the raw nav reads through a value that can be undefined - the guard must survive
    // the landing verdict runs FIRST: it bails O(1) when the file mutates nothing, where the root
    // descent below walks the whole nav for an answer that could not matter. `unknown` keeps the
    // guard with `yes` - a key the walk could not name leaves the mutated landing unproven either way
    && (mutatedStaticLandingVerdict({ path, node: member, scope, adapter, mutatedSet }) === 'no'
      || !proxyNavRootCanBeUndefined(objCore, resolve, { scope, adapter, path }))) return true;
  // a chain-assign subject: the shared store verdict above owns whether the `?.` is dead. it is
  // deliberately INDEPENDENT of which member follows (the guard tests the receiver, not the member),
  // mirroring the static-call canon `undefinableOptionalGuard`, which erases off the same root value
  // with NO member-key gate: an earlier hop-key gate here kept a DEAD guard on a non-hop member
  // (`(q = globalThis)?.Array...`) that unplugin then double-ran the assign under (a receiver-
  // independent static collapse re-folding the chain-assign the kept guard already ran)
  // the store verdict is the WHOLE answer for this receiver, not one arm among several: what a
  // chain-assign hands on is the value it stored, and the name-based arms below would read the
  // stored nav as the realm it navigates (`(w = globalThis.window)?.Array` - `window` names a
  // proxy global, the VALUE is undefined off-browser and its guard is load-bearing)
  if (member === node && objCore?.type === 'AssignmentExpression') {
    return storedProxyNavProvesHop(objCore, { scope, adapter, path, resolve });
  }
  // an IDENTIFIER receiver is classified by the canon the meta builder itself runs, never by the
  // raw name: reading "bound means not a global" answered a question the static emitter answers
  // differently, so an alias receiver (`const A = Array; A.from?.([1]).at(-1)`) read as
  // non-polyfillable and kept its guard while the emitter substituted `_Array$from` under it.
  // a member CHAIN keeps the proxy-hop recogniser - its narrower acceptance is load-bearing (the
  // opaque-root canon - proving WHICH global a call yields is not proving it yields a defined one) -
  // and it is asked of the chain a CARRIER at the root peels down to, the same peel the ctor-host
  // arm below runs: read as unnamed, `(t = globalThis).self.Array.from?.()` kept a guard over a
  // callee the swap makes always-defined, while the other leg folded that receiver away entirely
  const objCoreNamed = navWithoutRootStore(objCore,
    value => !proxyReceiverValueCanBeUndefined(value, resolve, { scope, adapter, path }));
  const objName = objCore?.type === 'Identifier'
    ? resolveObjectName({ objectNode: objCore, scope, adapter, path })
    : objCoreNamed && globalProxyMemberName({ node: objCoreNamed, scope, adapter, path });
  // a CTOR read off proxy navigation names the STATIC HOST below: `globalProxyMemberName` answers for
  // a proxy HOP only, so `(v = globalThis.self).Number?.MAX_SAFE_INTEGER.name` found no name at all,
  // kept the guard live, and the claim under it died into a raw read off the ponyfill. asked of the
  // HOST - it has to be proxy navigation - because that is what makes the read a real constructor off
  // the realm. it feeds the STATIC arm only: the global early-return reasons about the receiver being
  // the always-defined realm, which a constructor read is not
  const ctorRead = !objName && member === node
    && (objCore?.type === 'MemberExpression' || objCore?.type === 'OptionalMemberExpression')
    // the host is read through its CARRIERS - a store, a sequence tail, the wrappers around either,
    // nested in any order - which is the chain-root peel's own fixpoint
    && POSSIBLE_GLOBAL_OBJECTS.has(resolveObjectName({
      objectNode: peelChainRootValue(objCore.object), scope, adapter, path,
    }) ?? '')
    ? resolveObjectName({ objectNode: objCore, scope, adapter, path }) : null;
  // a PROXY hop is not a constructor read: it names the realm again, and the arms that reason about
  // the realm are the ones above - answering here would deopt a probe's own guard
  const ctorHost = ctorRead && !POSSIBLE_GLOBAL_OBJECTS.has(ctorRead) ? ctorRead : null;
  if (!objName && !ctorHost) return false;
  // the global early-return applies ONLY to the member shape (`Global?.member`), where the `?.`
  // guards the always-defined global itself. for the call shape (`Global.member?.()`) the `?.`
  // guards the MEMBER, so the deopt is sound only when that member is a real static (the property
  // check below) - otherwise a non-static member (`Promise.noSuchStatic?.()`) loses its guard and
  // throws where the native chain short-circuits to undefined
  // a proxy-global ALIAS last hop (`globalThis.self.window?.X` - `window` resolves no `kind:'global'` polyfill
  // but IS a proxy alias of the always-defined global) deopts like `self`: the whole chain collapses to the
  // pure root, so the `?.` over a multi-hop proxy receiver is as dead as over a single-hop one. a non-alias
  // member (`globalThis.self.foo?.x`) stays guarded (`foo` may be undefined) - globalProxyMemberName returns
  // the raw last-hop name without an alias check, so the POSSIBLE_GLOBAL_OBJECTS gate distinguishes the two
  if (objName && member === node && !undefinableReceiver
    && (resolve({ kind: 'global', name: objName }) || POSSIBLE_GLOBAL_OBJECTS.has(objName))) return true;
  const staticHost = objName ?? ctorHost;
  const resolved = memberKey && resolve({ kind: 'property', object: staticHost, key: memberKey, placement: 'static' });
  if (resolved?.kind !== 'static' && resolved?.kind !== 'global') return false;
  // the resolved-member deopt leans on the same collapse claim as the arms above: an
  // undefinable receiver VALUE keeps the `?.` (the branch must not run where native
  // short-circuits), however well the member itself resolves
  if (undefinableReceiver) return false;
  // a monkey-patched / deleted static (`delete Array.from; Array.from?.()`) is no longer always-
  // defined: usage-pure bailed the substitution and kept the native member, so dropping the `?.`
  // would call a deleted slot unconditionally (throws) where the native chain short-circuits to
  // undefined. `mutatedSet` is null outside usage-pure, so this never changes global-mode deopts
  return !isMutatedStaticMeta({ kind: 'property', object: staticHost, key: memberKey }, mutatedSet);
}

// open the walk on a class / function node: every annotation slot such a node carries - its own
// `typeAnnotation` / `returnType`, both parser spellings of the param list, `typeParameters` - is a
// child key the walk already descends, so the descent is spelled ONCE. what stays here is the super
// type-args, whose key differs per dialect and belongs to no annotation slot of the node itself
export function checkTypeAnnotations(node, onGlobal, ctx) {
  walkTypeAnnotationGlobals(node, onGlobal, ctx);
  // class `extends Foo<T>` - Babel: `superTypeParameters`, oxc TS-ESTree: `superTypeArguments`
  const superArgs = getSuperTypeArgs(node);
  if (superArgs) walkTypeAnnotationGlobals(superArgs, onGlobal, ctx);
}
