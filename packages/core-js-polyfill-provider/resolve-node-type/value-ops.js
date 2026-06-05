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
//   resolveDesugarDefaultTernary(path)                - recognise babel / swc / esbuild /
//                                                       terser destructuring-default ternary
//                                                       (positive `=== void 0 ? D : R`,
//                                                       inverse `!== void 0 ? R : D`,
//                                                       loose-eq `== null ? D : R`,
//                                                       bare `undefined` Identifier forms)
//   resolveBinaryOperatorType(op, left, right)        - `+` / `-` / `*` / `/` / `%` / `**` /
//                                                       bitwise / shift narrowing (number vs
//                                                       bigint vs string disambiguation)
import { $Primitive, primitiveTypeOf } from './base.js';
import { isBareUndefinedIdentifier } from './ast-shapes.js';

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
    // Number-vs-BigInt kind for unary `-`/`~` and `++`/`--` (all preserve it). `resolvePath`
    // descends a const / unreassigned binding to its init, so `const x = BigInt(1); -x` reads
    // bigint. a `++`/`--` operand is necessarily reassigned, so `resolvePath` bails on that
    // constantViolation to the bare identifier and the case falls to the `number` default -
    // a known minor imprecision (`let x = 5n; x++` reads number) with no polyfill impact, since
    // core-js exposes no Number / BigInt prototype methods that this kind would route between
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

  // recognise the destructuring-default desugar shape: positive `_ref === void 0 ? D : _ref`
  // (babel) and inverse `_ref !== void 0 ? _ref : D` (esbuild / swc / terser). result type
  // folds default + _ref via `commonType` - an untyped or unrelated-typed `_ref` collapses
  // to null so the caller falls through to the standard `?:` union fold rather than emitting
  // an unsound Maybe-array narrow against a caller-controlled value
  function resolveDesugarDefaultTernary(path) {
    const slot = matchSelfDefaultTernarySlot(path.node, path.scope);
    if (!slot) return null;
    const defaultType = resolveNodeType(path.get(slot));
    if (!defaultType) return null;
    const refType = resolveNodeType(path.get(slot === 'consequent' ? 'alternate' : 'consequent'));
    if (!refType) return null;
    // `_ref` declared as `undefined`-only collapses to the default-only path
    if (isNullableOrNever(refType)) return defaultType;
    return commonType(defaultType, refType);
  }

  // shape-only matcher: returns the slot holding the DEFAULT branch
  // ('consequent' / 'alternate'), null when the ternary isn't a self-default pattern.
  // extracted from the resolver so the AST shape detection is testable without binding
  // to a resolver instance
  function matchSelfDefaultTernarySlot(node, scope) {
    const { test, consequent, alternate } = node;
    if (test.type !== 'BinaryExpression') return null;
    const op = test.operator;
    const isInverse = op === '!==' || op === '!=';
    const isLoose = op === '!=' || op === '==';
    if (op !== '===' && op !== '==' && !isInverse) return null;
    const refName = checkSelfTernaryRefName(test.left, test.right, scope, isLoose);
    if (!refName) return null;
    const selfBranch = isInverse ? consequent : alternate;
    if (selfBranch.type !== 'Identifier' || selfBranch.name !== refName) return null;
    return isInverse ? 'alternate' : 'consequent';
  }

  // identify the destructure-ref name from a default-ternary test. supported test shapes:
  //   _ref === void 0 / _ref === undefined           - babel + esbuild strict-eq
  //   typeof _ref === 'undefined'                    - older esbuild / swc
  //   _ref == null (loose only)                      - terser idiom (null OR undefined)
  // each form picks the default for `function ({x = D})`; missing one silently drops the
  // narrow. bare-`undefined` requires scope check (shadowable identifier). NullLiteral
  // RHS is accepted only under loose-eq - strict `_ref === null` would NOT fire default
  // for `undefined` so it isn't a destructure-default shape
  function checkSelfTernaryRefName(left, right, scope, isLoose) {
    if (left.type === 'UnaryExpression' && left.operator === 'typeof'
      && left.argument?.type === 'Identifier' && isUndefinedString(right)) return left.argument.name;
    if (left.type !== 'Identifier') return null;
    if (isVoidZero(right) || isBareUndefined(right, scope)) return left.name;
    if (isLoose && isNullLiteral(right)) return left.name;
    return null;
  }

  function isNullLiteral(node) {
    if (node?.type === 'NullLiteral') return true;
    return node?.type === 'Literal' && node.value === null && !node.regex;
  }

  function isVoidZero(node) {
    return node.type === 'UnaryExpression' && node.operator === 'void'
      && isLiteralOf(node.argument, 'Numeric') && node.argument.value === 0;
  }

  // `undefined` is a read-only global but ECMA still allows local shadowing
  // (`var undefined` / `function (undefined) {}` / `const undefined = X`).
  // `scope.hasBinding` is true for the global itself in babel; `getBinding`
  // returns a descriptor only for a LOCAL binding - the gate that distinguishes
  // bare global-`undefined` from a shadowed identifier
  function isBareUndefined(node, scope) {
    if (!isBareUndefinedIdentifier(node)) return false;
    return !scope?.getBinding?.('undefined');
  }

  // `isLiteralOf(node, 'String')` routes through `babelNodeType` which normalises ESTree
  // `Literal{value: 'undefined'}` (string-typed) to `StringLiteral` - one check covers
  // both parsers. a second branch on raw `node.type === 'Literal'` would be dead - babel
  // emits `StringLiteral` for strings and the normalised first branch already
  // matches ESTree's raw `Literal` shape
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
