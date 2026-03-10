'use strict';
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

function resolveTypeQuery(node, scope) {
  if (!scope) return null;
  const { exprName } = node;
  if (exprName?.type !== 'Identifier') return null;
  const binding = scope.getBinding(exprName.name);
  if (!binding?.constant) return null;
  const bindingPath = binding.path;
  if (bindingPath.isVariableDeclarator()) {
    const annotation = bindingPath.node.id?.typeAnnotation;
    if (annotation) return resolveTypeAnnotation(annotation, scope);
    const init = bindingPath.get('init');
    if (init.node) return resolveNodeType(init);
  }
  if (bindingPath.isFunctionDeclaration() || bindingPath.isClassDeclaration()) return new $Object('Function');
  return null;
}

function resolveTypeAnnotation(node, scope) {
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
      if (name) switch (name) {
        case 'Array':
        case 'Date':
        case 'Error':
        case 'Function':
        case 'Map':
        case 'Object':
        case 'Promise':
        case 'RegExp':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
        case 'String':
        case 'Number':
        case 'Boolean':
        case 'BigInt':
        case 'Symbol':
          return new $Object(name);
        case 'ReadonlyArray':
        case 'ReadonlyMap':
        case 'ReadonlySet':
          return new $Object(name.replace(/^Readonly/, ''));
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
          return node.typeParameters?.params[0] ? resolveTypeAnnotation(node.typeParameters.params[0], scope) : null;
        case 'Awaited': {
          const param = node.typeParameters?.params[0];
          if (!param) return null;
          // unwrap Promise<T> -> resolve T
          if (typeRefName(param) === 'Promise') {
            const innerParam = param.typeParameters?.params[0];
            if (innerParam) return resolveTypeAnnotation(innerParam, scope);
          }
          return resolveTypeAnnotation(param, scope);
        }
      }
      return null;
    }
    // transparent wrappers — unwrap and resolve the inner type
    case 'TSParenthesizedType':
    case 'NullableTypeAnnotation':
      return resolveTypeAnnotation(node.typeAnnotation, scope);
    // TS type operator: `readonly T[]`, `unique symbol` — but NOT `keyof T`
    case 'TSTypeOperator':
      if (node.operator !== 'keyof') return resolveTypeAnnotation(node.typeAnnotation, scope);
      return null;
    // TS typeof in type position: `typeof variable`
    case 'TSTypeQuery':
      return resolveTypeQuery(node, scope);
    // TS template literal type: `prefix_${string}`
    case 'TSTemplateLiteralType':
      return new $Primitive('string');
    // TS conditional type: T extends U ? X : Y — resolve if both branches have the same type, or one is `never`
    case 'TSConditionalType': {
      const trueResolved = resolveTypeAnnotation(node.trueType, scope);
      const falseResolved = resolveTypeAnnotation(node.falseType, scope);
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
        const resolved = resolveTypeAnnotation(member, scope);
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
  }
  return null;
}

function resolvePath(path) {
  let depth = 15;
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

function resolveNodeTypeExpression(path) {
  path = resolvePath(path);

  switch (path.node.type) {
    case 'Identifier': {
      const { name } = path.node;
      if (!path.scope.getBinding(name)) switch (name) {
        case 'undefined':
          return new $Primitive('undefined');
        case 'Infinity':
        case 'NaN':
          return new $Primitive('number');
        case 'arguments':
          return new $Object('Arguments');
      }
      return null;
    }
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
      if (callee.isIdentifier() && !callee.scope.getBinding(callee.node.name) && callee.node.name !== 'Object') {
        return new $Object(callee.node.name);
      }
      return new $Object(null);
    }
    case 'MemberExpression':
    case 'OptionalMemberExpression':
      return resolveFromMemberExpression(path);
    case 'CallExpression':
    case 'OptionalCallExpression': {
      const callee = path.get('callee');
      const { name } = callee.node;
      if (callee.isIdentifier() && !callee.scope.getBinding(name)) {
        // just some popular cases
        switch (name) {
          case 'String':
          case 'Number':
          case 'Boolean':
          case 'BigInt':
          case 'Symbol':
            return new $Primitive(name.toLowerCase());
          case 'Array':
          case 'RegExp':
          case 'Function':
            return new $Object(name);
          case 'Object':
            return new $Object(null);
        }
      }
      return resolveCallReturnType(callee);
    }
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

// resolve return type of a function, optionally inferring generic type parameters from call-site arguments
// e.g. `identity<T>(x: T): T` called as `identity([1, 2, 3])` -> infer T = Array
function resolveReturnType(fnPath, callPath) {
  const { returnType, typeParameters } = fnPath.node;
  // try to infer generic type parameter from call-site argument
  if (returnType && callPath && typeParameters) {
    const returnName = typeRefName(unwrapTypeAnnotation(returnType));
    if (returnName && (typeParameters.params || []).some(p => p.name === returnName)) {
      const args = callPath.get('arguments');
      for (let i = 0; i < fnPath.node.params.length && i < args.length; i++) {
        if (typeRefName(unwrapTypeAnnotation(fnPath.node.params[i].typeAnnotation)) === returnName) {
          return resolveNodeType(args[i]);
        }
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

function resolveFromMemberExpression(path, callPath) {
  if (path.node.computed) return null;
  const { property } = path.node;
  if (property.type !== 'Identifier') return null;
  const objectPath = resolvePath(path.get('object'));
  if (objectPath.isObjectExpression()) return resolveObjectMember(objectPath, property.name, callPath);
  const ctx = resolveClassContext(objectPath);
  if (!ctx) return null;
  return resolveClassMember(ctx.classPath, property.name, ctx.isStatic, callPath);
}

function resolveCallReturnType(callee) {
  // method call: obj.method() or obj?.method()
  if (callee.isMemberExpression() || callee.isOptionalMemberExpression()) {
    return resolveFromMemberExpression(callee, callee.parentPath);
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
  const typeAnnotation = bindingPath.node.typeAnnotation
    || (bindingPath.isVariableDeclarator() && bindingPath.node.id?.typeAnnotation)
    || (bindingPath.isAssignmentPattern() && bindingPath.node.left?.typeAnnotation);
  return typeAnnotation ? resolveTypeAnnotation(typeAnnotation, bindingPath.scope) : null;
}

function resolveNodeType(path) {
  return resolveNodeTypeExpression(path) || resolveBindingType(path);
}

function toHint(type) {
  if (!type) return null;
  if (type.primitive) return type.type;
  if (type.constructor === 'Object') return null;
  return type.constructor?.toLowerCase() ?? null;
}

function isString(path) {
  const it = resolveNodeType(path);
  return it?.type === 'string' || it?.constructor === 'String';
}

function isObject(path) {
  return resolveNodeType(path)?.primitive === false;
}

module.exports = { resolveNodeType, toHint, isString, isObject };
