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

function resolveTypeAnnotation(node) {
  if (!node) return null;
  // Flow / TS wrappers
  if (node.type === 'TypeAnnotation' || node.type === 'TSTypeAnnotation') {
    return resolveTypeAnnotation(node.typeAnnotation);
  }
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
    // TS / Flow object types
    case 'TSObjectKeyword':
    case 'TSTypeLiteral':
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
    // TS / Flow named types — only well-known built-ins
    case 'TSTypeReference':
    case 'GenericTypeAnnotation': {
      const typeName = node.type === 'TSTypeReference' ? node.typeName : node.id;
      if (typeName?.type === 'Identifier') switch (typeName.name) {
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
          return new $Object(typeName.name);
      }
      return null;
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
  let depth = 5;
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

function resolveUnionType(leftPath, rightPath) {
  const left = resolveNodeType(leftPath);
  const right = resolveNodeType(rightPath);
  if (left && right && left.type === right.type && left.constructor === right.constructor) return left;
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

function resolveNodeType(path) {
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
      return null;
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
      return resolveTypeAnnotation(path.node.typeAnnotation) || resolveNodeType(path.get('expression'));
    case 'TSSatisfiesExpression':
      return resolveNodeType(path.get('expression')) || resolveTypeAnnotation(path.node.typeAnnotation);
    case 'TSNonNullExpression':
    case 'TSInstantiationExpression':
      return resolveNodeType(path.get('expression'));
  }
  return null;
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
