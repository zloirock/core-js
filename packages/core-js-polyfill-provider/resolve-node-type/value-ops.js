// Runtime expression resolver bits: union / nullish-coalesce / `||` / `??` defaults,
// binary-operator + numeric-update narrowing, member-property name resolution. these are
// the small per-shape helpers that `resolveNodeTypeExpression` dispatches to for individual
// AST node kinds.
//
// Public surface:
//   resolveNumericType(path)                          - `Number | BigInt` decision for unary
//                                                       `++` / `--` / `-` / `~`
//   resolveMemberPropertyName(path)                   - cross-dialect member-key name from a
//                                                       MemberExpression (non-computed +
//                                                       literal-keyed + alias-to-literal +
//                                                       enum-member access)
//   resolveUnionType(leftPath, rightPath, op)         - resolve `a OP b` for `||` / `&&` /
//                                                       `??` / `?:` / `||=` / `&&=` / `??=`
//   resolveDesugarDefaultTernary(path)                - recognise babel / swc / esbuild
//                                                       destructuring-default ternary desugar
//   resolveBinaryOperatorType(op, left, right)        - `+` / `-` / `*` / `/` / `%` / `**` /
//                                                       bitwise / shift narrowing (number vs
//                                                       bigint vs string disambiguation)
import { $Primitive, primitiveTypeOf } from './base.js';

export function createValueOps({
  isLiteralOf,
  literalKeyValue,
  singleQuasiString,
  getKeyName,
  resolveRuntimeExpression,
  resolveComputedKeyName,
  resolveNodeType,
  resolvePath,
  isNullableOrNever,
  commonType,
}) {
  function resolveNumericType(path) {
    // `resolveNodeType` on a bare Identifier stops at the identifier itself without
    // descending to its binding init - `resolvePath` walks `const x = BigInt(1)` so
    // `x++` sees the BigInt-typed init. `number` fallback kept for unresolvable paths
    const resolved = resolveNodeType(resolvePath(path));
    return new $Primitive(primitiveTypeOf(resolved) === 'bigint' ? 'bigint' : 'number');
  }

  // resolve property name from a MemberExpression, handling both
  // non-computed (obj.prop), string/numeric literal (obj['prop'], obj[0]),
  // single-quasi TemplateLiteral (obj[`prop`]), constant binding (const key = 'prop'; obj[key])
  // and enum member access (obj[Enum.A]). singleQuasiString is checked at both the raw
  // property AND after binding-follow so const-bound back-tick keys (const k = `foo`; obj[k])
  // resolve identically to literal-string keys - mirrors getMemberProperty / indexedAccessKey
  function resolveMemberPropertyName(path) {
    const { property, computed } = path.node;
    if (!computed) return getKeyName(property);
    const resolved = resolveRuntimeExpression(path.get('property')).node;
    return literalKeyValue(property)
      ?? singleQuasiString(property)
      ?? literalKeyValue(resolved)
      ?? singleQuasiString(resolved)
      ?? resolveComputedKeyName(property, path.scope);
  }

  // `op === '??'` ('??' / '??='): left contributes only when non-nullish - if left is
  // statically null/undefined primitive, right is the only runtime value. similarly for
  // `||`/`||=`: literal-null/undefined left always falls through to right. without this
  // peel, `null ?? 'a'` yields commonType(null, string) = null, losing the string type
  function resolveUnionType(leftPath, rightPath, op) {
    const left = resolveNodeType(leftPath);
    const right = resolveNodeType(rightPath);
    if (left && right && (op === '??' || op === '??=' || op === '||' || op === '||=')
        && isNullableOrNever(left)) return right;
    return left && right ? commonType(left, right) : null;
  }

  // recognize Babel's destructuring default desugaring: _ref === void 0 ? DEFAULT : _ref
  // and resolve to the type of DEFAULT (the consequent branch)
  function resolveDesugarDefaultTernary(path) {
    const { test, alternate } = path.node;
    if (test.type !== 'BinaryExpression' || test.operator !== '===') return null;
    const { left, right } = test;
    const refName = checkSelfTernaryRefName(left, right);
    if (!refName) return null;
    if (alternate.type !== 'Identifier' || alternate.name !== refName) return null;
    return resolveNodeType(path.get('consequent'));
  }

  // identify the destructure-ref name from a default-ternary test. babel emits
  // `_ref === void 0`; swc / esbuild emit `typeof _ref === 'undefined'`. both desugar
  // the same `function({x = D})` pattern - missing the typeof form silently dropped
  // type inference for any swc / esbuild output passed through the plugin
  function checkSelfTernaryRefName(left, right) {
    if (left.type === 'Identifier' && isVoidZero(right)) return left.name;
    if (left.type === 'UnaryExpression' && left.operator === 'typeof'
      && left.argument?.type === 'Identifier' && isUndefinedString(right)) return left.argument.name;
    return null;
  }

  function isVoidZero(node) {
    return node.type === 'UnaryExpression' && node.operator === 'void'
      && isLiteralOf(node.argument, 'Numeric') && node.argument.value === 0;
  }

  // `isLiteralOf(node, 'String')` routes through `babelNodeType` which normalises ESTree
  // `Literal{value: 'undefined'}` (string-typed) to `StringLiteral` - one check covers
  // both parsers. earlier second branch on raw `node.type === 'Literal'` was dead since
  // babel emits `StringLiteral` for strings and the normalised first branch already
  // matched ESTree's raw `Literal` shape
  function isUndefinedString(node) {
    return isLiteralOf(node, 'String') && node.value === 'undefined';
  }

  function resolveBinaryOperatorType(operator, leftPath, rightPath) {
    switch (operator) {
      case '+': {
        const leftType = primitiveTypeOf(resolveNodeType(leftPath));
        const rightType = primitiveTypeOf(resolveNodeType(rightPath));
        if (leftType === 'string' || rightType === 'string') return new $Primitive('string');
        if (leftType === 'number' && rightType === 'number') return new $Primitive('number');
        if (leftType === 'bigint' && rightType === 'bigint') return new $Primitive('bigint');
        return new $Primitive('unknown');
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
        const leftType = primitiveTypeOf(resolveNodeType(leftPath));
        const rightType = primitiveTypeOf(resolveNodeType(rightPath));
        if (leftType === 'bigint' || rightType === 'bigint') return new $Primitive('bigint');
        // `number` if resolving is not possible - acceptable assumption within `core-js`
        return new $Primitive('number');
      }
    }
    return null;
  }

  return {
    resolveNumericType,
    resolveMemberPropertyName,
    resolveUnionType,
    resolveDesugarDefaultTernary,
    resolveBinaryOperatorType,
  };
}
