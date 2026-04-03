// shared usage detection helpers for babel-plugin and unplugin
// all functions accept raw AST nodes + scope + adapter to abstract Babel vs ESTree differences
//
// scope adapter interface:
//   hasBinding(scope, name)         -> boolean
//   getBinding(scope, name)         -> { node, constantViolations } | null
//   getBindingNodeType(scope, name) -> string | null
//   isStringLiteral(node)           -> boolean
//   getStringValue(node)            -> string | null
import { POSSIBLE_GLOBAL_OBJECTS, symbolKeyToEntry } from './helpers.js';

const MAX_KEY_DEPTH = 10;

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
    if (init?.type === 'Identifier') {
      // unbound -> global
      if (!adapter.hasBinding(scope, init.name)) return init.name;
      // bound -> follow chain recursively
      return resolveBindingToGlobal(init.name, scope, adapter, seen);
    }
    if (init) return null;
  }
  // any other binding (param, catch, class name) - not a global
  return null;
}

function resolveObjectName(objectNode, scope, adapter) {
  if (objectNode.type === 'Identifier') {
    if (adapter.hasBinding(scope, objectNode.name)) return resolveBindingToGlobal(objectNode.name, scope, adapter);
    // no binding - global only if starts with uppercase or is a known global proxy
    return isStaticPlacement(objectNode.name) ? objectNode.name : null;
  }
  // globalThis.Array, self.Promise, globalThis?.Array
  if ((objectNode.type === 'MemberExpression' || objectNode.type === 'OptionalMemberExpression')
    && !objectNode.computed
    && objectNode.object.type === 'Identifier'
    && POSSIBLE_GLOBAL_OBJECTS.has(objectNode.object.name)
    && !adapter.hasBinding(scope, objectNode.object.name)
    && objectNode.property.type === 'Identifier') {
    return objectNode.property.name;
  }
  return null;
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
    if (binding && !binding.constantViolations?.length && binding.node?.type === 'VariableDeclarator') {
      const { init } = binding.node;
      if (init) return resolveKey(init, true, scope, adapter, depth + 1);
    }
  }
  // string concatenation: 'a' + 'b'
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    const left = resolveKey(node.left, true, scope, adapter, depth + 1);
    const right = resolveKey(node.right, true, scope, adapter, depth + 1);
    if (left !== null && right !== null) return left + right;
  }
  // Symbol.X computed access — Symbol.iterator, Symbol['iterator'], Symbol[key] where key = 'iterator'
  if (computed && node.type === 'MemberExpression'
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
  let key;
  if (node.computed) {
    key = resolveKey(node.property, true, scope, adapter);
  } else {
    key = node.property.name || node.property.value;
  }
  if (!key || key === 'prototype') return null;
  // Array.prototype.includes -> instance access on Array
  if (node.object.type === 'MemberExpression' && !node.object.computed
    && node.object.property.type === 'Identifier' && node.object.property.name === 'prototype'
    && node.object.object.type === 'Identifier') {
    const proto = node.object.object.name;
    if (!adapter.hasBinding(scope, proto)) {
      return { kind: 'property', object: proto, key, placement: 'prototype' };
    }
  }
  const objectName = resolveObjectName(node.object, scope, adapter);
  // skip import-bound objects
  if (!objectName && node.object.type === 'Identifier' && isImportBinding(node.object.name, scope, adapter)) {
    return null;
  }
  const placement = objectName ? isStaticPlacement(objectName) : 'prototype';
  return { kind: 'property', object: objectName, key, placement };
}

// process a MemberExpression node: resolve Symbol.X computed key or build member meta
// returns meta or null. Handles handledObjects marking.
export function handleMemberExpressionNode(node, scope, adapter, handledObjects, suppressProxyGlobals) {
  const symbolKey = resolveComputedSymbolKey(node, scope, adapter);
  if (symbolKey) {
    if (adapter.hasBinding(scope, 'Symbol')) return null;
    handledObjects.add(node.property.object);
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

// build meta from BinaryExpression with 'in' operator (Symbol.X in obj)
// returns meta object or null. Also marks handled objects if suppressProxyGlobals is false.
export function handleBinaryIn(node, scope, adapter, handledObjects, suppressProxyGlobals) {
  if (node.operator !== 'in') return null;
  if (node.left.type === 'MemberExpression'
    && node.left.object?.type === 'Identifier' && node.left.object.name === 'Symbol'
    && node.left.property?.type === 'Identifier'
    && !adapter.hasBinding(scope, 'Symbol')) {
    if (!suppressProxyGlobals) {
      handledObjects.add(node.left);
      handledObjects.add(node.left.object);
    }
    return { kind: 'in', key: `Symbol.${ node.left.property.name }`, object: null, placement: null };
  }
  return null;
}

// check if a MemberExpression node is a computed Symbol.X access
// handles dot (foo[Symbol.iterator]), bracket (foo[Symbol['iterator']]),
// and variable (foo[Symbol[key]] where const key = 'iterator')
function resolveComputedSymbolKey(node, scope, adapter) {
  if (!node.computed) return null;
  const prop = node.property;
  if (prop?.type !== 'MemberExpression' || prop.object?.type !== 'Identifier' || prop.object.name !== 'Symbol') return null;
  const name = resolveKey(prop.property, prop.computed, scope, adapter);
  return name ? `Symbol.${ name }` : null;
}

// mark handled objects after processing a MemberExpression meta.
// suppresses duplicate Identifier visitor firing for the object part.
function markHandledObjects(node, handledObjects, suppressProxyGlobals) {
  if (node.object.type === 'Identifier' && !POSSIBLE_GLOBAL_OBJECTS.has(node.object.name)) {
    handledObjects.add(node.object);
  }
  if (suppressProxyGlobals
    && (node.object.type === 'MemberExpression' || node.object.type === 'OptionalMemberExpression')
    && node.object.object?.type === 'Identifier'
    && POSSIBLE_GLOBAL_OBJECTS.has(node.object.object.name)) {
    // mark intermediate MemberExpression (e.g. globalThis.Object) to prevent double-processing,
    // but NOT the proxy global itself — it may need its own polyfill when the outer expression is not polyfilled
    handledObjects.add(node.object);
  }
}

// find the proxy global identifier (globalThis, self, etc.) at the root of a MemberExpression chain
export function findProxyGlobal(node) {
  let obj = node;
  while (obj.type === 'MemberExpression' || obj.type === 'OptionalMemberExpression') obj = obj.object;
  return obj.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(obj.name) ? obj : null;
}

// build meta for destructuring given the resolved init node and key
// both plugins handle parent traversal (finding initNode) themselves, then call this
export function buildDestructuringInitMeta(initNode, key, scope, adapter) {
  if (!initNode) return { kind: 'property', object: null, key, placement: null };
  if (initNode.type === 'Identifier') {
    const objectName = resolveObjectName(initNode, scope, adapter);
    const placement = objectName ? isStaticPlacement(objectName) : null;
    return { kind: 'property', object: objectName, key, placement };
  }
  if (adapter.isStringLiteral(initNode)) {
    return { kind: 'property', object: 'string', key, placement: 'prototype' };
  }
  return { kind: 'property', object: null, key, placement: null };
}

// check if a destructuring ObjectProperty can be safely transformed
// parentType: type of ObjectPattern's parent node, grandParentType: type of the next ancestor
// patternProperties: array of ObjectPattern.properties
// returns false if transformation would break semantics
export function canTransformDestructuring({ parentType, parentInit, grandParentType, patternProperties }) {
  // rest element present - extracting a property changes rest semantics
  if (patternProperties?.some(p => p.type === 'RestElement' || p.type === 'SpreadElement')) return false;
  if (parentType === 'VariableDeclarator') {
    if (!parentInit) return false; // for-of/for-in - no init
    if (grandParentType === 'ForInStatement' || grandParentType === 'ForOfStatement') return false;
    if (grandParentType === 'ForStatement' && patternProperties?.length > 1) return false;
    return true;
  }
  if (parentType === 'AssignmentExpression') return true;
  return false;
}

// check if a node type is a TS/Flow type annotation context
// used by both plugins to skip polyfilling in type-only positions
export function isTypeAnnotationNodeType(type) {
  if (!type) return false;
  if (type === 'TypeAnnotation' || type === 'TSTypeAnnotation') return true;
  // TS types (except expression wrappers that contain runtime values)
  if (type.startsWith('TS')) {
    return type !== 'TSAsExpression'
      && type !== 'TSSatisfiesExpression'
      && type !== 'TSNonNullExpression'
      && type !== 'TSInstantiationExpression'
      && type !== 'TSTypeAssertion';
  }
  // Flow types (except TypeCastExpression which wraps runtime values, like TSAsExpression)
  if (type.startsWith('Flow') || (type.startsWith('Type') && type !== 'TypeCastExpression')
    || type === 'InterfaceDeclaration' || type.startsWith('Declare')) return true;
  return false;
}

// walk TS type annotations to find global type references (Promise, Map, Set, etc.)
export function walkTypeAnnotationGlobals(annotation, onGlobal) {
  if (!annotation) return;
  const stack = [annotation];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'TSTypeReference' && node.typeName?.type === 'Identifier') {
      onGlobal(node.typeName.name);
    } else if (node.type === 'GenericTypeAnnotation' && node.id?.type === 'Identifier') {
      onGlobal(node.id.name);
    }
    for (const key of ['typeAnnotation', 'types', 'elementType', 'objectType', 'indexType',
      'checkType', 'extendsType', 'trueType', 'falseType', 'constraint', 'default',
      'typeArguments', 'typeParameters', 'returnType', 'params',
      'value', 'argument', 'impltype', 'supertype']) {
      const child = node[key];
      if (Array.isArray(child)) for (const c of child) stack.push(c);
      else if (child && typeof child === 'object') stack.push(child);
    }
  }
}

// extract entry source from an AST node (ImportDeclaration or require() ExpressionStatement)
// returns source string or null if not an entry pattern
export function getEntrySource(node, adapter) {
  // import 'core-js/...'
  if (node.type === 'ImportDeclaration' && node.specifiers?.length === 0) {
    return adapter.getStringValue(node.source);
  }
  // require('core-js/...')
  if (node.type === 'ExpressionStatement'
    && node.expression?.type === 'CallExpression'
    && node.expression.callee?.type === 'Identifier'
    && node.expression.callee.name === 'require'
    && node.expression.arguments?.length === 1) {
    return adapter.getStringValue(node.expression.arguments[0]);
  }
  return null;
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
