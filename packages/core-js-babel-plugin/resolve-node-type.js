'use strict';
const {
  globalMethods: KNOWN_GLOBAL_METHOD_RETURN_TYPES,
  globalProperties: KNOWN_GLOBAL_PROPERTY_RETURN_TYPES,
  staticMethods: KNOWN_STATIC_METHOD_RETURN_TYPES,
  staticProperties: KNOWN_STATIC_PROPERTY_RETURN_TYPES,
  instanceMethods: KNOWN_INSTANCE_METHOD_RETURN_TYPES,
  instanceProperties: KNOWN_INSTANCE_PROPERTY_RETURN_TYPES,
  staticTypeGuards: KNOWN_STATIC_TYPE_GUARDS,
} = require('@core-js/compat/known-built-in-return-types');

const { assign, create, hasOwn } = Object;

const MAX_DEPTH = 15;

const POSSIBLE_GLOBAL_PROXIES = new Set([
  'global',
  'globalThis',
  'self',
  'window',
]);

const PRIMITIVES = new Set([
  'bigint',
  'boolean',
  'null',
  'number',
  'string',
  'symbol',
  'undefined',
]);

const PRIMITIVE_WRAPPERS = assign(create(null), {
  bigint: 'BigInt',
  boolean: 'Boolean',
  number: 'Number',
  string: 'String',
  symbol: 'Symbol',
});

const TYPEOF_HINT_GROUPS = assign(create(null), {
  string: new Set(['string']),
  number: new Set(['number']),
  boolean: new Set(['boolean']),
  bigint: new Set(['bigint']),
  symbol: new Set(['symbol']),
  function: new Set(['function']),
  // lack of boxed primitives - acceptable assumption
  object: new Set([
    'array',
    'date',
    'object',
    'promise',
    'regexp',
    'iterator',
    'asynciterator',
  ]),
});

// collection types whose first type parameter is the element type
const SINGLE_ELEMENT_COLLECTIONS = new Set([
  'Array',
  'ReadonlyArray',
  'Set',
  'ReadonlySet',
  'Iterable',
  'IterableIterator',
  'Iterator',
  'AsyncIterable',
  'AsyncIterableIterator',
  'AsyncIterator',
  'Generator',
  'AsyncGenerator',
]);

function $Primitive(type) {
  this.type = type;
  this.constructor = null;
}

$Primitive.prototype.primitive = true;

function $Object(constructor) {
  this.type = 'object';
  this.constructor = constructor;
}

$Object.prototype.primitive = false;

function keyMatchesName(key, name) {
  return key?.type === 'Identifier' && key.name === name
    || key?.type === 'StringLiteral' && key.value === name;
}

function getKeyName(key) {
  if (key?.type === 'Identifier') return key.name;
  if (key?.type === 'StringLiteral') return key.value;
  return null;
}

function isMemberLike(path) {
  return path.isMemberExpression() || path.isOptionalMemberExpression();
}

// resolve variable references and unwrap transparent TS expression wrappers to reach the actual runtime value
// iterates: after unwrapping a TS wrapper, the underlying expression may be another variable reference
// `x as Type`, `x!`, `x satisfies Type`
function resolveRuntimeExpression(path) {
  let depth = MAX_DEPTH;
  while (depth--) {
    path = resolvePath(path);
    const { type } = path.node;
    if (type === 'TSAsExpression' || type === 'TSTypeAssertion' || type === 'TSSatisfiesExpression'
      || type === 'TSNonNullExpression' || type === 'TSInstantiationExpression'
      || type === 'TypeCastExpression') {
      path = path.get('expression');
    } else break;
  }
  return path;
}

function isRestBinding(elements, varName) {
  for (const element of elements) {
    if (element?.type === 'RestElement' && element.argument?.type === 'Identifier' && element.argument.name === varName) return true;
  }
  return false;
}

function unwrapTypeAnnotation(node) {
  if (!node) return null;
  if (node.type === 'TSTypeAnnotation' || node.type === 'TypeAnnotation') return unwrapTypeAnnotation(node.typeAnnotation);
  return node;
}

function typeRefName(node) {
  if (!node) return null;
  const id = node.type === 'TSTypeReference' ? node.typeName : node.type === 'GenericTypeAnnotation' ? node.id : null;
  return id?.type === 'Identifier' ? id.name : null;
}

// follow type alias chain: type A = type B = ... until non-alias or non-reference found
function followTypeAliasChain(node, scope) {
  let depth = MAX_DEPTH;
  node = unwrapTypeAnnotation(node);
  while (depth-- && (node?.type === 'TSTypeReference' || node?.type === 'GenericTypeAnnotation')) {
    const refName = typeRefName(node);
    if (!refName) break;
    const decl = findTypeDeclaration(refName, scope);
    if (decl?.type !== 'TSTypeAliasDeclaration') break;
    node = unwrapTypeAnnotation(decl.typeAnnotation);
  }
  return node;
}

function constantBindingPath(name, scope) {
  if (!scope) return null;
  const binding = scope.getBinding(name);
  return binding?.constant ? binding.path : null;
}

function resolveTypeQuery(node, scope) {
  const { exprName } = node;
  // typeof obj.prop - qualified name (one level deep)
  if (exprName?.type === 'TSQualifiedName') {
    const { left, right } = exprName;
    if (left.type !== 'Identifier' || right.type !== 'Identifier') return null;
    const bindingPath = constantBindingPath(left.name, scope);
    if (!bindingPath) return null;
    if (bindingPath.isVariableDeclarator()) {
      const init = resolveRuntimeExpression(bindingPath.get('init'));
      if (init.isObjectExpression()) return resolveObjectMember(init, right.name);
      if (init.isClass()) return resolveClassMember(init, right.name, true);
    }
    if (bindingPath.isClassDeclaration()) return resolveClassMember(bindingPath, right.name, true);
    const annotation = findBindingAnnotation(bindingPath);
    if (annotation) return resolveAnnotatedMember(annotation, right.name, scope);
    return null;
  }
  if (exprName?.type !== 'Identifier') return null;
  const bindingPath = constantBindingPath(exprName.name, scope);
  if (!bindingPath) return null;
  if (bindingPath.isVariableDeclarator()) {
    const annotation = bindingPath.node.id?.typeAnnotation;
    if (annotation) return resolveTypeAnnotation(annotation, scope);
    const init = bindingPath.get('init');
    if (init.node) return resolveNodeType(init);
  } else {
    const annotation = findBindingAnnotation(bindingPath);
    if (annotation) return resolveTypeAnnotation(annotation, scope);
  }
  if (bindingPath.isFunctionDeclaration() || bindingPath.isClassDeclaration()) return new $Object('Function');
  return null;
}

function findTypeDeclaration(name, scope) {
  if (!scope) return null;
  let currentScope = scope;
  while (currentScope) {
    const { block } = currentScope;
    const body = block.type === 'Program' ? block.body : block.body?.body;
    if (Array.isArray(body)) for (const stmt of body) {
      if (stmt.id?.name === name && (stmt.type === 'TSTypeAliasDeclaration' || stmt.type === 'TSInterfaceDeclaration')) return stmt;
    }
    currentScope = currentScope.parent;
  }
  return null;
}

function findTypeParameter(name, scope) {
  let currentScope = scope;
  while (currentScope) {
    const params = currentScope.block.typeParameters?.params;
    if (params) for (const param of params) {
      if (param.name === name) return { constraint: param.constraint, scope: currentScope };
    }
    currentScope = currentScope.parent;
  }
  return null;
}

function resolveKnownConstructor(name) {
  switch (name) {
    case 'Array':
    case 'AsyncDisposableStack':
    case 'BigInt':
    case 'Boolean':
    case 'Date':
    case 'DisposableStack':
    case 'DOMException':
    case 'Function':
    case 'Map':
    case 'Number':
    case 'Object':
    case 'Promise':
    case 'RegExp':
    case 'Set':
    case 'String':
    case 'Symbol':
    case 'URL':
    case 'URLSearchParams':
    case 'WeakMap':
    case 'WeakSet':
      return new $Object(name);
    case 'AggregateError':
    case 'Error':
    case 'EvalError':
    case 'RangeError':
    case 'ReferenceError':
    case 'SuppressedError':
    case 'SyntaxError':
    case 'TypeError':
    case 'URIError':
      return new $Object('Error');
    case 'BigInt64Array':
    case 'BigUint64Array':
    case 'Float16Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'Int8Array':
    case 'Int16Array':
    case 'Int32Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Uint16Array':
    case 'Uint32Array':
      return new $Object('TypedArray');
    case 'ReadonlyArray':
    case 'ReadonlyMap':
    case 'ReadonlySet':
      return new $Object(name.replace(/^Readonly/, ''));
  }
  return null;
}

function resolveUserDefinedType(name, scope, depth) {
  // type parameters shadow type declarations with the same name
  const typeParam = findTypeParameter(name, scope);
  if (typeParam) return typeParam.constraint ? resolveTypeAnnotation(typeParam.constraint, typeParam.scope, depth + 1) : null;
  const decl = findTypeDeclaration(name, scope);
  if (decl) {
    if (decl.type === 'TSTypeAliasDeclaration') return resolveTypeAnnotation(decl.typeAnnotation, scope, depth + 1);
    if (decl.type === 'TSInterfaceDeclaration') {
      const parents = decl.extends;
      if (parents?.length) {
        for (const parent of parents) {
          const base = parent.expression ?? parent;
          if (base.type !== 'Identifier') continue;
          const result = resolveKnownConstructor(base.name) || resolveUserDefinedType(base.name, scope, depth + 1);
          if (result) return result;
        }
      }
      return new $Object('Object');
    }
  }
  return null;
}

function getTypeMembers(objectType, scope, depth = 0) {
  if (depth > MAX_DEPTH) return null;
  if (objectType.type === 'TSTypeLiteral') return objectType.members;
  const name = typeRefName(objectType);
  const decl = name ? findTypeDeclaration(name, scope) : null;
  if (decl?.type === 'TSInterfaceDeclaration') {
    const own = decl.body?.body;
    // collect members from the extends chain
    const parents = decl.extends;
    if (!parents?.length) return own;
    const all = own ? [...own] : [];
    for (const parent of parents) {
      // TSExpressionWithTypeArguments has .expression (Identifier), wrap as TSTypeReference
      const expr = parent.expression ?? parent;
      const parentRef = expr.type === 'Identifier' ? { type: 'TSTypeReference', typeName: expr } : expr;
      const parentMembers = getTypeMembers(parentRef, scope, depth + 1);
      if (parentMembers) for (const m of parentMembers) all.push(m);
    }
    return all.length ? all : null;
  }
  if (decl?.type === 'TSTypeAliasDeclaration') return getTypeMembers(unwrapTypeAnnotation(decl.typeAnnotation), scope, depth + 1);
  return null;
}

function findTypeMember(objectType, key, scope) {
  const members = getTypeMembers(objectType, scope);
  if (!members) return null;
  let indexSignatureType = null;
  for (const member of members) {
    if (member.type === 'TSPropertySignature' || member.type === 'TSMethodSignature') {
      if (keyMatchesName(member.key, key)) {
        // TSMethodSignature as non-call property access: the member itself is a function
        return member.type === 'TSMethodSignature' ? { type: 'TSFunctionType' } : member.typeAnnotation;
      }
    } else if (!indexSignatureType && member.type === 'TSIndexSignature' && member.typeAnnotation) {
      indexSignatureType = member.typeAnnotation;
    }
  }
  return indexSignatureType;
}

function findTupleElement(objectType, index, scope) {
  const tuple = followTypeAliasChain(objectType, scope);
  if (tuple?.type !== 'TSTupleType') return null;
  const elements = tuple.elementTypes;
  if (!elements || index < 0 || index >= elements.length) return null;
  const element = elements[index];
  // named tuple member: [name: string, items: number[]]
  return element.type === 'TSNamedTupleMember' ? element.elementType : element;
}

function isAssignableTo(candidate, target) {
  if (typesEqual(candidate, target)) return true;
  // any non-primitive is assignable to Object
  if (!candidate.primitive && target.constructor === 'Object') return true;
  return false;
}

function resolveExtractExclude(first, second, scope, depth, keep) {
  const target = resolveTypeAnnotation(second, scope, depth + 1);
  if (!target) return null;
  const unwrapped = unwrapTypeAnnotation(first);
  if (!unwrapped) return null;
  const types = unwrapped.type === 'TSUnionType' || unwrapped.type === 'UnionTypeAnnotation' ? unwrapped.types : [unwrapped];
  let result = null;
  for (const member of types) {
    const resolved = resolveTypeAnnotation(member, scope, depth + 1);
    if (!resolved) return null;
    if (isAssignableTo(resolved, target) !== keep) continue;
    if (result && !typesEqual(result, resolved)) return null;
    result = resolved;
  }
  return result;
}

// resolve a member of an object/class binding to its runtime value path
function resolveMemberValuePath(bindingPath, name) {
  let containerPath;
  if (bindingPath.isVariableDeclarator()) {
    containerPath = resolveRuntimeExpression(bindingPath.get('init'));
  } else if (bindingPath.isClassDeclaration()) {
    containerPath = bindingPath;
  }
  if (!containerPath?.node) return null;
  if (containerPath.isObjectExpression()) {
    const prop = findObjectMember(containerPath, name);
    if (!prop) return null;
    if (prop.isObjectProperty()) return resolveRuntimeExpression(prop.get('value'));
    if (prop.isObjectMethod()) return prop;
  }
  if (containerPath.isClass()) {
    const member = findClassMember(containerPath, name, true);
    if (!member) return null;
    if (member.isClassMethod()) return member;
    if (member.isClassProperty() || member.isClassAccessorProperty()) {
      const value = member.get('value');
      return value.node ? resolveRuntimeExpression(value) : null;
    }
  }
  return null;
}

// resolve TSTypeQuery (typeof x or typeof x.y) to the runtime path of the target
function resolveTypeQueryBinding(param, scope) {
  if (param.type !== 'TSTypeQuery') return null;
  const { exprName } = param;
  if (exprName?.type === 'TSQualifiedName') {
    const { left, right } = exprName;
    if (left.type !== 'Identifier' || right.type !== 'Identifier') return null;
    const bindingPath = constantBindingPath(left.name, scope);
    return bindingPath ? resolveMemberValuePath(bindingPath, right.name) : null;
  }
  if (exprName?.type !== 'Identifier') return null;
  const bindingPath = constantBindingPath(exprName.name, scope);
  if (!bindingPath) return null;
  if (bindingPath.isFunctionDeclaration() || bindingPath.isClassDeclaration()) return bindingPath;
  if (bindingPath.isVariableDeclarator()) {
    const init = bindingPath.get('init');
    return init.node ? resolveRuntimeExpression(init) : null;
  }
  return null;
}

function resolveReturnTypeFromTypeQuery(param, scope) {
  const resolved = resolveTypeQueryBinding(param, scope);
  return resolved?.isFunction() ? resolveReturnType(resolved) : null;
}

function resolveNamedType(name, node, scope, depth) {
  const known = resolveKnownConstructor(name);
  if (known) return known;
  switch (name) {
    // well-known utility types -> Object
    case 'Record':
    case 'Partial':
    case 'Required':
    case 'Pick':
    case 'Omit':
    case 'Readonly':
      return new $Object('Object');
    // well-known utility types -> Array
    case 'Parameters':
    case 'ConstructorParameters':
      return new $Object('Array');
    // well-known utility types -> string
    case 'Uppercase':
    case 'Lowercase':
    case 'Capitalize':
    case 'Uncapitalize':
      return new $Primitive('string');
    // well-known utility types - resolve type parameter
    case 'NonNullable':
      return node.typeParameters?.params[0] ? resolveTypeAnnotation(node.typeParameters.params[0], scope, depth + 1) : null;
    case 'Awaited': {
      const param = node.typeParameters?.params[0];
      if (!param) return null;
      // unwrap Promise<T> -> resolve T
      if (typeRefName(param) === 'Promise') {
        const innerParam = param.typeParameters?.params[0];
        if (innerParam) return resolveTypeAnnotation(innerParam, scope, depth + 1);
      }
      return resolveTypeAnnotation(param, scope, depth + 1);
    }
    // well-known utility types - resolve via function return type
    case 'ReturnType':
      return node.typeParameters?.params[0] ? resolveReturnTypeFromTypeQuery(node.typeParameters.params[0], scope) : null;
    case 'InstanceType': {
      const param = node.typeParameters?.params[0];
      if (!param) return null;
      const resolved = resolveTypeQueryBinding(param, scope);
      if (resolved?.isClass()) return resolveClassInheritance(resolved) || new $Object('Object');
      return null;
    }
    case 'Extract':
    case 'Exclude': {
      const params = node.typeParameters?.params;
      return params?.length >= 2 ? resolveExtractExclude(params[0], params[1], scope, depth, name === 'Extract') : null;
    }
  }
  // resolve user-defined type aliases and interfaces via scope chain
  return resolveUserDefinedType(name, scope, depth);
}

function resolveTypeAnnotation(node, scope, depth = 0) {
  if (depth > MAX_DEPTH) return null;
  node = unwrapTypeAnnotation(node);
  if (!node) return null;
  switch (node.type) {
    // TS primitive keywords
    case 'TSStringKeyword':
    case 'StringTypeAnnotation':
      return new $Primitive('string');
    case 'TSNumberKeyword':
    case 'NumberTypeAnnotation':
      return new $Primitive('number');
    case 'TSBooleanKeyword':
    case 'BooleanTypeAnnotation':
      return new $Primitive('boolean');
    case 'TSBigIntKeyword':
    case 'BigIntTypeAnnotation':
      return new $Primitive('bigint');
    case 'TSSymbolKeyword':
    case 'SymbolTypeAnnotation':
      return new $Primitive('symbol');
    case 'TSVoidKeyword':
    case 'TSUndefinedKeyword':
    case 'VoidTypeAnnotation':
      return new $Primitive('undefined');
    case 'TSNullKeyword':
    case 'NullLiteralTypeAnnotation':
      return new $Primitive('null');
    case 'TSNeverKeyword':
    case 'EmptyTypeAnnotation':
      return new $Primitive('never');
    // TS / Flow object types
    case 'TSObjectKeyword':
    case 'TSTypeLiteral':
    case 'TSMappedType':
    case 'ObjectTypeAnnotation':
      return new $Object('Object');
    case 'TSArrayType':
    case 'TSTupleType':
    case 'ArrayTypeAnnotation':
    case 'TupleTypeAnnotation':
      return new $Object('Array');
    case 'TSFunctionType':
    case 'TSConstructorType':
    case 'FunctionTypeAnnotation':
      return new $Object('Function');
    // TS / Flow named types - only well-known built-ins and utility types
    case 'TSTypeReference':
    case 'GenericTypeAnnotation': {
      const name = typeRefName(node);
      if (name) return resolveNamedType(name, node, scope, depth);
      return null;
    }
    // transparent wrappers - unwrap and resolve the inner type
    case 'TSOptionalType':
    case 'TSParenthesizedType':
    case 'NullableTypeAnnotation':
      return resolveTypeAnnotation(node.typeAnnotation, scope, depth + 1);
    // TS type operator: `readonly T[]`, `unique symbol` - but NOT `keyof T`
    case 'TSTypeOperator':
      if (node.operator !== 'keyof') return resolveTypeAnnotation(node.typeAnnotation, scope, depth + 1);
      return null;
    // TS typeof in type position: `typeof variable`
    case 'TSTypeQuery':
      return resolveTypeQuery(node, scope);
    // TS template literal type: `prefix_${string}`
    case 'TSTemplateLiteralType':
      return new $Primitive('string');
    // TS type predicate: `x is string` -> boolean
    case 'TSTypePredicate':
      return new $Primitive('boolean');
    // TS conditional type: T extends U ? X : Y - resolve if both branches have the same type, or one is `never`
    case 'TSConditionalType':
      return resolveConditionalBranches(
        resolveTypeAnnotation(node.trueType, scope, depth + 1),
        resolveTypeAnnotation(node.falseType, scope, depth + 1));
    // TS / Flow union and intersection - resolve if all (non-nullable for unions) members have the same type
    case 'TSUnionType':
    case 'UnionTypeAnnotation':
    case 'TSIntersectionType':
    case 'IntersectionTypeAnnotation': {
      const { types } = node;
      if (!types || !types.length) return null;
      const isUnion = node.type === 'TSUnionType' || node.type === 'UnionTypeAnnotation';
      let result = null;
      for (const member of types) {
        const resolved = resolveTypeAnnotation(member, scope, depth + 1);
        if (!resolved) return null;
        // skip nullable / never types in unions: T | null | undefined | never -> T
        if (isUnion && isNullableOrNever(resolved)) continue;
        if (result && !typesEqual(result, resolved)) return null;
        result = resolved;
      }
      return result;
    }
    // TS literal types: 'hello', 42, true, etc.
    case 'TSLiteralType':
      if (node.literal) switch (node.literal.type) {
        case 'StringLiteral':
        case 'TemplateLiteral':
          return new $Primitive('string');
        case 'NumericLiteral':
          return new $Primitive('number');
        case 'BooleanLiteral':
          return new $Primitive('boolean');
        case 'BigIntLiteral':
          return new $Primitive('bigint');
        case 'UnaryExpression':
          return new $Primitive(node.literal.argument?.type === 'BigIntLiteral' ? 'bigint' : 'number');
      }
      return null;
    // TS indexed access type: Config["items"] or [string, number[]][1]
    case 'TSIndexedAccessType': {
      if (node.indexType?.type !== 'TSLiteralType') return null;
      const { literal } = node.indexType;
      let member;
      if (literal?.type === 'StringLiteral') member = findTypeMember(node.objectType, literal.value, scope);
      else if (literal?.type === 'NumericLiteral') member = findTupleElement(node.objectType, literal.value, scope);
      return member ? resolveTypeAnnotation(member, scope, depth + 1) : null;
    }
  }
  return null;
}

function resolvePath(path) {
  let depth = MAX_DEPTH;
  while (depth-- && path.isIdentifier()) {
    const binding = path.scope.getBinding(path.node.name);
    if (!binding || !binding.constant) break;
    const { path: bindingPath } = binding;
    if (bindingPath.isVariableDeclarator()) {
      // don't follow destructured bindings - the init is the whole collection, not the individual element
      const { id } = bindingPath.node;
      if (id?.type === 'ObjectPattern' || id?.type === 'ArrayPattern') break;
      const init = bindingPath.get('init');
      if (init.node) {
        path = init;
        continue;
      }
    }
    if (bindingPath.isFunctionDeclaration() || bindingPath.isClassDeclaration()) return bindingPath;
    break;
  }
  return path;
}

function resolveNumericType(path) {
  const resolved = resolveNodeType(path);
  // `number` if resolving is not possible - acceptable assumption within `core-js`
  return new $Primitive(resolved?.type === 'bigint' ? 'bigint' : 'number');
}

// resolve property name from a MemberExpression, handling both
// non-computed (obj.prop), string literal (obj['prop']),
// and constant binding (const key = 'prop'; obj[key])
function resolveMemberPropertyName(path) {
  const { property, computed } = path.node;
  if (!computed) return property.type === 'Identifier' ? property.name : null;
  if (property.type === 'StringLiteral') return property.value;
  const resolved = resolveRuntimeExpression(path.get('property'));
  return resolved.node?.type === 'StringLiteral' ? resolved.node.value : null;
}

function typesEqual(a, b) {
  return a.type === b.type && a.constructor === b.constructor;
}

function isNullableOrNever(resolved) {
  return resolved.type === 'null' || resolved.type === 'undefined' || resolved.type === 'never';
}

// resolve conditional type branches: if both match return that type, if one is `never` return the other
function resolveConditionalBranches(trueBranch, falseBranch) {
  if (trueBranch && falseBranch && typesEqual(trueBranch, falseBranch)) return trueBranch;
  if (trueBranch?.type === 'never') return falseBranch;
  if (falseBranch?.type === 'never') return trueBranch;
  return null;
}

function resolveUnionType(leftPath, rightPath) {
  const left = resolveNodeType(leftPath);
  const right = resolveNodeType(rightPath);
  if (left && right && typesEqual(left, right)) return left;
  return null;
}

function resolveBinaryOperatorType(operator, leftPath, rightPath) {
  switch (operator) {
    case '+': {
      const left = resolveNodeType(leftPath);
      const right = resolveNodeType(rightPath);
      if (left?.type === 'string' || right?.type === 'string') return new $Primitive('string');
      if (left?.type === 'number' && right?.type === 'number') return new $Primitive('number');
      if (left?.type === 'bigint' && right?.type === 'bigint') return new $Primitive('bigint');
      return new $Primitive(null);
    }
    // >>> (unsigned right shift) throws on BigInt, result is always Number
    case '>>>':
      return new $Primitive('number');
    // arithmetic and bitwise operators work on both Number and BigInt
    // mixing them throws, so knowing one operand's type determines the result
    case '-':
    case '*':
    case '/':
    case '%':
    case '**':
    case '|':
    case '&':
    case '^':
    case '<<':
    case '>>': {
      const left = resolveNodeType(leftPath);
      const right = resolveNodeType(rightPath);
      if (left?.type === 'bigint' || right?.type === 'bigint') return new $Primitive('bigint');
      // `number` if resolving is not possible - acceptable assumption within `core-js`
      return new $Primitive('number');
    }
  }
  return null;
}

function resolveGlobalName(path) {
  if (path.isIdentifier() && !path.scope.getBinding(path.node.name)) return path.node.name;
  if (!isMemberLike(path) || path.node.computed) return null;
  const object = path.get('object');
  if (!object.isIdentifier()) return null;
  const { name } = object.node;
  if (!POSSIBLE_GLOBAL_PROXIES.has(name)) return null;
  if (object.scope.getBinding(name)) return null;
  const property = path.get('property');
  return property.isIdentifier() ? property.node.name : null;
}

function resolveClassInheritance(classPath) {
  let current = classPath;
  let depth = MAX_DEPTH;
  while (depth--) {
    if (!current.node.superClass) return null;
    const superPath = current.get('superClass');
    const name = resolveGlobalName(superPath);
    if (name) return resolveKnownConstructor(name);
    current = resolveRuntimeExpression(superPath);
    if (!current.isClass()) return null;
  }
  return null;
}

function resolveNodeTypeExpression(path) {
  path = resolvePath(path);

  switch (path.node.type) {
    case 'Identifier':
      return resolveKnownGlobalReference(path);
    case 'NullLiteral':
      return new $Primitive('null');
    case 'StringLiteral':
    case 'TemplateLiteral':
      return new $Primitive('string');
    case 'NumericLiteral':
      return new $Primitive('number');
    case 'BigIntLiteral':
      return new $Primitive('bigint');
    case 'BooleanLiteral':
      return new $Primitive('boolean');
    case 'RegExpLiteral':
      return new $Object('RegExp');
    case 'ObjectExpression':
      return new $Object('Object');
    case 'ArrayExpression':
      return new $Object('Array');
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
    case 'FunctionDeclaration':
    case 'ClassExpression':
    case 'ClassDeclaration':
      return new $Object('Function');
    case 'NewExpression': {
      const callee = path.get('callee');
      const name = resolveGlobalName(callee);
      if (name) {
        if (name === 'Object') return new $Object(null);
        return resolveKnownConstructor(name) || new $Object(name);
      }
      {
        const resolved = resolveRuntimeExpression(callee);
        if (resolved.isClass()) return resolveClassInheritance(resolved) || new $Object('Object');
      }
      return new $Object(null);
    }
    case 'MemberExpression':
    case 'OptionalMemberExpression':
      return resolveFromMemberExpression(path)
        || resolveArrayIndexAccess(path)
        || resolveKnownPropertyReturnType(path)
        || resolveGlobalStaticReference(path)
        || resolveKnownGlobalReference(path);
    case 'CallExpression':
    case 'OptionalCallExpression': {
      const callee = path.get('callee');
      const name = resolveGlobalName(callee);
      if (name) {
        switch (name) {
          case 'String':
          case 'Number':
          case 'Boolean':
          case 'BigInt':
          case 'Symbol':
            return new $Primitive(name.toLowerCase());
          case 'Object':
            return new $Object(null);
        }
        // constructors like Array, RegExp, Error, Function, etc. work without `new`
        const known = resolveKnownConstructor(name);
        if (known) return known;
        // known global function: parseInt(), parseFloat(), etc.
        if (hasOwn(KNOWN_GLOBAL_METHOD_RETURN_TYPES, name)) return typeFromHint(KNOWN_GLOBAL_METHOD_RETURN_TYPES[name]);
      }
      if (callee.isImport()) return new $Object('Promise');
      return resolveCallReturnType(callee);
    }
    // tagged templates are semantically calls: String.raw`foo` ≡ String.raw(…)
    case 'TaggedTemplateExpression':
      return resolveCallReturnType(path.get('tag'));
    case 'UnaryExpression':
      switch (path.node.operator) {
        case 'void':
          return new $Primitive('undefined');
        case 'typeof':
          return new $Primitive('string');
        case '!':
        case 'delete':
          return new $Primitive('boolean');
        // unary + throws on BigInt, result is always Number
        case '+':
          return new $Primitive('number');
        // unary - and ~ work on both Number and BigInt, preserving the type
        case '-':
        case '~':
          return resolveNumericType(path.get('argument'));
      }
      return null;
    case 'UpdateExpression':
      // ++ and -- work on both Number and BigInt, preserving the type
      return resolveNumericType(path.get('argument'));
    case 'BinaryExpression':
      switch (path.node.operator) {
        case '==':
        case '!=':
        case '===':
        case '!==':
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
        case 'in':
          return new $Primitive('boolean');
        default:
          return resolveBinaryOperatorType(path.node.operator, path.get('left'), path.get('right'));
      }
    case 'SequenceExpression': {
      const expressions = path.get('expressions');
      if (expressions.length) return resolveNodeType(expressions[expressions.length - 1]);
      return null;
    }
    case 'AssignmentExpression':
      switch (path.node.operator) {
        case '=':
          return resolveNodeType(path.get('right'));
        case '||=':
        case '&&=':
        case '??=':
          return resolveUnionType(path.get('left'), path.get('right'));
        default:
          return resolveBinaryOperatorType(path.node.operator.slice(0, -1), path.get('left'), path.get('right'));
      }
    case 'ConditionalExpression':
      return resolveUnionType(path.get('consequent'), path.get('alternate'));
    case 'LogicalExpression':
      return resolveUnionType(path.get('left'), path.get('right'));
    case 'ParenthesizedExpression':
      return resolveNodeType(path.get('expression'));
    case 'TSAsExpression':
    case 'TSTypeAssertion':
    case 'TypeCastExpression':
      return resolveTypeAnnotation(path.node.typeAnnotation, path.scope) || resolveNodeType(path.get('expression'));
    case 'TSSatisfiesExpression':
      return resolveNodeType(path.get('expression')) || resolveTypeAnnotation(path.node.typeAnnotation, path.scope);
    case 'TSNonNullExpression':
    case 'TSInstantiationExpression':
      return resolveNodeType(path.get('expression'));
    case 'AwaitExpression': {
      const argument = path.get('argument');
      const type = resolveNodeType(argument);
      // await on non-Promise value returns the value type unchanged
      if (type && type.constructor !== 'Promise') return type;
      // try to unwrap Promise<T> from type annotation on the awaited expression
      const annotationInfo = findExpressionAnnotation(argument);
      if (annotationInfo) {
        const annotation = unwrapTypeAnnotation(annotationInfo.annotation);
        if (annotation && typeRefName(annotation) === 'Promise') {
          const inner = annotation.typeParameters?.params[0];
          if (inner) return resolveTypeAnnotation(inner, annotationInfo.scope);
        }
      }
      return null;
    }
  }
  return null;
}

// resolve parameter type from call-site argument, default value, or rest-element shape
function resolveParamType(binding, fnPath, callPath) {
  const { params } = fnPath.node;
  const args = callPath.get('arguments');
  for (let i = 0; i < params.length; i++) {
    if (params[i].type === 'RestElement') {
      if (params[i] === binding.path.node) return new $Object('Array');
      continue;
    }
    if (params[i] !== binding.path.node) continue;
    // argument provided at call site - resolve its type
    if (i < args.length) return resolveNodeType(args[i]);
    // no argument - resolve from the default value
    if (params[i].type === 'AssignmentPattern') return resolveNodeType(fnPath.get('params')[i].get('right'));
    return null;
  }
  return null;
}

// resolve expression type within a function body, with fallback to call-site parameter inference
function resolveBodyExpr(path, fnPath, callPath) {
  const type = resolveNodeType(path);
  if (type) return type;
  if (!callPath) return null;
  const resolved = resolvePath(path);
  if (!resolved.isIdentifier()) return null;
  const binding = resolved.scope.getBinding(resolved.node.name);
  if (!binding || !binding.constant) return null;
  return resolveParamType(binding, fnPath, callPath);
}

function resolveBodyReturnType(fnPath, callPath) {
  const body = fnPath.get('body');
  // arrow with expression body: () => [1, 2, 3]
  if (!body.isBlockStatement()) return resolveBodyExpr(body, fnPath, callPath);
  // block body: traverse all return statements, skip nested functions
  let result = null;
  let resolved = true;
  body.traverse({
    ReturnStatement(returnPath) {
      if (!resolved) return;
      const arg = returnPath.get('argument');
      const type = arg.node ? resolveBodyExpr(arg, fnPath, callPath) : new $Primitive('undefined');
      if (!type || (result && !typesEqual(result, type))) {
        resolved = false;
        returnPath.stop();
        return;
      }
      result = type;
    },
    Function(innerPath) {
      innerPath.skip();
    },
  });
  return resolved ? (result ?? new $Primitive('undefined')) : null;
}

// check whether a type annotation AST node references any type parameter from the given set
function hasTypeParamReference(node, typeParamNames, depth) {
  if (depth > MAX_DEPTH) return false;
  node = unwrapTypeAnnotation(node);
  if (!node) return false;
  switch (node.type) {
    case 'TSTypeReference':
    case 'GenericTypeAnnotation': {
      const name = typeRefName(node);
      if (name && typeParamNames.has(name)) return true;
      const params = node.typeParameters?.params;
      if (params) for (const param of params) {
        if (hasTypeParamReference(param, typeParamNames, depth + 1)) return true;
      }
      return false;
    }
    case 'TSArrayType':
    case 'ArrayTypeAnnotation':
      return hasTypeParamReference(node.elementType, typeParamNames, depth + 1);
    case 'TSUnionType':
    case 'UnionTypeAnnotation':
    case 'TSIntersectionType':
    case 'IntersectionTypeAnnotation':
      for (const member of node.types) {
        if (hasTypeParamReference(member, typeParamNames, depth + 1)) return true;
      }
      return false;
    case 'TSTupleType':
    case 'TupleTypeAnnotation':
      for (const elem of node.elementTypes || []) {
        const actual = elem.type === 'TSNamedTupleMember' ? elem.elementType : elem;
        if (hasTypeParamReference(actual, typeParamNames, depth + 1)) return true;
      }
      return false;
    case 'TSConditionalType':
      return hasTypeParamReference(node.trueType, typeParamNames, depth + 1)
        || hasTypeParamReference(node.falseType, typeParamNames, depth + 1);
    case 'TSTypeOperator':
    case 'TSOptionalType':
    case 'TSParenthesizedType':
    case 'NullableTypeAnnotation':
      return hasTypeParamReference(node.typeAnnotation, typeParamNames, depth + 1);
  }
  return false;
}

// extract type parameter name from an array annotation: T[] → T, Array<T> → T, ReadonlyArray<T> → T
function arrayElementTypeParamName(annotation, refName) {
  if (annotation.type === 'TSArrayType' || annotation.type === 'ArrayTypeAnnotation') {
    return typeRefName(annotation.elementType);
  }
  if (refName === 'Array' || refName === 'ReadonlyArray') {
    const typeArgs = annotation.typeParameters?.params;
    if (typeArgs?.length === 1) return typeRefName(typeArgs[0]);
  }
  return null;
}

// build a Map<string, Type> of type parameter bindings from call-site arguments
function buildTypeParamMap(typeParamNames, fnPath, callPath) {
  const typeParamMap = new Map();
  const args = callPath.get('arguments');
  const { params } = fnPath.node;
  // phase 1: match param annotations against type parameter names
  for (let i = 0; i < params.length && i < args.length; i++) {
    if (params[i].type === 'RestElement') continue;
    const param = params[i].type === 'AssignmentPattern' ? params[i].left : params[i];
    const paramAnnotation = unwrapTypeAnnotation(param.typeAnnotation);
    if (!paramAnnotation) continue;
    const name = typeRefName(paramAnnotation);
    // direct: param type is exactly T
    if (name && typeParamNames.has(name) && !typeParamMap.has(name)) {
      const resolved = resolveNodeType(args[i]);
      if (resolved) typeParamMap.set(name, resolved);
      continue;
    }
    // array wrapper: param type is T[] or Array<T> / ReadonlyArray<T>
    const elemParamName = arrayElementTypeParamName(paramAnnotation, name);
    if (elemParamName && typeParamNames.has(elemParamName) && !typeParamMap.has(elemParamName)) {
      const argPath = resolveRuntimeExpression(args[i]);
      if (argPath.isArrayExpression()) {
        const elementType = resolveArrayLiteralCommonType(argPath);
        if (elementType) typeParamMap.set(elemParamName, elementType);
      }
    }
  }
  // phase 2: constraint fallback for unresolved type params
  for (const tp of fnPath.node.typeParameters.params) {
    if (typeParamMap.has(tp.name)) continue;
    if (tp.constraint) {
      const resolved = resolveTypeAnnotation(tp.constraint, fnPath.scope);
      if (resolved) typeParamMap.set(tp.name, resolved);
    }
  }
  return typeParamMap;
}

// resolve a type annotation substituting type parameters from the map
function substituteTypeParams(node, typeParamMap, scope, depth) {
  if (depth > MAX_DEPTH) return null;
  node = unwrapTypeAnnotation(node);
  if (!node) return null;
  // direct type parameter reference
  if (node.type === 'TSTypeReference' || node.type === 'GenericTypeAnnotation') {
    const name = typeRefName(node);
    if (name && typeParamMap.has(name)) return typeParamMap.get(name);
    if (name) return resolveNamedType(name, node, scope, depth);
    return null;
  }
  // union: T | null, T | undefined - strip nullable, substitute T
  if (node.type === 'TSUnionType' || node.type === 'UnionTypeAnnotation') {
    let result = null;
    for (const member of node.types) {
      const resolved = substituteTypeParams(member, typeParamMap, scope, depth + 1);
      if (!resolved) return null;
      if (isNullableOrNever(resolved)) continue;
      if (result && !typesEqual(result, resolved)) return null;
      result = resolved;
    }
    return result;
  }
  // intersection: T & { extra: boolean } - skip plain $Object('Object') from type literals, rest must agree
  if (node.type === 'TSIntersectionType' || node.type === 'IntersectionTypeAnnotation') {
    let result = null;
    for (const member of node.types) {
      const resolved = substituteTypeParams(member, typeParamMap, scope, depth + 1);
      if (!resolved) continue;
      // skip structural additions like { key: value } that resolve to plain Object
      if (!resolved.primitive && resolved.constructor === 'Object') continue;
      if (result && !typesEqual(result, resolved)) return null;
      result = resolved;
    }
    return result;
  }
  // transparent wrappers: (T), T?, readonly T[], etc.
  if (node.type === 'TSOptionalType' || node.type === 'TSParenthesizedType' || node.type === 'NullableTypeAnnotation'
    || (node.type === 'TSTypeOperator' && node.operator !== 'keyof')) {
    return substituteTypeParams(node.typeAnnotation, typeParamMap, scope, depth + 1);
  }
  // conditional type: T extends U ? X : Y - substitute in branches
  if (node.type === 'TSConditionalType') {
    return resolveConditionalBranches(
      substituteTypeParams(node.trueType, typeParamMap, scope, depth + 1),
      substituteTypeParams(node.falseType, typeParamMap, scope, depth + 1));
  }
  // T[] or [T, U] - resolve to Array regardless of element type
  if (node.type === 'TSArrayType' || node.type === 'TSTupleType'
    || node.type === 'ArrayTypeAnnotation' || node.type === 'TupleTypeAnnotation') return new $Object('Array');
  // function type: (x: T) => R - always Function regardless of type parameters
  if (node.type === 'TSFunctionType' || node.type === 'FunctionTypeAnnotation') return new $Object('Function');
  // mapped type: { [K in keyof T]: V } - always Object
  if (node.type === 'TSMappedType') return new $Object('Object');
  // fallback to regular annotation resolution
  return resolveTypeAnnotation(node, scope, depth);
}

// resolve return type of a function, inferring generic type parameters from call-site arguments
function resolveReturnType(fnPath, callPath) {
  // generator functions return iterators, async generators return async iterators
  if (fnPath.node.generator) return new $Object(fnPath.node.async ? 'AsyncIterator' : 'Iterator');
  const { returnType, typeParameters } = fnPath.node;
  // infer generic type parameters and substitute into return type
  if (returnType && callPath && typeParameters?.params?.length) {
    const returnAnnotation = unwrapTypeAnnotation(returnType);
    const typeParamNames = new Set();
    for (const p of typeParameters.params) typeParamNames.add(p.name);
    if (hasTypeParamReference(returnAnnotation, typeParamNames, 0)) {
      const typeParamMap = buildTypeParamMap(typeParamNames, fnPath, callPath);
      if (typeParamMap.size > 0) {
        const substituted = substituteTypeParams(returnAnnotation, typeParamMap, fnPath.scope, 0);
        if (substituted) return substituted;
      }
    }
  }
  // try return type annotation
  if (returnType) {
    const resolved = resolveTypeAnnotation(returnType, fnPath.scope);
    if (resolved) return resolved;
  }
  // fallback: analyze return statements in the function body
  const bodyType = resolveBodyReturnType(fnPath, callPath);
  // async functions wrap the body return type in Promise
  if (bodyType && fnPath.node.async && bodyType.constructor !== 'Promise') return new $Object('Promise');
  return bodyType;
}

// resolve `this` to the enclosing class context
function resolveThisClass(path) {
  let current = path;
  while (current = current.parentPath) {
    // direct child of ClassBody - this is a class member
    if (current.parentPath?.isClassBody()) {
      const classPath = current.parentPath.parentPath;
      if (classPath?.isClass()) return { classPath, isStatic: !!current.node.static };
      return null;
    }
    // non-arrow function rebinds `this`
    if (current.isFunction() && !current.isArrowFunctionExpression()) return null;
  }
  return null;
}

function resolveClassContext(objectPath) {
  // Foo.staticProp - object is the class itself
  if (objectPath.isClass()) return { classPath: objectPath, isStatic: true };
  // new Foo().prop - object is a class instance
  if (objectPath.isNewExpression()) {
    const cls = resolveRuntimeExpression(objectPath.get('callee'));
    if (cls.isClass()) return { classPath: cls, isStatic: false };
  }
  // this.prop inside a class member
  if (objectPath.isThisExpression()) return resolveThisClass(objectPath);
  return null;
}

function findClassMember(classPath, name, isStatic, depth = 0) {
  if (depth > MAX_DEPTH) return null;
  for (const member of classPath.get('body').get('body')) {
    if (!keyMatchesName(member.node.key, name)) continue;
    if (!!member.node.static !== isStatic) continue;
    return member;
  }
  const superClass = classPath.get('superClass');
  if (superClass.node) {
    const resolved = resolveRuntimeExpression(superClass);
    if (resolved.isClass()) return findClassMember(resolved, name, isStatic, depth + 1);
  }
  return null;
}

function resolveClassMember(classPath, name, isStatic, callPath) {
  const member = findClassMember(classPath, name, isStatic);
  if (!member) return null;
  // method call: foo.bar()
  if (callPath) {
    if (member.isClassMethod()) return resolveReturnType(member, callPath);
    if (member.isClassProperty() || member.isClassAccessorProperty()) {
      const value = resolveRuntimeExpression(member.get('value'));
      if (value.node && value.isFunction()) return resolveReturnType(value, callPath);
    }
    return null;
  }
  // property access: foo.bar
  if (member.isClassProperty() || member.isClassAccessorProperty()) {
    if (member.node.typeAnnotation) return resolveTypeAnnotation(member.node.typeAnnotation, member.scope);
    const value = member.get('value');
    return value.node ? resolveNodeType(value) : null;
  }
  // method: getter returns its return type, regular method returns Function
  if (member.isClassMethod()) return member.node.kind === 'get' ? resolveReturnType(member) : new $Object('Function');
  return null;
}

function findObjectMember(objectPath, name) {
  for (const prop of objectPath.get('properties')) {
    if (keyMatchesName(prop.node.key, name)) return prop;
  }
  return null;
}

function resolveObjectMember(objectPath, name, callPath) {
  const prop = findObjectMember(objectPath, name);
  if (!prop) return null;
  // method call: obj.foo()
  if (callPath) {
    if (prop.isObjectMethod()) return resolveReturnType(prop, callPath);
    if (prop.isObjectProperty()) {
      const value = resolveRuntimeExpression(prop.get('value'));
      if (value.isFunction()) return resolveReturnType(value, callPath);
    }
    return null;
  }
  // property access: obj.foo
  if (prop.isObjectProperty()) return resolveNodeType(prop.get('value'));
  // method: getter returns its return type, regular method returns Function
  if (prop.isObjectMethod()) return prop.node.kind === 'get' ? resolveReturnType(prop) : new $Object('Function');
  return null;
}

function resolveTypedMember(objectPath, name, callPath) {
  if (!objectPath.isIdentifier()) return null;
  const binding = objectPath.scope.getBinding(objectPath.node.name);
  if (!binding) return null;
  const { path: bindingPath } = binding;
  const annotation = unwrapTypeAnnotation(findBindingAnnotation(bindingPath));
  if (!annotation) return null;
  const { scope } = bindingPath;
  if (!callPath) {
    const memberType = findTypeMember(annotation, name, scope);
    return memberType ? resolveTypeAnnotation(memberType, scope) : null;
  }
  const members = getTypeMembers(annotation, scope);
  if (!members) return null;
  for (const member of members) {
    if (!keyMatchesName(member.key, name)) continue;
    if (member.type === 'TSMethodSignature') return resolveTypeAnnotation(member.typeAnnotation, scope);
    if (member.type === 'TSPropertySignature') {
      const fnType = unwrapTypeAnnotation(member.typeAnnotation);
      if (fnType?.type === 'TSFunctionType') return resolveTypeAnnotation(fnType.typeAnnotation, scope);
    }
  }
  return null;
}

function resolveFromMemberExpression(path, callPath) {
  const name = resolveMemberPropertyName(path);
  if (!name) return null;
  const originalObjectPath = path.get('object');
  const objectPath = resolveRuntimeExpression(originalObjectPath);
  if (objectPath.isObjectExpression()) {
    const result = resolveObjectMember(objectPath, name, callPath);
    if (result) return result;
  }
  const ctx = resolveClassContext(objectPath);
  if (ctx) return resolveClassMember(ctx.classPath, name, ctx.isStatic, callPath);
  // try typed member on resolved path first, then on original path (in case resolvePath lost annotation)
  return resolveTypedMember(objectPath, name, callPath)
    || (objectPath !== originalObjectPath ? resolveTypedMember(originalObjectPath, name, callPath) : null);
}

// arr[0], arr[1] - numeric index access on array literals
function resolveArrayIndexAccess(path) {
  if (!path.node.computed) return null;
  const resolvedProp = resolveRuntimeExpression(path.get('property'));
  if (resolvedProp.node?.type !== 'NumericLiteral') return null;
  const index = resolvedProp.node.value;
  if (!Number.isInteger(index) || index < 0) return null;
  const objectPath = resolveRuntimeExpression(path.get('object'));
  if (!objectPath.isArrayExpression()) return null;
  return resolveArrayLiteralElement(objectPath, index);
}

function typeFromHint(hint) {
  if (PRIMITIVES.has(hint)) return new $Primitive(hint);
  return new $Object(hint);
}

// two-level table lookup: table[key1][key2]
function lookupNested(table, key1, key2) {
  const group = hasOwn(table, key1) ? table[key1] : null;
  return group && hasOwn(group, key2) ? group[key2] : null;
}

// resolve the global object name and property name from a MemberExpression
function resolveGlobalMember(path) {
  const memberName = resolveMemberPropertyName(path);
  if (!memberName) return null;
  const objectName = resolveGlobalName(path.get('object'));
  return objectName ? { objectName, memberName } : null;
}

// resolve return type of a known instance member (method or property) from a lookup table
function resolveKnownInstanceMember(path, table) {
  const name = resolveMemberPropertyName(path);
  if (!name) return null;
  const objectType = resolveNodeType(path.get('object'));
  if (!objectType) return null;
  const key = objectType.primitive ? (PRIMITIVE_WRAPPERS[objectType.type] || null) : objectType.constructor;
  if (!key) return null;
  const hint = lookupNested(table, key, name);
  return hint ? typeFromHint(hint) : null;
}

function resolveKnownStaticReturnType(callee) {
  if (!isMemberLike(callee)) return null;
  const info = resolveGlobalMember(callee);
  if (!info) return null;
  const hint = lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, info.objectName, info.memberName);
  return hint ? typeFromHint(hint) : null;
}

function resolveKnownMethodReturnType(callee) {
  return resolveKnownInstanceMember(callee, KNOWN_INSTANCE_METHOD_RETURN_TYPES);
}

function resolveKnownPropertyReturnType(path) {
  return resolveKnownInstanceMember(path, KNOWN_INSTANCE_PROPERTY_RETURN_TYPES);
}

// resolve type of a known global static member (e.g. Math.PI, Number.MAX_SAFE_INTEGER, Math.max)
// static properties return their known type, static methods return Function
function resolveGlobalStaticReference(path) {
  const info = resolveGlobalMember(path);
  if (!info) return null;
  const { objectName, memberName } = info;
  const propHint = lookupNested(KNOWN_STATIC_PROPERTY_RETURN_TYPES, objectName, memberName);
  if (propHint) return typeFromHint(propHint);
  return lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, objectName, memberName) ? new $Object('Function') : null;
}

// resolve type of a global property or method accessed through a global proxy
// e.g. globalThis.NaN -> number, window.parseInt -> Function
function resolveKnownGlobalReference(path) {
  const name = resolveGlobalName(path);
  if (!name) return null;
  if (hasOwn(KNOWN_GLOBAL_PROPERTY_RETURN_TYPES, name)) return typeFromHint(KNOWN_GLOBAL_PROPERTY_RETURN_TYPES[name]);
  if (hasOwn(KNOWN_GLOBAL_METHOD_RETURN_TYPES, name)) return new $Object('Function');
  return null;
}

function resolveMemberCallType(memberPath, callPath) {
  return resolveFromMemberExpression(memberPath, callPath)
    || resolveKnownStaticReturnType(memberPath)
    || resolveKnownMethodReturnType(memberPath);
}

function resolveCallReturnType(callee) {
  // method call: obj.method() or obj?.method()
  if (isMemberLike(callee)) return resolveMemberCallType(callee, callee.parentPath);
  // direct call: foo() - or IIFE: (() => expr)()
  const resolved = resolveRuntimeExpression(callee);
  if (resolved.isFunction()) return resolveReturnType(resolved, callee.parentPath);
  // indirect call: const fn = obj.method; fn() - resolve through the stored member reference
  if (isMemberLike(resolved)) return resolveMemberCallType(resolved, callee.parentPath);
  return null;
}

// find the original property key name for a destructured variable
// e.g. const { foo: bar } = obj -> findDestructuredKeyName(pattern, 'bar') -> 'foo'
// e.g. const { foo } = obj -> findDestructuredKeyName(pattern, 'foo') -> 'foo'
function findDestructuredKeyName(objectPattern, name) {
  for (const prop of objectPattern.properties) {
    if (prop.type !== 'ObjectProperty') continue;
    const value = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
    if (value?.type === 'Identifier' && value.name === name) return getKeyName(prop.key);
  }
  return null;
}

function resolveDestructuredType(objectPattern, name, scope) {
  const keyName = findDestructuredKeyName(objectPattern, name);
  if (!keyName) return null;
  // TS: TSTypeLiteral or TSTypeReference (interface/type alias)
  const result = resolveAnnotatedMember(objectPattern.typeAnnotation, keyName, scope);
  if (result) return result;
  // Flow: ObjectTypeAnnotation.properties
  const type = unwrapTypeAnnotation(objectPattern.typeAnnotation);
  if (type?.type === 'ObjectTypeAnnotation') {
    for (const member of type.properties) {
      if (!keyMatchesName(member.key, keyName)) continue;
      return resolveTypeAnnotation(member.value, scope);
    }
  }
  return null;
}

// resolve the element type of a collection from its type annotation
function resolveElementType(node, scope, depth) {
  if (depth > MAX_DEPTH) return null;
  node = unwrapTypeAnnotation(node);
  if (!node) return null;
  switch (node.type) {
    // string[] -> element type
    case 'TSArrayType':
    case 'ArrayTypeAnnotation':
      return resolveTypeAnnotation(node.elementType, scope, depth + 1);
    // [string, number] -> common element type if all same
    case 'TSTupleType':
    case 'TupleTypeAnnotation': {
      const elements = node.elementTypes;
      if (!elements?.length) return null;
      let result = null;
      for (const elem of elements) {
        const actual = elem.type === 'TSNamedTupleMember' ? elem.elementType : elem;
        const resolved = resolveTypeAnnotation(actual, scope, depth + 1);
        if (!resolved) return null;
        if (isNullableOrNever(resolved)) continue;
        if (result && !typesEqual(result, resolved)) return null;
        result = resolved;
      }
      return result;
    }
    // Array<T>, Set<T>, Map<K,V>, Iterable<T>, Generator<T>, user type aliases
    case 'TSTypeReference':
    case 'GenericTypeAnnotation': {
      const name = typeRefName(node);
      if (!name) return null;
      const params = node.typeParameters?.params;
      if (SINGLE_ELEMENT_COLLECTIONS.has(name)) return params?.[0] ? resolveTypeAnnotation(params[0], scope, depth + 1) : null;
      if (name === 'Map' || name === 'ReadonlyMap') return new $Object('Array');
      return resolveUserTypeElement(name, scope, depth, resolveElementType);
    }
    // iterating a string yields characters (strings)
    case 'TSStringKeyword':
    case 'StringTypeAnnotation':
      return new $Primitive('string');
    // union: strip null/undefined, check remaining
    case 'TSUnionType':
    case 'UnionTypeAnnotation': {
      const { types } = node;
      if (!types?.length) return null;
      let result = null;
      for (const member of types) {
        const resolved = resolveTypeAnnotation(member, scope, depth + 1);
        if (resolved && isNullableOrNever(resolved)) continue;
        const elemType = resolveElementType(member, scope, depth + 1);
        if (!elemType) return null;
        if (result && !typesEqual(result, elemType)) return null;
        result = elemType;
      }
      return result;
    }
    // transparent wrappers: readonly T[], (T[])
    case 'TSTypeOperator':
      return node.operator !== 'keyof' ? resolveElementType(node.typeAnnotation, scope, depth + 1) : null;
    case 'TSOptionalType':
    case 'TSParenthesizedType':
    case 'NullableTypeAnnotation':
      return resolveElementType(node.typeAnnotation, scope, depth + 1);
  }
  return null;
}

// follow user-defined type aliases and interface extends chain using a parameterized resolver
function resolveUserTypeElement(name, scope, depth, resolver) {
  const decl = findTypeDeclaration(name, scope);
  if (decl?.type === 'TSTypeAliasDeclaration') return resolver(decl.typeAnnotation, scope, depth + 1);
  if (decl?.type !== 'TSInterfaceDeclaration' || !decl.extends?.length) return null;
  for (const parent of decl.extends) {
    const expr = parent.expression ?? parent;
    if (expr.type !== 'Identifier') continue;
    const parentRef = { type: 'TSTypeReference', typeName: expr, typeParameters: parent.typeParameters };
    const result = resolver(parentRef, scope, depth + 1);
    if (result) return result;
  }
  return null;
}

// extract the raw element annotation node (not resolved) from a collection type
function extractElementAnnotation(node, scope, depth) {
  if (depth > MAX_DEPTH) return null;
  node = unwrapTypeAnnotation(node);
  if (!node) return null;
  switch (node.type) {
    case 'TSArrayType':
    case 'ArrayTypeAnnotation':
      return node.elementType;
    case 'TSTypeReference':
    case 'GenericTypeAnnotation': {
      const name = typeRefName(node);
      if (!name) return null;
      if (SINGLE_ELEMENT_COLLECTIONS.has(name)) return node.typeParameters?.params[0] ?? null;
      return resolveUserTypeElement(name, scope, depth, extractElementAnnotation);
    }
    case 'TSTypeOperator':
      return node.operator !== 'keyof' ? extractElementAnnotation(node.typeAnnotation, scope, depth + 1) : null;
    case 'TSOptionalType':
    case 'TSParenthesizedType':
    case 'NullableTypeAnnotation':
      return extractElementAnnotation(node.typeAnnotation, scope, depth + 1);
    case 'TSUnionType':
    case 'UnionTypeAnnotation': {
      const { types } = node;
      if (!types?.length) return null;
      let result = null;
      for (const member of types) {
        const resolved = resolveTypeAnnotation(member, scope, depth + 1);
        if (resolved && isNullableOrNever(resolved)) continue;
        if (result) return null; // multiple non-null collection members -> ambiguous
        result = extractElementAnnotation(member, scope, depth + 1);
        if (!result) return null;
      }
      return result;
    }
  }
  return null;
}

// resolve the type of a variable destructured from an ArrayPattern
function resolveArrayPatternBinding(arrayPattern, varName, annotation, scope) {
  const index = findPatternIndex(arrayPattern, varName);
  if (index < 0) return null;
  const unwrapped = unwrapTypeAnnotation(annotation);
  if (!unwrapped) return null;
  const tupleElem = findTupleElement(unwrapped, index, scope);
  if (tupleElem) return resolveTypeAnnotation(tupleElem, scope);
  return resolveElementType(unwrapped, scope, 0);
}

// find the raw type annotation of an expression (follows bindings and const chains)
function findExpressionAnnotation(path, depth = 0) {
  if (depth > MAX_DEPTH) return null;
  if (path.node.type === 'TSAsExpression' || path.node.type === 'TSSatisfiesExpression'
    || path.node.type === 'TSTypeAssertion' || path.node.type === 'TypeCastExpression') {
    return { annotation: path.node.typeAnnotation, scope: path.scope };
  }
  if (path.node.type === 'TSNonNullExpression' || path.node.type === 'TSInstantiationExpression') {
    return findExpressionAnnotation(path.get('expression'), depth + 1);
  }
  if (path.isIdentifier()) {
    const binding = path.scope.getBinding(path.node.name);
    if (!binding) return null;
    const annotation = findBindingAnnotation(binding.path);
    if (annotation) return { annotation, scope: binding.path.scope };
    if (binding.constant && binding.path.isVariableDeclarator()) {
      const init = binding.path.get('init');
      if (init.node) return findExpressionAnnotation(init, depth + 1);
    }
  }
  return null;
}

// traverse from a binding to its enclosing for-in/for-of statement (if any)
// binding must be a VariableDeclarator without init, declared in the loop header
function findForLoopParent(bindingPath) {
  if (!bindingPath.isVariableDeclarator() || bindingPath.node.init) return null;
  const declarationPath = bindingPath.parentPath;
  if (!declarationPath?.isVariableDeclaration()) return null;
  const forPath = declarationPath.parentPath;
  if (!forPath || forPath.node.left !== declarationPath.node) return null;
  return forPath;
}

// find the index of a variable in an ArrayPattern, accounting for holes and defaults
function findPatternIndex(arrayPattern, varName) {
  const { elements } = arrayPattern;
  if (!elements) return -1;
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (!element || element.type === 'RestElement') continue;
    const id = element.type === 'AssignmentPattern' ? element.left : element;
    if (id?.type === 'Identifier' && id.name === varName) return i;
  }
  return -1;
}

// resolve the type of a specific element in an ArrayExpression by index
// arrayPath must already be a resolved ArrayExpression path
function resolveArrayLiteralElement(arrayPath, index) {
  const { elements } = arrayPath.node;
  if (index < 0 || index >= elements.length) return null;
  // bail if any spread at or before target index - positions become unpredictable
  for (let i = 0; i <= index; i++) {
    if (elements[i]?.type === 'SpreadElement') return null;
  }
  if (!elements[index]) return null; // hole
  return resolveNodeType(arrayPath.get(`elements.${ index }`));
}

// resolve common element type from an ArrayExpression if all elements share the same type
// arrayPath must already be a resolved ArrayExpression path
function resolveArrayLiteralCommonType(arrayPath) {
  const { elements } = arrayPath.node;
  if (elements.length === 0) return null;
  let common = null;
  for (let i = 0; i < elements.length; i++) {
    // bail on holes and spreads - can't determine element types
    if (!elements[i] || elements[i].type === 'SpreadElement') return null;
    const resolved = resolveNodeType(arrayPath.get(`elements.${ i }`));
    if (!resolved) return null;
    if (!common) {
      common = resolved;
    } else if (!typesEqual(common, resolved)) {
      return null; // mixed types
    }
  }
  return common;
}

// resolve element type from a runtime iterable (follows variables via resolvePath)
// handles: string literals (chars) and homogeneous array literals (common element type)
function resolveRuntimeIterableElement(path) {
  const resolved = resolveRuntimeExpression(path);
  const nodeType = resolveNodeType(resolved);
  if (nodeType?.primitive && nodeType.type === 'string') return new $Primitive('string');
  if (resolved.isArrayExpression()) return resolveArrayLiteralCommonType(resolved);
  return null;
}

function findBindingAnnotation(bindingPath) {
  return bindingPath.node.typeAnnotation
    || (bindingPath.isVariableDeclarator() && bindingPath.node.id?.typeAnnotation)
    || (bindingPath.isAssignmentPattern() && bindingPath.node.left?.typeAnnotation);
}

// resolve array destructuring from any annotation source: pattern, init, or for-of iterable
function resolveArrayBinding(arrayPattern, varName, bindingPath) {
  // array rest: const [a, ...rest] = items -> rest is always Array
  if (isRestBinding(arrayPattern.elements || [], varName)) return new $Object('Array');
  // annotation on the pattern itself: function foo([a]: string[]) or const [a]: string[] = ...
  if (arrayPattern.typeAnnotation) {
    return resolveArrayPatternBinding(arrayPattern, varName, arrayPattern.typeAnnotation, bindingPath.scope);
  }
  // annotation on the init expression: const [a] = typedArr
  if (bindingPath.isVariableDeclarator() && bindingPath.node.init) {
    const initInfo = findExpressionAnnotation(bindingPath.get('init'));
    if (initInfo) {
      const initResult = resolveArrayPatternBinding(arrayPattern, varName, initInfo.annotation, initInfo.scope);
      if (initResult) return initResult;
    }
    // runtime init: resolve through variables to the actual value
    const initPath = resolveRuntimeExpression(bindingPath.get('init'));
    const initType = resolveNodeType(initPath);
    // string → iterating yields individual characters: const [a] = 'hello'
    if (initType?.primitive && initType.type === 'string') return new $Primitive('string');
    // array literal → resolve element by index: const [a, b] = ['hello', 42]
    if (initPath.isArrayExpression()) {
      const index = findPatternIndex(arrayPattern, varName);
      if (index >= 0) {
        const elemType = resolveArrayLiteralElement(initPath, index);
        if (elemType) return elemType;
      }
    }
  }
  // for-of iterable: for (const [a] of typedArr)
  const elemInfo = resolveForOfElementAnnotation(bindingPath);
  if (elemInfo) return resolveArrayPatternBinding(arrayPattern, varName, elemInfo.annotation, elemInfo.scope);
  // runtime: for (const [a] of 'hello') or for (const [a] of ['x', 'y'])
  const forOfPath = findForLoopParent(bindingPath);
  if (forOfPath?.isForOfStatement()) {
    const runtimeType = resolveRuntimeIterableElement(forOfPath.get('right'));
    if (runtimeType) return runtimeType;
  }
  return null;
}

function resolveAnnotatedMember(annotation, keyName, scope) {
  const memberType = findTypeMember(unwrapTypeAnnotation(annotation), keyName, scope);
  return memberType ? resolveTypeAnnotation(memberType, scope) : null;
}

// resolve the raw element annotation of a for-of iterable from its type annotation
function resolveForOfElementAnnotation(path) {
  const forOfPath = findForLoopParent(path);
  if (!forOfPath?.isForOfStatement()) return null;
  const annotationInfo = findExpressionAnnotation(forOfPath.get('right'));
  if (!annotationInfo) return null;
  const elemAnnotation = extractElementAnnotation(annotationInfo.annotation, annotationInfo.scope, 0);
  return elemAnnotation ? { annotation: elemAnnotation, scope: annotationInfo.scope } : null;
}

function resolveObjectBinding(objectPattern, varName, bindingPath) {
  // object rest: const { a, ...rest } = obj -> rest is always Object
  if (isRestBinding(objectPattern.properties, varName)) return new $Object('Object');
  // annotation on the pattern: const { items }: { items: number[] } = ...
  if (objectPattern.typeAnnotation) {
    const result = resolveDestructuredType(objectPattern, varName, bindingPath.scope);
    if (result) return result;
  }
  const keyName = findDestructuredKeyName(objectPattern, varName);
  if (!keyName) return null;
  // resolve from init expression: runtime object literal or annotated variable
  if (bindingPath.isVariableDeclarator() && bindingPath.node.init) {
    const initPath = resolveRuntimeExpression(bindingPath.get('init'));
    // const { name } = { name: 'alice' }
    if (initPath.isObjectExpression()) return resolveObjectMember(initPath, keyName);
    // const { key } = annotatedVar where annotatedVar: { key: string }
    const annotationInfo = findExpressionAnnotation(bindingPath.get('init'));
    if (annotationInfo) {
      const result = resolveAnnotatedMember(annotationInfo.annotation, keyName, annotationInfo.scope);
      if (result) return result;
    }
  }
  // for-of iterable: for (const { name } of typedArr)
  const elemInfo = resolveForOfElementAnnotation(bindingPath);
  if (elemInfo) return resolveAnnotatedMember(elemInfo.annotation, keyName, elemInfo.scope);
  return null;
}

function findBindingPattern(node, type) {
  if (node.type === type) return node;
  if (node.id?.type === type) return node.id;
  return null;
}

function resolveBindingType(path) {
  if (!path.isIdentifier()) return null;
  const binding = path.scope.getBinding(path.node.name);
  if (!binding) return null;
  const { path: bindingPath } = binding;
  const { name } = path.node;
  const { node } = bindingPath;
  // destructured object: for (const { a } of ...) or const { a } = ...
  const objectPattern = findBindingPattern(node, 'ObjectPattern');
  if (objectPattern) {
    const result = resolveObjectBinding(objectPattern, name, bindingPath);
    if (result) return result;
  }
  // destructured array: for (const [a] of ...) or const [a] = ...
  const arrayPattern = findBindingPattern(node, 'ArrayPattern');
  if (arrayPattern) {
    const result = resolveArrayBinding(arrayPattern, name, bindingPath);
    if (result) return result;
  }
  // direct annotation: function foo(x: T) or const x: T = ... or (x: T = default)
  const typeAnnotation = findBindingAnnotation(bindingPath);
  if (typeAnnotation) return resolveTypeAnnotation(typeAnnotation, bindingPath.scope);
  // for-in / for-of (only for direct bindings — destructured bindings are handled above)
  if (!objectPattern && !arrayPattern) {
    const forLoopParent = findForLoopParent(bindingPath);
    if (forLoopParent) {
      // for-in: iteration variable is always a string per ECMAScript spec
      if (forLoopParent.isForInStatement()) return new $Primitive('string');
      // for-of: infer element type from the iterable
      if (forLoopParent.isForOfStatement()) {
        // try type annotation on the iterable
        const annotationInfo = findExpressionAnnotation(forLoopParent.get('right'));
        if (annotationInfo) {
          const annotatedType = resolveElementType(annotationInfo.annotation, annotationInfo.scope, 0);
          if (annotatedType) return annotatedType;
        }
        // try runtime resolution: for (const ch of 'hello') or for (const s of ['a', 'b'])
        const runtimeType = resolveRuntimeIterableElement(forLoopParent.get('right'));
        if (runtimeType) return runtimeType;
      }
    }
  }
  return null;
}

function matchesTypeofValue(resolved, value) {
  if (value === 'object') return (!resolved.primitive && resolved.constructor !== 'Function') || resolved.type === 'null';
  if (value === 'function') return resolved.constructor === 'Function';
  return resolved.primitive && resolved.type === value;
}

function matchesGuard(resolved, guard) {
  if (guard.kind === 'typeof') return matchesTypeofValue(resolved, guard.value);
  if (guard.kind === 'typeof-or') {
    for (const value of guard.values) if (matchesTypeofValue(resolved, value)) return true;
    return false;
  }
  return !resolved.primitive && resolved.constructor === guard.constructorName;
}

function isTypeofVar(node, varName) {
  return node?.type === 'UnaryExpression' && node.operator === 'typeof'
    && node.argument?.type === 'Identifier' && node.argument.name === varName;
}

// hint convention: lowercase -> typeof guard (primitive), capitalized -> instanceof guard (object)
function guardFromHint(hint, negated) {
  if (PRIMITIVES.has(hint)) return { kind: 'typeof', value: hint, negated };
  return { kind: 'instanceof', constructorName: hint, negated };
}

function parseTypeGuard(testNode, varName) {
  let negated = false;
  let test = testNode;
  if (test.type === 'UnaryExpression' && test.operator === '!') {
    negated = true;
    test = test.argument;
  }
  if (test.type === 'BinaryExpression') {
    const { operator, left, right } = test;
    const isNegatedOp = operator === '!==' || operator === '!=';
    if (isNegatedOp || operator === '===' || operator === '==') {
      if (isNegatedOp) negated = !negated;
      // normalize: typeof may be on either side
      const [typeofSide, literalSide] = left.type === 'UnaryExpression' ? [left, right] : [right, left];
      if (isTypeofVar(typeofSide, varName) && literalSide.type === 'StringLiteral') {
        return { kind: 'typeof', value: literalSide.value, negated };
      }
    }
    if (operator === 'instanceof'
      && left.type === 'Identifier' && left.name === varName
      && right.type === 'Identifier') {
      return { kind: 'instanceof', constructorName: right.name, negated };
    }
  }
  if (test.type === 'CallExpression' && test.arguments?.length === 1
    && test.arguments[0].type === 'Identifier' && test.arguments[0].name === varName) {
    const { callee } = test;
    if (callee.type === 'MemberExpression' && !callee.computed
      && callee.object.type === 'Identifier' && callee.property.type === 'Identifier') {
      const hint = lookupNested(KNOWN_STATIC_TYPE_GUARDS, callee.object.name, callee.property.name);
      if (hint) return guardFromHint(hint, negated);
    }
  }
  return null;
}

const EXIT_STATEMENTS = new Set(['BreakStatement', 'ContinueStatement', 'ReturnStatement', 'ThrowStatement']);

function blockAlwaysExits(block, depth = 0) {
  if (depth > MAX_DEPTH) return false;
  if (EXIT_STATEMENTS.has(block.node.type)) return true;
  if (block.isBlockStatement()) {
    const body = block.get('body');
    return body.length > 0 && blockAlwaysExits(body[body.length - 1], depth + 1);
  }
  // if both branches always exit, the if-statement always exits
  if (block.isIfStatement()) {
    return block.node.alternate
      && blockAlwaysExits(block.get('consequent'), depth + 1)
      && blockAlwaysExits(block.get('alternate'), depth + 1);
  }
  return false;
}

function canFallThrough($case) {
  const { consequent } = $case;
  return !consequent.length || !EXIT_STATEMENTS.has(consequent[consequent.length - 1].type);
}

// flatten a && b && c when condition is true, or a || b || c when condition is false
// only flattens the matching operator; mixed operators stay as opaque nodes
function flattenCondition(node, operator) {
  if (node.type === 'LogicalExpression' && node.operator === operator) {
    return [...flattenCondition(node.left, operator), ...flattenCondition(node.right, operator)];
  }
  return [node];
}

// parse an OR group of typeof guards: typeof x === 'a' || typeof x === 'b' (conditionTrue=true)
// or De Morgan form: typeof x !== 'a' && typeof x !== 'b' (conditionTrue=false)
function parseTypeofOrGuard(node, varName, conditionTrue) {
  const operator = conditionTrue ? '||' : '&&';
  const expectNegated = !conditionTrue;
  if (node.type !== 'LogicalExpression' || node.operator !== operator) return null;
  const parts = flattenCondition(node, operator);
  const values = new Set();
  for (const part of parts) {
    const guard = parseTypeGuard(part, varName);
    if (!guard || guard.kind !== 'typeof' || guard.negated !== expectNegated) return null;
    values.add(guard.value);
  }
  return values.size >= 2 ? { kind: 'typeof-or', values, negated: expectNegated } : null;
}

// extract guards for varName from a condition, applying && / || flattening
function parseGuardsFromCondition(testNode, conditionTrue, varName) {
  const parts = flattenCondition(testNode, conditionTrue ? '&&' : '||');
  const guards = [];
  for (const part of parts) {
    const guard = parseTypeGuard(part, varName) || parseTypeofOrGuard(part, varName, conditionTrue);
    if (guard) {
      guard.positive = conditionTrue !== guard.negated;
      guards.push(guard);
    }
  }
  return guards;
}

// if / ternary / && / || - unified: parse guards from condition, determine polarity
function findConditionalGuards(current, varName) {
  const parent = current.parentPath;
  if (!parent) return [];
  let conditionTrue, testNode;
  if (parent.isIfStatement() || parent.isConditionalExpression()) {
    const { key } = current;
    if (key !== 'consequent' && key !== 'alternate') return [];
    conditionTrue = key === 'consequent';
    testNode = parent.node.test;
  } else if (parent.isLogicalExpression() && current.key === 'right') {
    const { operator } = parent.node;
    if (operator !== '&&' && operator !== '||') return [];
    conditionTrue = operator === '&&';
    testNode = parent.node.left;
  } else return [];
  return parseGuardsFromCondition(testNode, conditionTrue, varName);
}

// resolve a string value from a case test: StringLiteral directly or constant Identifier binding
function caseTestStringValue(test, scope) {
  if (!test) return null;
  if (test.type === 'StringLiteral') return test.value;
  if (test.type === 'Identifier') {
    const bindingPath = constantBindingPath(test.name, scope);
    if (bindingPath?.isVariableDeclarator()) {
      const { init } = bindingPath.node;
      if (init?.type === 'StringLiteral') return init.value;
    }
  }
  return null;
}

// switch (typeof x) { case 'string': ... ; default: ... }
function findSwitchCaseGuards(current, varName) {
  if (!current.parentPath?.isSwitchCase()) return null;
  const switchCase = current.parentPath;
  const switchStmt = switchCase.parentPath;
  if (!switchStmt?.isSwitchStatement()) return null;
  if (!isTypeofVar(switchStmt.node.discriminant, varName)) return null;
  const { cases } = switchStmt.node;
  const { scope } = switchCase;
  const caseIndex = cases.indexOf(switchCase.node);
  const caseValue = caseTestStringValue(switchCase.node.test, scope);
  // specific case: typeof value is known
  if (caseValue !== null) {
    // collect fall-through predecessors into a typeof-or group
    const values = new Set([caseValue]);
    for (let i = caseIndex - 1; i >= 0; i--) {
      if (!canFallThrough(cases[i])) break;
      // bail if default or non-resolvable test in the fall-through chain
      const predValue = caseTestStringValue(cases[i].test, scope);
      if (predValue === null) return null;
      values.add(predValue);
    }
    if (values.size === 1) return [{ kind: 'typeof', value: caseValue, positive: true, negated: false }];
    return [{ kind: 'typeof-or', values, negated: false, positive: true }];
  }
  // default case: none of the explicit cases matched -> negative guards for each
  if (switchCase.node.test === null) {
    // bail if a preceding case can fall through to default - negative guards would be unsound
    if (caseIndex > 0 && canFallThrough(cases[caseIndex - 1])) return null;
    const guards = [];
    for (const $case of cases) {
      const value = caseTestStringValue($case.test, scope);
      if (value !== null) guards.push({ kind: 'typeof', value, positive: false, negated: false });
    }
    return guards.length ? guards : null;
  }
  return null;
}

// if (typeof x === 'string') return; -> x is narrowed after the if
// collects ALL preceding exit guards, including && / || flattening
function findPrecedingExitGuards(siblings, index, varName) {
  const guards = [];
  for (let i = index - 1; i >= 0; i--) {
    const sibling = siblings[i];
    if (!sibling.isIfStatement()) continue;
    let conditionTrue;
    if (blockAlwaysExits(sibling.get('consequent'))) {
      conditionTrue = false;
    } else if (sibling.node.alternate && blockAlwaysExits(sibling.get('alternate'))) {
      conditionTrue = true;
    } else continue;
    guards.push(...parseGuardsFromCondition(sibling.node.test, conditionTrue, varName));
  }
  return guards;
}

function findEarlyExitGuards(current, varName) {
  const parent = current.parentPath;
  if (typeof current.key !== 'number' || current.listKey !== 'body') return null;
  if (!parent.isBlockStatement() && !parent.isProgram()) return null;
  const guards = findPrecedingExitGuards(parent.get('body'), current.key, varName);
  return guards.length ? guards : null;
}

// collect ALL type guards along the AST path for cumulative narrowing
function findEnclosingTypeGuards(path, varName) {
  const guards = [];
  let current = path.parentPath;
  while (current) {
    if (current.isFunction()) break;
    guards.push(...findConditionalGuards(current, varName));
    const switchGuards = findSwitchCaseGuards(current, varName);
    if (switchGuards) guards.push(...switchGuards);
    const exitGuards = findEarlyExitGuards(current, varName);
    if (exitGuards) guards.push(...exitGuards);
    current = current.parentPath;
  }
  return guards.length ? guards : null;
}

// resolve the type a guard implies: typeof 'string' -> $Primitive('string'), instanceof Array -> $Object('Array')
function resolveGuardType(guard) {
  if (guard.kind === 'typeof') {
    if (PRIMITIVES.has(guard.value)) return new $Primitive(guard.value);
    if (guard.value === 'function') return new $Object('Function');
    // 'object' is too ambiguous - could be Array, Map, Set, Date, null, etc.
    return null;
  }
  if (guard.kind === 'instanceof') return resolveKnownConstructor(guard.constructorName);
  return null;
}

// filter candidate types by guards, return the unique surviving type or null
function narrowByGuards(candidates, guards) {
  let result = null;
  for (const resolved of candidates) {
    if (!resolved) continue;
    if (isNullableOrNever(resolved)) continue;
    if (!guards.every(guard => matchesGuard(resolved, guard) === guard.positive)) continue;
    if (result && !typesEqual(result, resolved)) return null;
    result = resolved;
  }
  return result;
}

// shared prologue: find guards for an identifier binding
function findGuardsForBinding(path) {
  if (!path.isIdentifier()) return null;
  const { name } = path.node;
  const binding = path.scope.getBinding(name);
  if (!binding) return null;
  const guards = findEnclosingTypeGuards(path, name);
  if (!guards) return null;
  return { binding, guards };
}

function resolveTypeGuardNarrowing(path) {
  const info = findGuardsForBinding(path);
  if (!info) return null;
  const { binding, guards } = info;
  const annotation = findBindingAnnotation(binding.path);
  if (annotation) {
    // narrow union type annotation by guards
    const { scope } = binding.path;
    const union = followTypeAliasChain(annotation, scope);
    if (union?.type !== 'TSUnionType' && union?.type !== 'UnionTypeAnnotation') return null;
    const { types } = union;
    if (!types?.length) return null;
    return narrowByGuards(types.map(member => resolveTypeAnnotation(member, scope)), guards);
  }
  // no annotation: resolve type directly from positive guards
  return narrowByGuards(guards.filter(g => g.positive).map(resolveGuardType), guards);
}

function resolveNodeType(path) {
  return resolveNodeTypeExpression(path) || resolveBindingType(path) || resolveTypeGuardNarrowing(path);
}

// resolve the type of the object from which a property is accessed:
// member expression (obj.prop, obj?.prop) or destructuring ({ prop } = obj)
function resolvePropertyObjectType(path) {
  if (isMemberLike(path)) return resolveNodeType(path.get('object'));
  if (!path.isObjectProperty()) return null;
  const objectPattern = path.parentPath;
  if (!objectPattern?.isObjectPattern()) return null;
  if (objectPattern.node.typeAnnotation) {
    return resolveTypeAnnotation(objectPattern.node.typeAnnotation, objectPattern.scope);
  }
  const declarator = objectPattern.parentPath;
  if (!declarator?.isVariableDeclarator()) return null;
  if (declarator.node.init) return resolveNodeType(declarator.get('init'));
  const elemInfo = resolveForOfElementAnnotation(declarator);
  if (elemInfo) return resolveTypeAnnotation(elemInfo.annotation, elemInfo.scope);
  const forOfPath = findForLoopParent(declarator);
  if (forOfPath?.isForOfStatement()) return resolveRuntimeIterableElement(forOfPath.get('right'));
  return null;
}

function toHint(type) {
  if (!type) return null;
  if (type.primitive) return type.type;
  return type.constructor?.toLowerCase() ?? null;
}

// intersect a whitelist set with another hint set
// if included is null, returns a fresh copy of the hints
function intersectHintSets(included, hints) {
  if (!included) return new Set(hints);
  for (const hint of included) if (!hints.has(hint)) included.delete(hint);
  return included;
}

// collect type hints to include/exclude from typeof / instanceof guards when no annotation
// returns { includedHints: Set } for positive typeof (whitelist, future-proof)
// or { excludedHints: Set } for negative-only guards (blacklist)
// or null when no hints can be determined
function resolveGuardHints(path) {
  const info = findGuardsForBinding(path);
  if (!info) return null;
  const { binding, guards } = info;
  if (findBindingAnnotation(binding.path)) return null;
  // bail if any positive guard resolves to a concrete type (already handled by resolveTypeGuardNarrowing)
  if (guards.some(g => g.positive && resolveGuardType(g))) return null;

  // check for positive typeof guards -> use whitelist approach
  // whitelist is future-proof: unknown future hints are excluded by default
  let included = null;
  for (const guard of guards) {
    if (!guard.positive) continue;
    if (guard.kind === 'typeof') {
      if (!hasOwn(TYPEOF_HINT_GROUPS, guard.value)) continue;
      included = intersectHintSets(included, TYPEOF_HINT_GROUPS[guard.value]);
    } else if (guard.kind === 'typeof-or') {
      // OR group: union of all typeof groups, then intersect with accumulated whitelist
      const union = new Set();
      for (const value of guard.values) {
        if (hasOwn(TYPEOF_HINT_GROUPS, value)) {
          for (const hint of TYPEOF_HINT_GROUPS[value]) union.add(hint);
        }
      }
      if (union.size) included = intersectHintSets(included, union);
    }
  }

  if (included) {
    // subtract negative guards from the whitelist
    for (const guard of guards) {
      if (guard.positive) continue;
      if (guard.kind === 'typeof' && hasOwn(TYPEOF_HINT_GROUPS, guard.value)) {
        for (const hint of TYPEOF_HINT_GROUPS[guard.value]) included.delete(hint);
      } else {
        const hint = toHint(resolveGuardType(guard));
        if (hint) included.delete(hint);
      }
    }
    return included.size ? { includedHints: included } : null;
  }

  // no positive typeof -> use blacklist approach (conservative: unknown future hints are included)
  const excluded = new Set();
  for (const guard of guards) {
    if (guard.kind === 'typeof' && !guard.positive && hasOwn(TYPEOF_HINT_GROUPS, guard.value)) {
      for (const hint of TYPEOF_HINT_GROUPS[guard.value]) excluded.add(hint);
    } else if (!guard.positive) {
      const hint = toHint(resolveGuardType(guard));
      if (hint) excluded.add(hint);
    }
  }
  return excluded.size ? { excludedHints: excluded } : null;
}

function isString(path) {
  const it = resolveNodeType(path);
  return it?.type === 'string' || it?.constructor === 'String';
}

function isObject(path) {
  return resolveNodeType(path)?.primitive === false;
}

module.exports = {
  POSSIBLE_GLOBAL_PROXIES,
  resolveGlobalName,
  resolvePropertyObjectType,
  resolveGuardHints,
  toHint,
  isString,
  isObject,
};
