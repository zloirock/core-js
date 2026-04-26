// TS / Flow type-annotation detection. exposes:
//   - `isTypeAnnotationNodeType(type)` predicate (used to skip type-only positions during
//     polyfill detection)
//   - `walkTypeAnnotationGlobals(annotation, onGlobal)` walker (entry-global needs to pull
//     `Foo` from `let x: Foo` so `es.foo.constructor` lands at file level)
//   - `checkTypeAnnotations(node, onGlobal)` helper for class / function annotation slots
//   - `isPolyfillableOptional(member, scope, adapter, resolve)` - the polyfill replacement
//     consumes `?.`, so the receiver null-check is redundant
import { getSuperTypeArgs } from '../helpers.js';
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
// ESTree (oxc) preserves ParenthesizedExpression around the object (`(globalThis)?.Array`),
// which babel strips - unwrap here so the optimization fires for both parsers
export function isPolyfillableOptional(node, scope, adapter, resolve) {
  const obj = unwrapParens(node.object);
  if (obj?.type !== 'Identifier' || adapter.hasBinding(scope, obj.name)) return false;
  if (resolve({ kind: 'global', name: obj.name })) return true;
  const key = !node.computed && node.property?.type === 'Identifier' && node.property.name;
  const resolved = key && resolve({ kind: 'property', object: obj.name, key, placement: 'static' });
  return resolved?.kind === 'static' || resolved?.kind === 'global';
}

export function checkTypeAnnotations(node, onGlobal) {
  if (node.typeAnnotation) walkTypeAnnotationGlobals(node.typeAnnotation, onGlobal);
  if (node.returnType) walkTypeAnnotationGlobals(node.returnType, onGlobal);
  if (node.params) {
    for (const param of node.params) {
      const p = param.type === 'AssignmentPattern' ? param.left : param;
      if (p.typeAnnotation) walkTypeAnnotationGlobals(p.typeAnnotation, onGlobal);
      // RestElement parser divergence: babel puts `typeAnnotation` directly on the rest
      // element (covered above); oxc TS-ESTree places it on the inner `argument` (Identifier).
      // check both slots so `function f(...args: Array<Foo>)` detects Foo on both parsers
      if (p.type === 'RestElement' && p.argument?.typeAnnotation) {
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
