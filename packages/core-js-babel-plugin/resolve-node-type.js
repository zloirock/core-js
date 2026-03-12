'use strict';
const { hasOwn } = Object;

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

const PRIMITIVE_WRAPPERS = Object.assign(Object.create(null), {
  bigint: 'BigInt',
  boolean: 'Boolean',
  number: 'Number',
  string: 'String',
  symbol: 'Symbol',
});

const {
  globalMethods: KNOWN_GLOBAL_METHOD_RETURN_TYPES,
  globalProperties: KNOWN_GLOBAL_PROPERTY_RETURN_TYPES,
  staticMethods: KNOWN_STATIC_METHOD_RETURN_TYPES,
  staticProperties: KNOWN_STATIC_PROPERTY_RETURN_TYPES,
  instanceMethods: KNOWN_INSTANCE_METHOD_RETURN_TYPES,
  instanceProperties: KNOWN_INSTANCE_PROPERTY_RETURN_TYPES,
} = require('@core-js/compat/known-built-in-return-types');

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

function constantBindingPath(name, scope) {
  if (!scope) return null;
  const binding = scope.getBinding(name);
  return binding?.constant ? binding.path : null;
}

function resolveTypeQuery(node, scope) {
  const { exprName } = node;
  // typeof obj.prop — qualified name (one level deep)
  if (exprName?.type === 'TSQualifiedName') {
    const { left, right } = exprName;
    if (left.type !== 'Identifier' || right.type !== 'Identifier') return null;
    const bindingPath = constantBindingPath(left.name, scope);
    if (!bindingPath) return null;
    if (bindingPath.isVariableDeclarator()) {
      const init = resolvePath(bindingPath.get('init'));
      if (init.isObjectExpression()) return resolveObjectMember(init, right.name);
    }
    if (bindingPath.isClassDeclaration()) return resolveClassMember(bindingPath, right.name, true);
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

function resolveTypeParameter(name, scope, depth) {
  if (!scope) return null;
  let currentScope = scope;
  while (currentScope) {
    const params = currentScope.block.typeParameters?.params;
    if (params) for (const param of params) {
      if (param.name === name) return param.constraint ? resolveTypeAnnotation(param.constraint, scope, depth + 1) : null;
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
  const decl = findTypeDeclaration(name, scope);
  if (decl) {
    if (decl.type === 'TSTypeAliasDeclaration') return resolveTypeAnnotation(decl.typeAnnotation, scope, depth + 1);
    if (decl.type === 'TSInterfaceDeclaration') {
      const base = decl.extends?.[0]?.expression;
      if (base?.type === 'Identifier') {
        return resolveKnownConstructor(base.name) || resolveUserDefinedType(base.name, scope, depth + 1) || new $Object('Object');
      }
      return new $Object('Object');
    }
  }
  return resolveTypeParameter(name, scope, depth);
}

function getTypeMembers(objectType, scope) {
  if (objectType.type === 'TSTypeLiteral') return objectType.members;
  const name = typeRefName(objectType);
  const decl = name ? findTypeDeclaration(name, scope) : null;
  if (decl?.type === 'TSInterfaceDeclaration') return decl.body?.body;
  if (decl?.type === 'TSTypeAliasDeclaration' && decl.typeAnnotation?.type === 'TSTypeLiteral') return decl.typeAnnotation.members;
  return null;
}

function findTypeMember(objectType, key, scope) {
  const members = getTypeMembers(objectType, scope);
  if (!members) return null;
  for (const member of members) {
    if (member.type !== 'TSPropertySignature') continue;
    if (member.key?.type === 'Identifier' && member.key.name === key) return member.typeAnnotation;
  }
  return null;
}

function findTupleElement(objectType, index, scope) {
  let tuple = objectType;
  if (tuple.type !== 'TSTupleType') {
    const name = typeRefName(tuple);
    const decl = name ? findTypeDeclaration(name, scope) : null;
    if (decl?.type === 'TSTypeAliasDeclaration') tuple = decl.typeAnnotation;
  }
  if (tuple?.type !== 'TSTupleType') return null;
  const elements = tuple.elementTypes;
  if (!elements || index < 0 || index >= elements.length) return null;
  const element = elements[index];
  // named tuple member: [name: string, items: number[]]
  return element.type === 'TSNamedTupleMember' ? element.elementType : element;
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
    if (typesEqual(resolved, target) !== keep) continue;
    if (result && !typesEqual(result, resolved)) return null;
    result = resolved;
  }
  return result;
}

function resolveReturnTypeFromTypeQuery(param, scope) {
  if (param.type !== 'TSTypeQuery') return null;
  const { exprName } = param;
  if (exprName?.type !== 'Identifier') return null;
  const bindingPath = constantBindingPath(exprName.name, scope);
  if (!bindingPath) return null;
  let fnPath;
  if (bindingPath.isFunctionDeclaration()) {
    fnPath = bindingPath;
  } else if (bindingPath.isVariableDeclarator()) {
    const init = bindingPath.get('init');
    if (init.isFunctionExpression() || init.isArrowFunctionExpression()) fnPath = init;
  }
  return fnPath ? resolveReturnType(fnPath) : null;
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
    // well-known utility types — resolve type parameter
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
    // well-known utility types — resolve via function return type
    case 'ReturnType':
      return node.typeParameters?.params[0] ? resolveReturnTypeFromTypeQuery(node.typeParameters.params[0], scope) : null;
    case 'InstanceType': {
      const param = node.typeParameters?.params[0];
      if (!param || param.type !== 'TSTypeQuery') return null;
      const { exprName } = param;
      if (exprName?.type !== 'Identifier') return null;
      const bindingPath = constantBindingPath(exprName.name, scope);
      if (!bindingPath) return null;
      if (bindingPath.isClassDeclaration()) return new $Object(null);
      if (bindingPath.isVariableDeclarator()) {
        const init = bindingPath.get('init');
        if (init.isClassExpression()) return new $Object(null);
      }
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
    // TS / Flow named types — only well-known built-ins and utility types
    case 'TSTypeReference':
    case 'GenericTypeAnnotation': {
      const name = typeRefName(node);
      if (name) return resolveNamedType(name, node, scope, depth);
      return null;
    }
    // transparent wrappers — unwrap and resolve the inner type
    case 'TSParenthesizedType':
    case 'NullableTypeAnnotation':
      return resolveTypeAnnotation(node.typeAnnotation, scope, depth + 1);
    // TS type operator: `readonly T[]`, `unique symbol` — but NOT `keyof T`
    case 'TSTypeOperator':
      if (node.operator !== 'keyof') return resolveTypeAnnotation(node.typeAnnotation, scope, depth + 1);
      return null;
    // TS typeof in type position: `typeof variable`
    case 'TSTypeQuery':
      return resolveTypeQuery(node, scope);
    // TS template literal type: `prefix_${string}`
    case 'TSTemplateLiteralType':
      return new $Primitive('string');
    // TS type predicate: `x is string` → boolean
    case 'TSTypePredicate':
      return new $Primitive('boolean');
    // TS conditional type: T extends U ? X : Y — resolve if both branches have the same type, or one is `never`
    case 'TSConditionalType': {
      const trueResolved = resolveTypeAnnotation(node.trueType, scope, depth + 1);
      const falseResolved = resolveTypeAnnotation(node.falseType, scope, depth + 1);
      if (trueResolved && falseResolved && typesEqual(trueResolved, falseResolved)) return trueResolved;
      // if one branch is `never`, the useful type is in the other branch
      if (trueResolved?.type === 'never') return falseResolved;
      if (falseResolved?.type === 'never') return trueResolved;
      return null;
    }
    // TS / Flow union and intersection — resolve if all (non-nullable for unions) members have the same type
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
        if (isUnion && (resolved.type === 'null' || resolved.type === 'undefined' || resolved.type === 'never')) continue;
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
  const resolved = resolvePath(path.get('property'));
  return resolved.node?.type === 'StringLiteral' ? resolved.node.value : null;
}

function typesEqual(a, b) {
  return a.type === b.type && a.constructor === b.constructor;
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
  if (!path.isMemberExpression() || path.node.computed) return null;
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
    if (!superPath.isIdentifier()) return null;
    current = resolvePath(superPath);
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
      if (callee.isIdentifier()) {
        const resolved = resolvePath(callee);
        if (resolved.isClass()) return resolveClassInheritance(resolved) || new $Object('Object');
      }
      return new $Object(null);
    }
    case 'MemberExpression':
    case 'OptionalMemberExpression':
      return resolveFromMemberExpression(path)
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
      // try to unwrap Promise<T> from the binding's raw type annotation
      const resolved = resolvePath(argument);
      if (resolved.isIdentifier()) {
        const binding = resolved.scope.getBinding(resolved.node.name);
        if (binding) {
          const annotation = unwrapTypeAnnotation(findBindingAnnotation(binding.path));
          if (annotation && typeRefName(annotation) === 'Promise') {
            const inner = annotation.typeParameters?.params[0];
            if (inner) return resolveTypeAnnotation(inner, binding.path.scope);
          }
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
    // argument provided at call site — resolve its type
    if (i < args.length) return resolveNodeType(args[i]);
    // no argument — resolve from the default value
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
    case 'TSTypeOperator':
    case 'TSParenthesizedType':
    case 'NullableTypeAnnotation':
      return hasTypeParamReference(node.typeAnnotation, typeParamNames, depth + 1);
  }
  return false;
}

// build a Map<string, Type> of type parameter bindings from call-site arguments
function buildTypeParamMap(typeParamNames, fnPath, callPath) {
  const typeParamMap = new Map();
  const args = callPath.get('arguments');
  const { params } = fnPath.node;
  // phase 1: direct matching — param annotation is exactly T
  for (let i = 0; i < params.length && i < args.length; i++) {
    if (params[i].type === 'RestElement') continue;
    const paramAnnotation = unwrapTypeAnnotation(params[i].typeAnnotation);
    if (!paramAnnotation) continue;
    const name = typeRefName(paramAnnotation);
    if (name && typeParamNames.has(name) && !typeParamMap.has(name)) {
      const resolved = resolveNodeType(args[i]);
      if (resolved) typeParamMap.set(name, resolved);
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
  // union: T | null, T | undefined — strip nullable, substitute T
  if (node.type === 'TSUnionType' || node.type === 'UnionTypeAnnotation') {
    let result = null;
    for (const member of node.types) {
      const resolved = substituteTypeParams(member, typeParamMap, scope, depth + 1);
      if (!resolved) return null;
      if (resolved.type === 'null' || resolved.type === 'undefined' || resolved.type === 'never') continue;
      if (result && !typesEqual(result, resolved)) return null;
      result = resolved;
    }
    return result;
  }
  // intersection: T & { extra: boolean } — skip plain $Object('Object') from type literals, rest must agree
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
  if (node.type === 'TSParenthesizedType' || node.type === 'NullableTypeAnnotation'
    || (node.type === 'TSTypeOperator' && node.operator !== 'keyof')) {
    return substituteTypeParams(node.typeAnnotation, typeParamMap, scope, depth + 1);
  }
  // T[] or [T, U] — resolve to Array regardless of element type
  if (node.type === 'TSArrayType' || node.type === 'TSTupleType'
    || node.type === 'ArrayTypeAnnotation' || node.type === 'TupleTypeAnnotation') return new $Object('Array');
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
  return resolveBodyReturnType(fnPath, callPath);
}

// resolve `this` to the enclosing class context
function resolveThisClass(path) {
  let current = path;
  while (current = current.parentPath) {
    // direct child of ClassBody — this is a class member
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
  // Foo.staticProp — object is the class itself
  if (objectPath.isClass()) return { classPath: objectPath, isStatic: true };
  // new Foo().prop — object is a class instance
  if (objectPath.isNewExpression()) {
    const cls = resolvePath(objectPath.get('callee'));
    if (cls.isClass()) return { classPath: cls, isStatic: false };
  }
  // this.prop inside a class member
  if (objectPath.isThisExpression()) return resolveThisClass(objectPath);
  return null;
}

function findClassMember(classPath, name, isStatic) {
  for (const member of classPath.get('body').get('body')) {
    const { key } = member.node;
    if (key?.type !== 'Identifier' || key.name !== name) continue;
    if (!!member.node.static !== isStatic) continue;
    return member;
  }
  return null;
}

function resolveClassMember(classPath, name, isStatic, callPath) {
  const member = findClassMember(classPath, name, isStatic);
  if (!member) return null;
  // method call: foo.bar()
  if (callPath) return member.isClassMethod() ? resolveReturnType(member, callPath) : null;
  // property access: foo.bar
  if (member.isClassProperty() || member.isClassAccessorProperty()) {
    if (member.node.typeAnnotation) return resolveTypeAnnotation(member.node.typeAnnotation, member.scope);
    const value = member.get('value');
    return value.node ? resolveNodeType(value) : null;
  }
  // getter — resolve its return type
  if (member.isClassMethod() && member.node.kind === 'get') return resolveReturnType(member);
  return null;
}

function findObjectMember(objectPath, name) {
  for (const prop of objectPath.get('properties')) {
    if (prop.node.key?.type !== 'Identifier' || prop.node.key.name !== name) continue;
    return prop;
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
      const value = prop.get('value');
      if (value.isFunction()) return resolveReturnType(value, callPath);
    }
    return null;
  }
  // property access: obj.foo
  if (prop.isObjectProperty()) return resolveNodeType(prop.get('value'));
  // getter — resolve its return type
  if (prop.isObjectMethod() && prop.node.kind === 'get') return resolveReturnType(prop);
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
    if (member.key?.type !== 'Identifier' || member.key.name !== name) continue;
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
  const objectPath = resolvePath(path.get('object'));
  if (objectPath.isObjectExpression()) return resolveObjectMember(objectPath, name, callPath);
  const ctx = resolveClassContext(objectPath);
  if (ctx) return resolveClassMember(ctx.classPath, name, ctx.isStatic, callPath);
  return resolveTypedMember(objectPath, name, callPath);
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
  if (!callee.isMemberExpression()) return null;
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
// e.g. globalThis.NaN → number, window.parseInt → Function
function resolveKnownGlobalReference(path) {
  const name = resolveGlobalName(path);
  if (!name) return null;
  if (hasOwn(KNOWN_GLOBAL_PROPERTY_RETURN_TYPES, name)) return typeFromHint(KNOWN_GLOBAL_PROPERTY_RETURN_TYPES[name]);
  if (hasOwn(KNOWN_GLOBAL_METHOD_RETURN_TYPES, name)) return new $Object('Function');
  return null;
}

function resolveCallReturnType(callee) {
  // method call: obj.method() or obj?.method()
  if (callee.isMemberExpression() || callee.isOptionalMemberExpression()) {
    return resolveFromMemberExpression(callee, callee.parentPath)
      || resolveKnownStaticReturnType(callee)
      || resolveKnownMethodReturnType(callee);
  }
  // direct call: foo() — or IIFE: (() => expr)()
  const resolved = resolvePath(callee);
  return resolved.isFunction() ? resolveReturnType(resolved, callee.parentPath) : null;
}

function resolveDestructuredType(objectPattern, name, scope) {
  const type = unwrapTypeAnnotation(objectPattern.typeAnnotation);
  if (!type) return null;
  // TS: TSTypeLiteral.members, Flow: ObjectTypeAnnotation.properties
  const members = type.type === 'TSTypeLiteral' ? type.members
    : type.type === 'ObjectTypeAnnotation' ? type.properties
    : null;
  if (!members) return null;
  // find the property key matching the destructured variable
  let keyName;
  for (const prop of objectPattern.properties) {
    if (prop.type !== 'ObjectProperty') continue;
    const value = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
    if (value?.type === 'Identifier' && value.name === name) {
      keyName = prop.key?.type === 'Identifier' ? prop.key.name : null;
      break;
    }
  }
  if (!keyName) return null;
  for (const member of members) {
    if (member.key?.type !== 'Identifier' || member.key.name !== keyName) continue;
    // TS: member.typeAnnotation, Flow: member.value
    return resolveTypeAnnotation(member.typeAnnotation || member.value, scope);
  }
  return null;
}

function findBindingAnnotation(bindingPath) {
  return bindingPath.node.typeAnnotation
    || (bindingPath.isVariableDeclarator() && bindingPath.node.id?.typeAnnotation)
    || (bindingPath.isAssignmentPattern() && bindingPath.node.left?.typeAnnotation);
}

function resolveBindingType(path) {
  if (!path.isIdentifier()) return null;
  const binding = path.scope.getBinding(path.node.name);
  if (!binding) return null;
  const { path: bindingPath } = binding;
  // destructured: function foo({ x }: { x: T }) or const { x }: { x: T } = ...
  const objectPattern = bindingPath.isObjectPattern() ? bindingPath.node
    : (bindingPath.isVariableDeclarator() && bindingPath.node.id?.type === 'ObjectPattern') ? bindingPath.node.id
    : null;
  if (objectPattern?.typeAnnotation) return resolveDestructuredType(objectPattern, path.node.name, bindingPath.scope);
  // direct annotation: function foo(x: T) or const x: T = ... or (x: T = default)
  const typeAnnotation = findBindingAnnotation(bindingPath);
  return typeAnnotation ? resolveTypeAnnotation(typeAnnotation, bindingPath.scope) : null;
}

function matchesGuard(resolved, guard) {
  if (guard.kind === 'typeof') {
    const { value } = guard;
    if (value === 'object') return !resolved.primitive || resolved.type === 'null';
    if (value === 'function') return resolved.constructor === 'Function';
    return resolved.primitive && resolved.type === value;
  }
  return !resolved.primitive && resolved.constructor === guard.constructorName;
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
    if (operator === '===' || operator === '!==') {
      if (operator === '!==') negated = !negated;
      // normalize: typeof may be on either side
      const [typeofSide, literalSide] = left.type === 'UnaryExpression' ? [left, right] : [right, left];
      if (typeofSide.type === 'UnaryExpression' && typeofSide.operator === 'typeof'
        && typeofSide.argument?.type === 'Identifier' && typeofSide.argument.name === varName
        && literalSide.type === 'StringLiteral') {
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
      const { name: className } = callee.object;
      const { name: methodName } = callee.property;
      if ((className === 'Array' && methodName === 'isArray')
        || (className === 'Error' && methodName === 'isError')) {
        return { kind: 'instanceof', constructorName: className, negated };
      }
    }
  }
  return null;
}

function findEnclosingTypeGuard(path, varName) {
  let current = path.parentPath;
  while (current) {
    if (current.isFunction()) return null;
    if (current.parentPath?.isIfStatement()) {
      const { key } = current;
      if (key === 'consequent' || key === 'alternate') {
        const guard = parseTypeGuard(current.parentPath.node.test, varName);
        if (guard) {
          guard.positive = (key === 'consequent') !== guard.negated;
          return guard;
        }
      }
    }
    // switch (typeof x) { case 'string': ... }
    if (current.parentPath?.isSwitchCase()) {
      const switchCase = current.parentPath;
      const switchStmt = switchCase.parentPath;
      if (switchStmt?.isSwitchStatement()) {
        const { discriminant } = switchStmt.node;
        const caseTest = switchCase.node.test;
        if (caseTest?.type === 'StringLiteral'
          && discriminant?.type === 'UnaryExpression' && discriminant.operator === 'typeof'
          && discriminant.argument?.type === 'Identifier' && discriminant.argument.name === varName) {
          return { kind: 'typeof', value: caseTest.value, positive: true, negated: false };
        }
      }
    }
    current = current.parentPath;
  }
  return null;
}

function narrowUnionByGuard(annotation, guard, scope) {
  let union = unwrapTypeAnnotation(annotation);
  if (!union) return null;
  if (union.type === 'TSTypeReference' || union.type === 'GenericTypeAnnotation') {
    const refName = typeRefName(union);
    if (refName) {
      const decl = findTypeDeclaration(refName, scope);
      if (decl?.type === 'TSTypeAliasDeclaration') union = unwrapTypeAnnotation(decl.typeAnnotation);
    }
  }
  if (!union || (union.type !== 'TSUnionType' && union.type !== 'UnionTypeAnnotation')) return null;
  const { types } = union;
  if (!types?.length) return null;
  let result = null;
  for (const member of types) {
    const resolved = resolveTypeAnnotation(member, scope);
    if (!resolved) continue;
    if (resolved.type === 'null' || resolved.type === 'undefined' || resolved.type === 'never') continue;
    if (matchesGuard(resolved, guard) !== guard.positive) continue;
    if (result && !typesEqual(result, resolved)) return null;
    result = resolved;
  }
  return result;
}

function resolveTypeGuardNarrowing(path) {
  if (!path.isIdentifier()) return null;
  const { name } = path.node;
  const binding = path.scope.getBinding(name);
  if (!binding) return null;
  const annotation = findBindingAnnotation(binding.path);
  if (!annotation) return null;
  const guard = findEnclosingTypeGuard(path, name);
  if (!guard) return null;
  return narrowUnionByGuard(annotation, guard, binding.path.scope);
}

function resolveNodeType(path) {
  return resolveNodeTypeExpression(path) || resolveBindingType(path) || resolveTypeGuardNarrowing(path);
}

function toHint(type) {
  if (!type) return null;
  if (type.primitive) return type.type;
  return type.constructor?.toLowerCase() ?? null;
}

function isString(path) {
  const it = resolveNodeType(path);
  return it?.type === 'string' || it?.constructor === 'String';
}

function isObject(path) {
  return resolveNodeType(path)?.primitive === false;
}

module.exports = { POSSIBLE_GLOBAL_PROXIES, resolveGlobalName, resolveNodeType, toHint, isString, isObject };
