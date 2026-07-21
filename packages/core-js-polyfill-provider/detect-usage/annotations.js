// TS / Flow type-annotation detection. exposes:
//   - `isTypeAnnotationNodeType(type)` predicate (used to skip type-only positions during
//     polyfill detection)
//   - `walkTypeAnnotationGlobals(annotation, onGlobal)` walker (entry-global needs to pull
//     `Foo` from `let x: Foo` so `es.foo.constructor` lands at file level)
//   - `checkTypeAnnotations(node, onGlobal)` helper for class / function annotation slots
//   - `isPolyfillableOptional({ node, scope, adapter, resolve })` - the polyfill replacement
//     consumes `?.`, so the receiver null-check is redundant. `node` may be the optional member
//     OR the optional call wrapping it (`Array.from?.(...)`); a call unwraps to its callee
import {
  getSuperTypeArgs, isMutatedStaticMeta, memberKeyName, POSSIBLE_GLOBAL_OBJECTS,
  TRANSPARENT_EXPR_WRAPPER_TYPES, unwrapRuntimeExpr,
} from '../helpers/ast-patterns.js';
import { globalProxyMemberName, isProxyGlobalIdentifierNode } from '../helpers/class-walk.js';
import {
  maximalProxyGlobalPrefix, navHasUnresolvableProxyHop, peelChainAssignment, peelReceiverSequenceTail,
  resolveKey, undefinableProxyRootValue, unwrapTransparentSeq,
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
]);

// should the walker descend into `node` when walking a type annotation?
function isTypeWalkable(node) {
  if (!node || typeof node !== 'object') return false;
  const { type } = node;
  if (!type) return false;
  if (isTypeAnnotationNodeType(type)) return true;
  if (type === 'TSInterfaceBody' || type === 'TSModuleBlock' || type === 'TSTypeParameter') return true;
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

// walk a type annotation subtree, invoking `onGlobal(name)` for every bare type reference.
// `isTypeWalkable` keeps the walker out of runtime bodies; `seen` bounds cyclic inputs
export function walkTypeAnnotationGlobals(annotation, onGlobal) {
  if (!annotation) return;
  const seen = new WeakSet();
  const stack = [annotation];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object' || seen.has(node)) continue;
    seen.add(node);
    const refSlot = TYPE_REFERENCE_SLOTS[node.type];
    const ref = refSlot ? node[refSlot] : null;
    if (ref?.type === 'Identifier') onGlobal(ref.name);
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
      const rootIsProxy = root?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(root.name);
      if (node.type === 'TSTypeQuery' || rootIsProxy) {
        if (root?.type === 'Identifier') onGlobal(root.name);
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
          onGlobal(seg.name);
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
// walk the ENCLOSING chain from an optional proxy hop UP to its static landing: the first
// member key outside the proxy-global family is the effective global (`.Array`), the next
// member key is the static (`.of`). a MUTATED landing cancels the always-defined claim the
// proxy-prefix deopt relies on - the substitution bails and the raw navigation really reads
// through the guarded value, so the `?.` must keep its guard (the emit then memoizes the
// chain ROOT, the text emitter's canon). a chain that never reaches a second member has no
// static landing to be mutated - the deopt stays
export function chainNavigatesIntoMutatedStatic({ path, node = path?.node, scope, adapter, mutatedSet }) {
  if (!mutatedSet?.size || !path) return false;
  let current = path;
  let globalName = null;
  // the walk may START at the landing's own member (`(v = gw)?.self?.Set` as an optional
  // chainStart): seed the global from the starting member's OWN key - a parent-only walk
  // read the tail key (`name`) as the global and missed the mutated `Set` entirely.
  // `node` may sit BELOW the anchoring path (the text emitter anchors at the trailing
  // instance member while deciding an inner optional): the seed comes from the node, the
  // parent walk from the path - the ctor-slot clause answers even when the walked keys
  // belong to members above the landing
  const ownNode = node;
  if (ownNode?.type === 'MemberExpression' || ownNode?.type === 'OptionalMemberExpression') {
    const ownKey = memberKeyName(ownNode)
      ?? (ownNode.computed ? resolveKey({ node: ownNode.property, computed: true, scope, adapter, path }) : null);
    if (ownKey !== null && ownKey !== undefined && !POSSIBLE_GLOBAL_OBJECTS.has(ownKey)) globalName = ownKey;
  }
  for (let guard = 0; guard < 64 && current; guard++) {
    const parent = current.parentPath;
    const parentNode = parent?.node;
    if (!parentNode) return false;
    if (TRANSPARENT_EXPR_WRAPPER_TYPES.has(parentNode.type) && parentNode.expression === current.node) {
      current = parent;
      continue;
    }
    if ((parentNode.type === 'MemberExpression' || parentNode.type === 'OptionalMemberExpression')
      && parentNode.object === current.node) {
      const key = memberKeyName(parentNode)
        ?? (parentNode.computed
          ? resolveKey({ node: parentNode.property, computed: true, scope, adapter, path: parent }) : null);
      if (key === null || key === undefined) return false;
      if (globalName === null) {
        if (!POSSIBLE_GLOBAL_OBJECTS.has(key)) globalName = key;
        current = parent;
        continue;
      }
      return isMutatedStaticMeta({ kind: 'property', object: globalName, key, placement: 'static' }, mutatedSet);
    }
    // the chain ended right after the global (a helper call consumed the static member on a
    // re-visit): a SLOT-mutated constructor poisons every read through it, so the nav must
    // stay raw exactly like the explicit static landing
    return globalName !== null
      && isMutatedStaticMeta({ kind: 'property', object: 'globalThis', key: globalName, placement: 'static' }, mutatedSet);
  }
  return false;
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

export function isPolyfillableOptional({
  node, scope, adapter, resolve, path, resolveSuperStatic, mutatedSet, isShadowedByClassOwnMember,
  mutatedKeptRootAware = false,
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
  const memberKey = memberKeyName(member)
    ?? (member.computed ? resolveKey({ node: member.property, computed: true, scope, adapter, path }) : null);
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
  if (member === node
    && maximalProxyGlobalPrefix(objCore, { scope, adapter, path },
      { allowSideEffectKeys: true, throughChainAssign: true }) === objCore
    // MUTATED landing over an undefinable root: the claim this deopt leans on is cancelled,
    // the raw nav reads through a value that can be undefined - the guard must survive.
    // OPT-IN (`mutatedKeptRootAware`): only the AST emitter's skip-check arms its guard off
    // this answer; the text emitter's guard-root locator walks past dead hops to the kept
    // root its own machinery guards - flipping its answer stacked a SECOND guard with a
    // re-evaluated root assignment
    && !(mutatedKeptRootAware && proxyNavRootCanBeUndefined(objCore, resolve, { scope, adapter, path })
      && chainNavigatesIntoMutatedStatic({ path, node: member, scope, adapter, mutatedSet }))) return true;
  // a chain-assign subject navigating a PROXY HOP (`(q = globalThis)?.self.x`, nested
  // `(m = n = globalThis)?.self.x`): the guarded value is the assign RESULT, so the `?.` is dead exactly
  // when that RESULT is always defined once substituted. that holds for a bare proxy name AND for a
  // navigation core-js ponyfills end to end (`(q = globalThis.self)?.x` -> `_self`) - the substitution is
  // what makes it defined, so the source's own off-engine undefined says nothing. it does NOT hold when
  // the value navigates a hop with no entry (`(w = globalThis.window)?.x`): that stays a raw read which
  // really can be undefined off-browser, and its guard has to fire. gated on the hop key too: a non-hop
  // member (`(q = globalThis)?.Array...`) keeps the (dead but harmless) guard - both emitters' guarded
  // shape is already canonical there, and the text emitter has no hop-collapse claim to strip the `?.` into
  if (member === node && objCore?.type === 'AssignmentExpression'
    && memberKey && POSSIBLE_GLOBAL_OBJECTS.has(memberKey)) {
    const { value, outer } = peelChainAssignment(objCore);
    // definedness of a sequence value is decided by its TAIL (`(e++, globalThis.self)` is exactly as
    // defined as `globalThis.self`), so peel SE-bearing tails too - the SE-bailing unwrap left such a
    // value unclassified and the guard stayed, while the AST emitter's collapse dropped it: same object
    // at runtime, drifting emit shapes and import sets
    const valueCore = unwrapRuntimeExpr(peelReceiverSequenceTail(value ?? objCore));
    const valueName = valueCore?.type === 'Identifier'
      ? (isProxyGlobalIdentifierNode({ node: valueCore, scope, adapter, path }) ? valueCore.name : null)
      : globalProxyMemberName({ node: valueCore, scope, adapter, path });
    if (outer && valueName && POSSIBLE_GLOBAL_OBJECTS.has(valueName)
      && !navHasUnresolvableProxyHop(valueCore, resolve)) return true;
  }
  const objName = objCore?.type === 'Identifier'
    ? (adapter.hasBinding(scope, objCore.name, path) ? null : objCore.name)
    : globalProxyMemberName({ node: objCore, scope, adapter, path });
  if (!objName) return false;
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
  if (member === node && (resolve({ kind: 'global', name: objName }) || POSSIBLE_GLOBAL_OBJECTS.has(objName))) return true;
  const resolved = memberKey && resolve({ kind: 'property', object: objName, key: memberKey, placement: 'static' });
  if (resolved?.kind !== 'static' && resolved?.kind !== 'global') return false;
  // a monkey-patched / deleted static (`delete Array.from; Array.from?.()`) is no longer always-
  // defined: usage-pure bailed the substitution and kept the native member, so dropping the `?.`
  // would call a deleted slot unconditionally (throws) where the native chain short-circuits to
  // undefined. `mutatedSet` is null outside usage-pure, so this never changes global-mode deopts
  return !isMutatedStaticMeta({ kind: 'property', object: objName, key: memberKey }, mutatedSet);
}

export function checkTypeAnnotations(node, onGlobal) {
  if (node.typeAnnotation) walkTypeAnnotationGlobals(node.typeAnnotation, onGlobal);
  if (node.returnType) walkTypeAnnotationGlobals(node.returnType, onGlobal);
  if (node.params) {
    for (const param of node.params) {
      // `TSParameterProperty` wraps `constructor(public m: Map<...>)` shapes - the actual
      // annotation lives on `.parameter`, which may itself be an `AssignmentPattern` for
      // defaulted parameter properties (`constructor(public m: Map<...> = new Map())`)
      const peeled = param.type === 'TSParameterProperty' ? param.parameter : param;
      const p = peeled?.type === 'AssignmentPattern' ? peeled.left : peeled;
      if (p?.typeAnnotation) walkTypeAnnotationGlobals(p.typeAnnotation, onGlobal);
      // RestElement annotation: the pinned parsers (babel + oxc) place it directly on the rest
      // element's `typeAnnotation` (covered above); `.argument.typeAnnotation` is a defensive
      // fallback for an alternate ESTree shape neither currently emits. check both so
      // `function f(...args: Array<Foo>)` detects Foo regardless of slot
      if (p?.type === 'RestElement' && p.argument?.typeAnnotation) {
        walkTypeAnnotationGlobals(p.argument.typeAnnotation, onGlobal);
      }
    }
  }
  if (node.typeParameters?.params) {
    for (const p of node.typeParameters.params) {
      if (p.constraint) walkTypeAnnotationGlobals(p.constraint, onGlobal);
      if (p.default) walkTypeAnnotationGlobals(p.default, onGlobal);
    }
  }
  // class `extends Foo<T>` - Babel: `superTypeParameters`, oxc TS-ESTree: `superTypeArguments`
  const superArgs = getSuperTypeArgs(node);
  if (superArgs) walkTypeAnnotationGlobals(superArgs, onGlobal);
}
