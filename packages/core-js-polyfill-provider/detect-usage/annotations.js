// TS / Flow type-annotation detection. exposes:
//   - `isTypeAnnotationNodeType(type)` predicate (used to skip type-only positions during
//     polyfill detection)
//   - `walkTypeAnnotationGlobals(annotation, onGlobal)` walker (entry-global needs to pull
//     `Foo` from `let x: Foo` so `es.foo.constructor` lands at file level)
//   - `checkTypeAnnotations(node, onGlobal)` helper for class / function annotation slots
//   - `isPolyfillableOptional({ node, scope, adapter, resolve })` - the polyfill replacement
//     consumes `?.`, so the receiver null-check is redundant. `node` may be the optional member
//     OR the optional call wrapping it (`Array.from?.(...)`); a call unwraps to its callee
import { getSuperTypeArgs, memberKeyName, unwrapRuntimeExpr } from '../helpers/ast-patterns.js';
import { globalProxyMemberName, POSSIBLE_GLOBAL_OBJECTS } from '../helpers/class-walk.js';
import { unwrapParens } from './resolve.js';

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
        // `Map` property, NOT the global Map). this is INTENTIONALLY more precise than babel-plugin, whose
        // ReferencedIdentifier surfaces every qualified-name segment (over-injecting es.map.* here); the
        // divergence is safe under the usage-global over-inject bias and pinned by a fixture
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
// `unwrapParens` peels ParenthesizedExpression (oxc preserves; babel strips) and the
// SequenceExpression tail when preceding elements are SE-free (`(0, globalThis)?.Array`).
// `unwrapRuntimeExpr` follow-up strips TS expression wrappers so `(globalThis as any)?.Array`
// also reaches the Identifier check and the polyfill consumes the optional `?.`.
// `path` (when provided) anchors the `adapter.hasBinding` lookup at the reference site,
// catching TS-runtime shadows (`enum`, `namespace`, `import X = require()`) that babel's
// raw scope index misses. extractCheck/replaceInstanceLike pass it through their
// `skipOptional` callback hop; legacy callers without a path-aware adapter still work
// because the third argument is optional on `hasBinding`
export function isPolyfillableOptional({ node, scope, adapter, resolve, path, resolveSuperStatic }) {
  // an optional CALL (`Array.from?.(...)`) carries the polyfillable target on its `callee`, not
  // `.object`; unwrap to the callee so a call-shaped optional resolves against the member below.
  // a non-member callee (`foo?.()`) leaves `.object` undefined and falls through to false
  const member = node.type === 'OptionalCallExpression' || node.type === 'CallExpression' ? node.callee : node;
  const obj = unwrapRuntimeExpr(unwrapParens(member.object));
  // static key of the optional callee: Identifier (`Array.from`), static-string computed key
  // (`Array["from"]`, single-quasi `Array[`from`]`), or null for a dynamic key (`Array[k]`). a
  // static-string key resolves to the same static as the dotted form, so the callee is equally
  // always-defined post-rewrite; a dynamic key stays unresolved (the static visitor never collapses it)
  const memberKey = memberKeyName(member);
  // `super.from?.()` / `this.from?.()` in a static method is an inherited static resolving to the
  // same always-defined polyfill as the bare form (`_Array$from`), so the `?.` deopts just like
  // `Array.from?.()`. resolveSuperStatic (wired with a path inside the static method) resolves it to
  // its static meta; without it (legacy callers) supers fall through to false (no deopt). this keeps
  // the deopt off the generic optional-chain path, which would crash composing the static call-split
  if ((obj?.type === 'Super' || obj?.type === 'ThisExpression') && resolveSuperStatic && path) {
    const meta = memberKey ? resolveSuperStatic(path, memberKey) : null;
    const resolvedSuper = meta && resolve(meta);
    return resolvedSuper?.kind === 'static' || resolvedSuper?.kind === 'global';
  }
  // effective global name: a bare Identifier (`Array`), or a proxy-global chain resolved through the
  // SAME canonical resolver the emit side uses (`globalProxyMemberName`) so EVERY proxy-global shape
  // it handles - `globalThis.Array`, nested `globalThis.self.Array`, const-alias `const g =
  // globalThis; g.Array`, computed links - deopts identically to the bare static. these must deopt to
  // the always-defined `_Array$from`; otherwise the chain falls into the generic optional-chain path
  // and emits a guarded native `.from` (and the static rewrite collides into the body: `_Array$fromcall`)
  const objName = obj?.type === 'Identifier'
    ? (adapter.hasBinding(scope, obj.name, path) ? null : obj.name)
    : globalProxyMemberName({ node: obj, scope, adapter, path });
  if (!objName) return false;
  // the global early-return applies ONLY to the member shape (`Global?.member`), where the `?.`
  // guards the always-defined global itself. for the call shape (`Global.member?.()`) the `?.`
  // guards the MEMBER, so the deopt is sound only when that member is a real static (the property
  // check below) - otherwise a non-static member (`Promise.noSuchStatic?.()`) loses its guard and
  // throws where the native chain short-circuits to undefined
  if (member === node && resolve({ kind: 'global', name: objName })) return true;
  const resolved = memberKey && resolve({ kind: 'property', object: objName, key: memberKey, placement: 'static' });
  return resolved?.kind === 'static' || resolved?.kind === 'global';
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
