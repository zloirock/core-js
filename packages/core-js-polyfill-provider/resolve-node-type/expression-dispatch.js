// Expression-position dispatch: the big switch that maps a runtime AST node kind to a
// resolved Type object. handles every literal kind, MemberExpression / NewExpression /
// CallExpression / TaggedTemplate, unary / binary / assignment / conditional / logical
// operators, TS as / satisfies / TypeAssertion casts, AwaitExpression, YieldExpression.
//
// Public surface:
//   resolveNodeTypeExpression(path)  - main switch dispatcher (called by the factory's
//                                      `resolveNodeType` entry after cache lookup)
//
// Cluster-internal: `resolveNewExpressionType`, `resolveCallExpressionType`,
// `resolveYieldExpressionType`. extracted into helpers to keep the switch under the
// max-statements lint threshold; called only from `resolveNodeTypeExpression`.
//
// resolvedTypeCache short-circuit lives at the top of the entry to avoid round-trip info
// loss when a sibling polyfill plugin stashes a pre-mutation Type for the rewritten node.
// WeakMap (vs node-attached property) keeps the side-channel opaque to AST-cloning libs.
import { $Object, $Primitive } from './base.js';

const { hasOwn } = Object;

export function createExpressionDispatch({
  t,
  babelNodeType,
  KNOWN_GLOBAL_METHOD_RETURN_TYPES,
  getCachedType,
  resolvePath,
  resolveNodeType,
  resolveRuntimeExpression,
  unwrapTypeAnnotation,
  resolveGlobalName,
  resolveConstructorType,
  resolveConstructorCallType,
  resolveCallReturnType,
  typeFromHint,
  resolveArrayLiteralCommonType,
  resolveThisClass,
  resolveClassInheritance,
  resolveFromMemberExpression,
  resolveArrayIndexAccess,
  resolveEnumMemberAccess,
  resolveKnownPropertyReturnType,
  resolveGlobalStaticReference,
  resolvePrototypeAsInstance,
  resolveKnownGlobalReference,
  resolveBinaryOperatorType,
  resolveUnionType,
  resolveDesugarDefaultTernary,
  resolveNumericType,
  resolveTypeAnnotation,
  resolveAwaitExpressionType,
  generatorTypeParams,
  resolveGeneratorTypeParam,
}) {
  function resolveNewExpressionType(path) {
    const callee = path.get('callee');
    const name = resolveGlobalName(callee);
    if (name) return resolveConstructorType(name, path) || new $Object(name);
    const resolved = resolveRuntimeExpression(callee);
    if (t.isClass(resolved.node)) return resolveClassInheritance(resolved) || new $Object('Object');
    return new $Object(null);
  }

  function resolveCallExpressionType(path) {
    // resolvedTypeCache short-circuit handled at the top of resolveNodeTypeExpression
    const callee = path.get('callee');
    const name = resolveGlobalName(callee);
    if (name) {
      // known constructor called without `new`: String(), Array(), etc.
      const known = resolveConstructorCallType(name, path);
      if (known) return known;
      // known global function: parseInt(), parseFloat(), etc.
      if (hasOwn(KNOWN_GLOBAL_METHOD_RETURN_TYPES, name)) return typeFromHint(KNOWN_GLOBAL_METHOD_RETURN_TYPES[name]);
    }
    if (t.isImport(callee.node)) return new $Object('Promise');
    return resolveCallReturnType(callee);
  }

  function resolveYieldExpressionType(path) {
    const fnPath = path.getFunctionParent();
    if (!fnPath?.node.generator) return null;
    // yield* delegates to an iterable; result is the delegated iterator's TReturn (params[1])
    if (path.node.delegate) return resolveGeneratorTypeParam(path.get('argument'), 1);
    // yield evaluates to the value passed to generator.next(value) = TNext (params[2])
    const params = generatorTypeParams(unwrapTypeAnnotation(fnPath.node.returnType), fnPath.scope);
    if (params?.[2]) return resolveTypeAnnotation(params[2], fnPath.scope);
    return null;
  }

  function resolveNodeTypeExpression(path) {
    // polyfill-side transformations (memoized optional-chain refs, chained conditional
    // wrappers, destructure-extracted helpers) stash a pre-mutation Type object in the
    // `resolvedTypeCache` WeakMap so downstream type resolution can recover the original
    // receiver type even after the expression has been rewritten. check the cached type
    // BEFORE resolvePath - synthesized refs (`_ref` from babel-compat optional-chain
    // memoization) carry it via the cloned Identifier; if resolvePath ever found a
    // meaningful binding init, the type stashed on the cloned identifier itself would be
    // lost. storing the Type object directly (not a hint string) avoids round-trip info
    // loss: `toHint($Object('Array'))` -> 'array' -> `typeFromHint('array')` ->
    // `$Object('array')` (lowercase) breaks downstream KNOWN_*_RETURN_TYPES lookups which
    // key on capitalized constructor names. WeakMap (vs node-attached property) keeps the
    // side-channel opaque to sibling plugins / AST-cloning libraries
    const cached = getCachedType(path.node);
    if (cached) return cached;
    path = resolvePath(path);
    const cachedAfter = getCachedType(path.node);
    if (cachedAfter) return cachedAfter;

    switch (babelNodeType(path.node)) {
      // ESTree wraps optional chains in ChainExpression, preserves parentheses - unwrap
      case 'ChainExpression':
      case 'ParenthesizedExpression':
      case 'TSNonNullExpression':
      case 'TSInstantiationExpression':
        return resolveNodeType(path.get('expression'));
      case 'Identifier':
        return resolvePrototypeAsInstance(path) || resolveKnownGlobalReference(path);
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
        return new $Object('Array', resolveArrayLiteralCommonType(path));
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
      case 'FunctionDeclaration':
      case 'ClassExpression':
      case 'ClassDeclaration':
        return new $Object('Function');
      case 'ThisExpression': {
        const context = resolveThisClass(path);
        return context ? resolveClassInheritance(context.classPath) || new $Object('Object') : null;
      }
      case 'NewExpression':
        return resolveNewExpressionType(path);
      case 'MemberExpression':
      case 'OptionalMemberExpression':
        return resolveFromMemberExpression(path)
          || resolveArrayIndexAccess(path)
          || resolveEnumMemberAccess(path)
          || resolveKnownPropertyReturnType(path)
          || resolveGlobalStaticReference(path)
          || resolvePrototypeAsInstance(path)
          || resolveKnownGlobalReference(path);
      case 'CallExpression':
      case 'OptionalCallExpression':
        return resolveCallExpressionType(path);
      // ESTree: import('foo') is ImportExpression (not CallExpression with Import callee)
      case 'ImportExpression':
        return new $Object('Promise');
      // tagged templates are semantically calls: String.raw`foo` ==== String.raw(...)
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
        return expressions.length ? resolveNodeType(expressions.at(-1)) : null;
      }
      case 'AssignmentExpression':
        switch (path.node.operator) {
          case '=':
            return resolveNodeType(path.get('right'));
          case '||=':
          case '&&=':
          case '??=':
            return resolveUnionType(path.get('left'), path.get('right'), path.node.operator);
          default:
            return resolveBinaryOperatorType(path.node.operator.slice(0, -1), path.get('left'), path.get('right'));
        }
      case 'ConditionalExpression':
        // Babel desugars destructuring defaults as: _ref === void 0 ? DEFAULT : _ref
        // when one branch is a void-0 check and the other is the same identifier, resolve to the default branch
        return resolveDesugarDefaultTernary(path)
          || resolveUnionType(path.get('consequent'), path.get('alternate'), '?:');
      case 'LogicalExpression':
        return resolveUnionType(path.get('left'), path.get('right'), path.node.operator);
      case 'TSAsExpression':
      case 'TSTypeAssertion':
      case 'TypeCastExpression':
        return resolveTypeAnnotation(path.node.typeAnnotation, path.scope) || resolveNodeType(path.get('expression'));
      case 'TSSatisfiesExpression':
        return resolveNodeType(path.get('expression')) || resolveTypeAnnotation(path.node.typeAnnotation, path.scope);
      case 'AwaitExpression':
        return resolveAwaitExpressionType(path);
      case 'YieldExpression':
        return resolveYieldExpressionType(path);
    }
    return null;
  }

  return {
    resolveNodeTypeExpression,
  };
}
