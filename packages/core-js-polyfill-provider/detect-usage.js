// shared usage detection helpers for babel-plugin and unplugin
// all functions accept raw AST nodes + scope + adapter to abstract Babel vs ESTree differences
//
// scope adapter interface:
//   hasBinding(scope, name)         -> boolean
//   getBinding(scope, name)         -> { node, constantViolations } | null
//   getBindingNodeType(scope, name) -> string | null
//   isStringLiteral(node)           -> boolean
//   getStringValue(node)            -> string | null
import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { POSSIBLE_GLOBAL_OBJECTS, TS_EXPR_WRAPPERS, symbolKeyToEntry } from './helpers.js';

// known-built-in-return-types enumerates every built-in identifier core-js knows about.
// constructors (Array, Map, ...) and global functions (parseInt, fetch, ...) are functions;
// namespaces (Math, JSON, Reflect, ...) and proxy globals (globalThis, self, ...) are plain objects
const KNOWN_FUNCTION_GLOBALS = new Set([
  ...Object.keys(knownBuiltInReturnTypes.constructors),
  ...Object.keys(knownBuiltInReturnTypes.globalMethods),
]);
const KNOWN_NAMESPACE_GLOBALS = new Set(knownBuiltInReturnTypes.namespaces);

const MAX_KEY_DEPTH = 10;

// strip transparent wrappers: ParenthesizedExpression, TS expression wrappers, ChainExpression
// (Array as any).from() / globalThis?.Array must resolve the same as Array.from() / globalThis.Array
function unwrapParens(node) {
  while (node?.type === 'ParenthesizedExpression' || node?.type === 'ChainExpression'
    || TS_EXPR_WRAPPERS.has(node?.type)) node = node.expression;
  return node;
}

function isStaticPlacement(name) {
  if (POSSIBLE_GLOBAL_OBJECTS.has(name)) return 'static';
  if (name[0] >= 'A' && name[0] <= 'Z') return 'static';
  return null;
}

function resolveBindingToGlobal(name, scope, adapter, seen) {
  if (!seen) seen = new Set();
  if (seen.has(name)) return null;
  seen.add(name);
  const bindingType = adapter.getBindingNodeType(scope, name);
  if (bindingType === 'ImportSpecifier' || bindingType === 'ImportDefaultSpecifier'
    || bindingType === 'ImportNamespaceSpecifier') return null;
  if (bindingType === 'VariableDeclarator') {
    const binding = adapter.getBinding(scope, name);
    const { init } = binding.node;
    if (binding.constantViolations?.length) return null;
    // rest element in destructuring: { from, ...rest } = Array - rest !=== init
    const props = binding.node.id?.properties ?? binding.node.id?.elements;
    if (props?.some(p => p?.type === 'RestElement' && p.argument?.name === name)) return null;
    if (init?.type === 'Identifier') {
      // babel-plugin may have mutated `Symbol` into `_Symbol` in place; the adapter exposes
      // the original hint so we can translate the polyfill UID back to its source global
      const initBinding = adapter.getBinding(scope, init.name);
      if (initBinding?.polyfillHint
        && (/^[A-Z]\w*$/.test(initBinding.polyfillHint) || POSSIBLE_GLOBAL_OBJECTS.has(initBinding.polyfillHint))) {
        return initBinding.polyfillHint;
      }
      // unbound -> global; self-reference (var Map = Map) -> global; bound -> follow chain
      if (!adapter.hasBinding(scope, init.name) || init.name === name) return init.name;
      return resolveBindingToGlobal(init.name, scope, adapter, seen);
    }
    // const P = self.Promise / const A = globalThis['Array'] / var _ref = (0, Array)
    if (init) {
      let unwrapped = unwrapParens(init);
      // (0, Array) - sequence expression, value = last element
      if (unwrapped.type === 'SequenceExpression') unwrapped = unwrapParens(unwrapped.expressions.at(-1));
      if (unwrapped.type === 'Identifier') {
        if (!adapter.hasBinding(scope, unwrapped.name)) return unwrapped.name;
        return resolveBindingToGlobal(unwrapped.name, scope, adapter, seen);
      }
      if (unwrapped.type === 'MemberExpression' || unwrapped.type === 'OptionalMemberExpression') {
        return resolveObjectName(unwrapped, scope, adapter, seen);
      }
      return null;
    }
  }
  // any other binding (param, catch, class name) - not a global
  return null;
}

// `seen` threaded from resolveBindingToGlobal so cyclic const chains
// (`const a = b.x; const b = a.x;`) don't restart the cycle guard and stack-overflow
function resolveObjectName(objectNode, scope, adapter, seen) {
  objectNode = unwrapParens(objectNode);
  if (objectNode.type === 'Identifier') {
    if (adapter.hasBinding(scope, objectNode.name)) return resolveBindingToGlobal(objectNode.name, scope, adapter, seen);
    // no binding - global only if starts with uppercase or is a known global proxy
    return isStaticPlacement(objectNode.name) ? objectNode.name : null;
  }
  if (objectNode.type !== 'MemberExpression' && objectNode.type !== 'OptionalMemberExpression') return null;
  // globalThis[`Array`] - computed string-resolvable proxy access
  if (objectNode.computed) {
    return resolveComputedProxyName(objectNode, scope, adapter, seen);
  }
  // globalThis.Array, self.Promise, globalThis.globalThis.Array - walk past chained proxy globals
  // handles mixed chains: globalThis['self'].Array, globalThis.self['self'].Promise
  if (objectNode.property.type !== 'Identifier') return null;
  let inner = unwrapParens(objectNode.object);
  while (inner.type === 'MemberExpression' || inner.type === 'OptionalMemberExpression') {
    const memberKey = inner.computed ? resolveKey(inner.property, true, scope, adapter) : inner.property?.name;
    if (!memberKey || !POSSIBLE_GLOBAL_OBJECTS.has(memberKey)) return null;
    inner = unwrapParens(inner.object);
  }
  if (inner.type !== 'Identifier') return null;
  if (!isProxyGlobalIdentifier(inner, scope, adapter, seen)) return null;
  return objectNode.property.name;
}

// globalThis['Array'] / globalThis['self']['Array'] -> 'Array'
function resolveComputedProxyName(node, scope, adapter, seen) {
  const key = resolveKey(node.property, true, scope, adapter);
  if (!key) return null;
  // walk through chained proxy globals to the root identifier
  let obj = unwrapParens(node.object);
  while (obj.type === 'MemberExpression' || obj.type === 'OptionalMemberExpression') {
    const memberKey = obj.computed ? resolveKey(obj.property, true, scope, adapter) : obj.property?.name;
    if (!memberKey || !POSSIBLE_GLOBAL_OBJECTS.has(memberKey)) return null;
    obj = unwrapParens(obj.object);
  }
  if (obj.type !== 'Identifier') return null;
  if (!isProxyGlobalIdentifier(obj, scope, adapter, seen)) return null;
  return key;
}

// check if an identifier refers to a proxy global: either directly (`globalThis`)
// or through a const alias (`const g = globalThis`).
// `seen` threaded so cyclic `const a = b.x; const b = a.x;` doesn't restart the guard
function isProxyGlobalIdentifier(node, scope, adapter, seen) {
  if (POSSIBLE_GLOBAL_OBJECTS.has(node.name) && !adapter.hasBinding(scope, node.name)) return true;
  // follow const alias: `const g = globalThis` / `const g = self`
  const resolved = resolveBindingToGlobal(node.name, scope, adapter, seen);
  return resolved !== null && POSSIBLE_GLOBAL_OBJECTS.has(resolved);
}

export function resolveKey(node, computed, scope, adapter, depth = 0) {
  if (depth > MAX_KEY_DEPTH) return null;
  if (!computed && node.type === 'Identifier') return node.name;
  if (adapter.isStringLiteral(node)) return adapter.getStringValue(node);
  // template literal without interpolation: `at` -> 'at'
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0 && node.quasis.length === 1) {
    return node.quasis[0].value.cooked;
  }
  // computed: const variable - follow to init and resolve recursively
  if (node.type === 'Identifier' && computed) {
    const binding = adapter.getBinding(scope, node.name);
    if (binding && !binding.constantViolations?.length) {
      if (binding.node?.type === 'VariableDeclarator') {
        const { init } = binding.node;
        if (init) return resolveKey(init, true, scope, adapter, depth + 1);
      }
      // polyfill import binding (e.g., import _Symbol$iterator from '.../symbol/iterator')
      // - recognize as Symbol.<name> to compensate for in-place AST mutation in babel-plugin
      if (binding.importSource) {
        const match = /(?:^|\/)symbol\/(?<name>[\w-]+)$/.exec(binding.importSource);
        if (match) return `Symbol.${ match.groups.name.replaceAll(/-(?<char>\w)/g, (_, char) => char.toUpperCase()) }`;
      }
    }
  }
  // string concatenation: 'a' + 'b'
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    const left = resolveKey(node.left, true, scope, adapter, depth + 1);
    const right = resolveKey(node.right, true, scope, adapter, depth + 1);
    if (left !== null && right !== null) return left + right;
  }
  // Symbol.X computed access - Symbol.iterator, Symbol['iterator'], Symbol[key] where key = 'iterator'
  if (computed && (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
    && node.object.type === 'Identifier' && node.object.name === 'Symbol'
    && !adapter.hasBinding(scope, 'Symbol')) {
    const name = resolveKey(node.property, node.computed, scope, adapter, depth + 1);
    if (name) return `Symbol.${ name }`;
  }
  return null;
}

function isImportBinding(name, scope, adapter) {
  if (!adapter.hasBinding(scope, name)) return false;
  const type = adapter.getBindingNodeType(scope, name);
  return type === 'ImportSpecifier' || type === 'ImportDefaultSpecifier' || type === 'ImportNamespaceSpecifier';
}

function buildMemberMeta(node, scope, adapter) {
  const key = node.computed
    ? resolveKey(node.property, true, scope, adapter)
    : node.property.name || node.property.value;
  if (!key || key === 'prototype') return null;
  // unwrap ESTree ParenthesizedExpression around the object: (Array).from / ((Array)).from
  const obj = unwrapParens(node.object);
  // Array.prototype.includes -> instance access on Array
  if (obj.type === 'MemberExpression' && !obj.computed
    && obj.property.type === 'Identifier' && obj.property.name === 'prototype') {
    const proto = unwrapParens(obj.object);
    if (proto.type === 'Identifier' && !adapter.hasBinding(scope, proto.name)) {
      return { kind: 'property', object: proto.name, key, placement: 'prototype' };
    }
  }
  const objectName = resolveObjectName(obj, scope, adapter);
  // skip import-bound objects
  if (!objectName && obj.type === 'Identifier' && isImportBinding(obj.name, scope, adapter)) {
    return null;
  }
  const placement = objectName ? isStaticPlacement(objectName) : 'prototype';
  return { kind: 'property', object: objectName, key, placement };
}

// process a MemberExpression node: resolve Symbol.X computed key or build member meta
// returns meta or null. Handles handledObjects marking
export function handleMemberExpressionNode(node, scope, adapter, handledObjects, suppressProxyGlobals) {
  const symbolKey = resolveComputedSymbolKey(node, scope, adapter);
  if (symbolKey) {
    if (adapter.hasBinding(scope, 'Symbol')) return null;
    handledObjects.add(unwrapParens(node.property).object);
    return { kind: 'property', object: null, key: symbolKey, placement: 'prototype' };
  }
  const meta = buildMemberMeta(node, scope, adapter);
  if (meta) markHandledObjects(node, handledObjects, suppressProxyGlobals);
  return meta;
}

// resolve Symbol.X key from 'in' meta to { entry, hint } for pure polyfilling
// Symbol.iterator -> is-iterable (replaces entire expression), others -> symbol/X (replaces left side)
export function resolveSymbolInEntry(key) {
  if (key === 'Symbol.iterator') return { entry: 'is-iterable', hint: 'isIterable' };
  const entry = symbolKeyToEntry(key);
  if (!entry) return null;
  return { entry, hint: key.replace('.', '$') };
}

// determine which Symbol.iterator entry to use: 'get-iterator' for direct call, 'get-iterator-method' otherwise
export function resolveSymbolIteratorEntry(node, parent) {
  const isCall = (parent?.type === 'CallExpression' || parent?.type === 'OptionalCallExpression')
    && parent.callee === node;
  return isCall && parent.arguments.length === 0 && !parent.optional ? 'get-iterator' : 'get-iterator-method';
}

// build meta from BinaryExpression with 'in' operator
// handles Symbol.X in obj, 'key' in Constructor, 'key' in globalThis
// returns meta object or null. Also marks handled objects if suppressProxyGlobals is false
export function handleBinaryIn(node, scope, adapter, handledObjects, suppressProxyGlobals) {
  if (node.operator !== 'in') return null;
  // Symbol.X in obj / Symbol?.X in obj / (Symbol?.X) in obj
  const left = unwrapParens(node.left);
  if ((left.type === 'MemberExpression' || left.type === 'OptionalMemberExpression')
    && left.object?.type === 'Identifier' && left.object.name === 'Symbol'
    && !adapter.hasBinding(scope, 'Symbol')) {
    const name = resolveKey(left.property, left.computed, scope, adapter);
    if (name) {
      if (!suppressProxyGlobals) {
        handledObjects.add(node.left);
        handledObjects.add(left.object);
      }
      return { kind: 'in', key: `Symbol.${ name }`, object: null, placement: null };
    }
  }
  // identifier bound to Symbol.X - resolveKey may return Symbol.X for indirect bindings
  // (e.g., const k = Symbol.iterator; k in obj - works regardless of object type)
  const resolvedLeft = resolveKey(node.left, true, scope, adapter);
  if (resolvedLeft?.startsWith('Symbol.')) {
    return { kind: 'in', key: resolvedLeft, object: null, placement: null };
  }
  // 'key' in Object - string key in static/global object
  if (resolvedLeft) {
    const objectName = resolveObjectName(node.right, scope, adapter);
    if (objectName) {
      const placement = isStaticPlacement(objectName);
      if (placement) return { kind: 'in', key: resolvedLeft, object: objectName, placement };
    }
  }
  return null;
}

// check if a MemberExpression node is a computed Symbol.X access
// handles dot (foo[Symbol.iterator]), bracket (foo[Symbol['iterator']]),
// and variable (foo[Symbol[key]] where const key = 'iterator')
function resolveComputedSymbolKey(node, scope, adapter) {
  if (!node.computed) return null;
  const prop = unwrapParens(node.property);
  if ((prop?.type !== 'MemberExpression' && prop?.type !== 'OptionalMemberExpression')
    || prop.object?.type !== 'Identifier' || prop.object.name !== 'Symbol') return null;
  const name = resolveKey(prop.property, prop.computed, scope, adapter);
  return name ? `Symbol.${ name }` : null;
}

// mark handled objects after processing a MemberExpression meta
// suppresses duplicate Identifier visitor firing for the object part
function markHandledObjects(node, handledObjects, suppressProxyGlobals) {
  const obj = unwrapParens(node.object);
  if (obj.type === 'Identifier' && !POSSIBLE_GLOBAL_OBJECTS.has(obj.name)) {
    handledObjects.add(obj);
    return;
  }
  if (!suppressProxyGlobals) return;
  // walk down the proxy chain (`globalThis.Object`, `globalThis.self.Promise`, ...) and mark
  // every intermediate MemberExpression so the inner visitor doesn't re-process it. stop at
  // the proxy global leaf itself - it may need its own polyfill when the outer is not polyfilled
  let current = obj;
  while ((current.type === 'MemberExpression' || current.type === 'OptionalMemberExpression')
    && findProxyGlobal(current)) {
    handledObjects.add(current);
    current = unwrapParens(current.object);
  }
}

// find the proxy global identifier (globalThis, self, etc.) at the root of a MemberExpression chain
export function findProxyGlobal(node) {
  let obj = unwrapParens(node);
  while (obj.type === 'MemberExpression' || obj.type === 'OptionalMemberExpression') obj = unwrapParens(obj.object);
  return obj.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(obj.name) ? obj : null;
}

// map a destructure source identifier to its runtime receiver type hint
// unknown identifiers return null so the resolver falls through to its default type-hint fold
function destructureReceiverHint(objectName) {
  if (!objectName) return null;
  if (KNOWN_FUNCTION_GLOBALS.has(objectName)) return 'function';
  if (KNOWN_NAMESPACE_GLOBALS.has(objectName) || POSSIBLE_GLOBAL_OBJECTS.has(objectName)) return 'object';
  return null;
}

// resolve the argument at `index` in a call's `arguments` list, expanding any `...[lit]`
// spread of an inline array literal. returns null if a non-literal spread precedes `index`,
// since we can't statically know the expanded length
export function resolveCallArgument(args, index) {
  let i = 0;
  for (const arg of args) {
    if (arg?.type === 'SpreadElement') {
      if (arg.argument?.type !== 'ArrayExpression') return null;
      for (const el of arg.argument.elements) {
        if (i === index) return el;
        i++;
      }
      continue;
    }
    if (i === index) return arg;
    i++;
  }
  return null;
}

// build meta for a destructuring property given its resolved init node + key.
// `receiverHint` lets resolveHint reject `const { includes } = Array` (instance method
// that doesn't exist on the constructor) while accepting `Array.from` and inherited
// Function/Object prototype methods like `name`/`toString`.
export function buildDestructuringInitMeta(initNode, key, scope, adapter) {
  if (!initNode) return { kind: 'property', object: null, key, placement: null };
  // oxc-parser preserves ParenthesizedExpression (Babel strips them)
  const unwrapped = unwrapParens(initNode);
  // `Array ?? X`, `X ?? Array`, `X && Array`: try both branches, prefer the one
  // that resolves to a known global (for `??`/`||` the fallback is usually on the right,
  // for `&&` it's always the right).
  // when only the fallback resolves, mark `fromFallback` - the runtime value may come
  // from either branch, so pure-mode must not replace the destructuring
  if (unwrapped.type === 'LogicalExpression') {
    const primary = unwrapped.operator === '&&' ? unwrapped.right : unwrapped.left;
    const meta = buildDestructuringInitMeta(primary, key, scope, adapter);
    if (meta.object) return meta;
    // for `&&` both primary and fallback are the same (right), no point retrying
    if (unwrapped.operator === '&&') return meta;
    const fallback = buildDestructuringInitMeta(unwrapped.right, key, scope, adapter);
    if (fallback.object) return { ...fallback, fromFallback: true };
    return fallback;
  }
  // `(0, Array)`: sequence evaluates to its last expression
  if (unwrapped.type === 'SequenceExpression') {
    return buildDestructuringInitMeta(unwrapped.expressions.at(-1), key, scope, adapter);
  }
  // `const { from } = Array` or `const { from } = globalThis.Array`
  if (unwrapped.type === 'Identifier' || unwrapped.type === 'MemberExpression'
    || unwrapped.type === 'OptionalMemberExpression') {
    const objectName = resolveObjectName(unwrapped, scope, adapter);
    const placement = objectName ? isStaticPlacement(objectName) : null;
    const receiverHint = placement === 'static' ? destructureReceiverHint(objectName) : null;
    return { kind: 'property', object: objectName, key, placement, receiverHint };
  }
  if (adapter.isStringLiteral(unwrapped)) {
    return { kind: 'property', object: 'string', key, placement: 'prototype' };
  }
  return { kind: 'property', object: null, key, placement: null };
}

// check if a destructuring ObjectProperty can be safely transformed
// parentType: type of ObjectPattern's parent node, grandParentType: type of the next ancestor
// patternProperties: array of ObjectPattern.properties
// returns false if transformation would break semantics
export function canTransformDestructuring({ parentType, parentInit, grandParentType, patternProperties }) {
  if (parentType === 'VariableDeclarator') {
    if (!parentInit) return false; // for-of/for-in - no init
    if (grandParentType === 'ForInStatement' || grandParentType === 'ForOfStatement') return false;
    if (grandParentType === 'ForStatement' && patternProperties?.length > 1) return false;
    return true;
  }
  return parentType === 'AssignmentExpression';
}

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
    if (node.type === 'TSTypeReference' && node.typeName?.type === 'Identifier') {
      onGlobal(node.typeName.name);
    } else if (node.type === 'GenericTypeAnnotation' && node.id?.type === 'Identifier') {
      onGlobal(node.id.name);
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

// check if an optional MemberExpression will be polyfilled as a static/global
// (the replacement consumes the `?.` token, making null-checks on it unnecessary)
// uses the polyfill resolver to distinguish polyfillable globals (Array, Promise)
// from user code (foo, MyClass) - scope adapter is used for binding check
export function isPolyfillableOptional(node, scope, adapter, resolve) {
  const obj = node.object;
  if (obj?.type !== 'Identifier' || adapter.hasBinding(scope, obj.name)) return false;
  if (resolve({ kind: 'global', name: obj.name })) return true;
  const key = !node.computed && node.property?.type === 'Identifier' && node.property.name;
  const resolved = key && resolve({ kind: 'property', object: obj.name, key, placement: 'static' });
  return resolved?.kind === 'static' || resolved?.kind === 'global';
}

// pull the source argument out of a dynamic import call (`import('core-js/...')`).
// covers both shapes: ImportExpression (`{type: 'ImportExpression', source}`) and the CallExpression
// form some parsers emit (`{type: 'CallExpression', callee: {type: 'Import'}, arguments: [...]}`)
function importExpressionSource(node, adapter) {
  if (!node) return null;
  if (node.type === 'ImportExpression') return adapter.getStringValue(node.source);
  if (node.type === 'CallExpression' && node.callee?.type === 'Import') {
    return adapter.getStringValue(node.arguments?.[0]);
  }
  return null;
}

// extract entry source from an AST node (ImportDeclaration / require() / await import())
// returns source string or null if not an entry pattern. when `scope` is provided, calls to a
// shadowed `require` (locally bound) are ignored
export function getEntrySource(node, adapter, scope) {
  // import 'core-js/...'
  if (node.type === 'ImportDeclaration' && node.specifiers?.length === 0) {
    return adapter.getStringValue(node.source);
  }
  if (node.type !== 'ExpressionStatement') return null;
  const expr = node.expression;
  // require('core-js/...')
  if (expr?.type === 'CallExpression'
    && expr.callee?.type === 'Identifier'
    && expr.callee.name === 'require'
    && expr.arguments?.length === 1) {
    if (scope && adapter?.hasBinding?.(scope, 'require')) return null;
    return adapter.getStringValue(expr.arguments[0]);
  }
  // await import('core-js/...') as a top-level statement (ESM top-level await).
  // bare `import('...')` without await/then is intentionally ignored - it would discard
  // the returned promise and create an unhandled rejection, so it's not a real-world entry shape
  if (expr?.type === 'AwaitExpression') return importExpressionSource(expr.argument, adapter);
  return null;
}

const canonicalizeEntrySubpath = s => s.replace(/\.[cm]?js$/, '').replace(/\/index$/, '');

function stripPkgPrefix(source, packages) {
  for (const pkg of packages) {
    const prefix = `${ pkg }/`;
    if (source.startsWith(prefix)) return source.slice(prefix.length);
  }
  return null;
}

function defaultSpecifierName(node) {
  const spec = node.specifiers?.find(s => s.type === 'ImportDefaultSpecifier');
  return spec?.local?.name ?? null;
}

// find user-authored core-js imports so the injector can reuse them instead of duplicating.
// pure imports outside `mode/` are skipped - different polyfill layer, unsafe to reuse
export function scanExistingCoreJSImports(ast, { packages, mode, adapter, onGlobalImport, onPureImport }) {
  const modePrefix = mode ? `${ mode }/` : null;
  for (const node of ast.body ?? []) {
    if (node.type !== 'ImportDeclaration') continue;
    const source = adapter.getStringValue(node.source);
    if (typeof source !== 'string') continue;
    if (node.specifiers?.length === 0) {
      const rest = stripPkgPrefix(source, packages);
      if (rest?.startsWith('modules/')) {
        const mod = canonicalizeEntrySubpath(rest.slice('modules/'.length));
        if (mod) onGlobalImport?.(mod);
      }
      continue;
    }
    if (!modePrefix || !onPureImport) continue;
    const name = defaultSpecifierName(node);
    if (!name) continue;
    const afterPkg = stripPkgPrefix(source, packages);
    if (!afterPkg?.startsWith(modePrefix)) continue;
    const entry = canonicalizeEntrySubpath(afterPkg.slice(modePrefix.length));
    if (entry) onPureImport(entry, name);
  }
}

export function checkTypeAnnotations(node, onGlobal) {
  if (node.typeAnnotation) walkTypeAnnotationGlobals(node.typeAnnotation, onGlobal);
  if (node.returnType) walkTypeAnnotationGlobals(node.returnType, onGlobal);
  if (node.params) {
    for (const param of node.params) {
      const p = param.type === 'AssignmentPattern' ? param.left : param;
      if (p.typeAnnotation) walkTypeAnnotationGlobals(p.typeAnnotation, onGlobal);
    }
  }
  if (node.typeParameters?.params) {
    for (const p of node.typeParameters.params) {
      if (p.constraint) walkTypeAnnotationGlobals(p.constraint, onGlobal);
      if (p.default) walkTypeAnnotationGlobals(p.default, onGlobal);
    }
  }
  if (node.superTypeParameters) walkTypeAnnotationGlobals(node.superTypeParameters, onGlobal);
}
