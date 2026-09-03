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
//                                                       literal-keyed + the canon's structural
//                                                       fold + alias-to-literal + enum-member
//                                                       access)
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
import { computedKeyStaticName, isNullLiteralNode } from '../helpers/ast-patterns.js';
import { $Primitive, primitiveTypeOf } from './base.js';
import { isBareUndefinedIdentifier } from './ast-shapes.js';

// kind-level result of a binary operator given operand primitive kinds. THE single source
// of operator semantics - the path-level resolver below, the expression dispatch and the
// node-level enum-member classifier all consume it (hand-rolled copies drifted: one
// reported operand kinds for coercing arithmetic and missed bigint entirely). operand
// kinds come through THUNKS so the cases that decide without them (comparisons, `>>>`)
// skip operand resolution
export function binaryOperatorResultKind(operator, leftKindOf, rightKindOf) {
  switch (operator) {
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
      return 'boolean';
    case '+': {
      const left = leftKindOf();
      const right = rightKindOf();
      if (left === 'string' || right === 'string') return 'string';
      if (left === 'number' && right === 'number') return 'number';
      if (left === 'bigint' && right === 'bigint') return 'bigint';
      return 'unknown';
    }
    // >>> (unsigned right shift) throws on BigInt, result is always Number
    case '>>>':
      return 'number';
    // arithmetic and bitwise operators work on both Number and BigInt; mixing them throws,
    // so knowing one operand's kind determines the result - `number` when unresolvable, an
    // acceptable assumption within core-js
    case '-':
    case '*':
    case '/':
    case '%':
    case '**':
    case '|':
    case '&':
    case '^':
    case '<<':
    case '>>':
      return leftKindOf() === 'bigint' || rightKindOf() === 'bigint' ? 'bigint' : 'number';
  }
  return null;
}

// kind-level result of a unary operator given the argument's primitive kind (thunked for
// the same laziness). `-` / `~` preserve Number vs BigInt; unary `+` throws on BigInt, so
// it is always Number
export function unaryOperatorResultKind(operator, argKindOf) {
  switch (operator) {
    case 'void':
      return 'undefined';
    case 'typeof':
      return 'string';
    case '!':
    case 'delete':
      return 'boolean';
    case '+':
      return 'number';
    case '-':
    case '~':
      return argKindOf() === 'bigint' ? 'bigint' : 'number';
  }
  return null;
}

// shape-only matcher for the destructuring-default desugar ternary: positive
// `_ref === void 0 ? D : _ref` (babel) and inverse `_ref !== void 0 ? _ref : D`
// (esbuild / swc / terser), plus the `typeof _ref === 'undefined'` and loose `== null`
// test spellings. returns the slot holding the DEFAULT branch ('consequent' /
// 'alternate'), null when the ternary isn't a self-default pattern. module-level so
// value-identity predicates (the alias-init resolvers) share ONE canon with the
// resolver; `isLocalUndefinedName` lets the caller reject a shadowed bare `undefined`
export function matchSelfDefaultTernarySlot(node, { isLocalUndefinedName = () => false } = {}) {
  const { test, consequent, alternate } = node;
  if (test?.type !== 'BinaryExpression') return null;
  const op = test.operator;
  const isInverse = op === '!==' || op === '!=';
  const isLoose = op === '!=' || op === '==';
  if (op !== '===' && op !== '==' && !isInverse) return null;
  const refName = selfTernaryRefName(test.left, test.right, isLoose, isLocalUndefinedName);
  if (!refName) return null;
  const selfBranch = isInverse ? consequent : alternate;
  if (selfBranch?.type !== 'Identifier' || selfBranch.name !== refName) return null;
  return isInverse ? 'alternate' : 'consequent';
}

// shape-only matcher for the ctor-identity narrow the emitters render over a shadowed static read
// (`h === Array ? _Array$from : h.from`): the consequent is the pure static's import binding, the
// alternate the source's own member read off the tested host. answers the ALTERNATE - the read the
// type layer asks about, exactly as the flat spelling `h.from(...)` would - or null. the
// multi-branch render (an alternate that is itself such a guard) is a union receiver and stays
// outside the match. `isPureStaticBinding(name, key)` answers whether the consequent names the pure
// import of the static `key`; the shape alone must not vouch for a user-written ternary
export function matchCtorIdentityNarrowAlternate(node, isPureStaticBinding) {
  const { test, consequent, alternate } = node;
  if (test?.type !== 'BinaryExpression' || test.operator !== '===') return null;
  if (test.left?.type !== 'Identifier' || consequent?.type !== 'Identifier') return null;
  if (alternate?.type !== 'MemberExpression' || alternate.computed) return null;
  if (alternate.object?.type !== 'Identifier' || alternate.object.name !== test.left.name) return null;
  if (alternate.property?.type !== 'Identifier') return null;
  return isPureStaticBinding(consequent.name, alternate.property.name) ? alternate : null;
}

// equality has no operand order, and neither do the tools that emit these tests: a lowering writes
// `_ref === void 0`, a hand-written or minified guard just as readily `void 0 === _ref`. one
// directional predicate asked BOTH ways rather than a second set of arms - a missed spelling costs
// the fold and leaves the receiver generic, so the asymmetry was silent
function selfTernaryRefName(left, right, isLoose, isLocalUndefinedName) {
  return selfTernaryRefNameOrdered(left, right, isLoose, isLocalUndefinedName)
    ?? selfTernaryRefNameOrdered(right, left, isLoose, isLocalUndefinedName);
}

function selfTernaryRefNameOrdered(ref, probe, isLoose, isLocalUndefinedName) {
  if (ref?.type === 'UnaryExpression' && ref.operator === 'typeof'
    && ref.argument?.type === 'Identifier' && isStringLiteralValue(probe, 'undefined')) return ref.argument.name;
  if (ref?.type !== 'Identifier') return null;
  if (isVoidZeroNode(probe)) return ref.name;
  if (isBareUndefinedIdentifier(probe) && !isLocalUndefinedName()) return ref.name;
  // a strict `=== null` is NOT a nullish default: it leaves `undefined` on the self branch, so the
  // fold would collapse to a default the runtime never takes
  if (isLoose && isNullLiteralNode(probe)) return ref.name;
  return null;
}

function isStringLiteralValue(node, value) {
  return (node?.type === 'StringLiteral' || (node?.type === 'Literal' && typeof node.value === 'string'))
    && node.value === value;
}

function isVoidZeroNode(node) {
  if (node?.type !== 'UnaryExpression' || node.operator !== 'void') return false;
  const arg = node.argument;
  return (arg?.type === 'NumericLiteral' || (arg?.type === 'Literal' && typeof arg.value === 'number'))
    && arg.value === 0;
}

export function createValueOps({
  getScopeBinding,
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
    // the STRUCTURAL fold is the canon's - a sequence tail, a `+` concat, a template, nested in any
    // combination - so the type layer names a key exactly as the detection side does. spelled here
    // as its own shorter list it answered `Array['o' + 'f'](5)` with no name at all, and the
    // instance read above it lost the array narrow its dotted twin keeps. the SCOPE-dependent
    // resolutions below are deliberately not part of that canon and stay this layer's own
    return literalKeyValue(property)
      ?? singleQuasiString(property)
      ?? computedKeyStaticName(property)
      ?? literalKeyValue(resolved)
      ?? singleQuasiString(resolved)
      ?? resolveComputedKeyName(property, path.scope);
  }

  // a resolved type whose runtime value can never be falsy: any non-primitive (object / array /
  // function) or a symbol. `unknown` stays a primitive-kind resolution, so imprecise resolutions
  // never fold; `document.all` (HTMLAllCollection) is the one falsy object - never fold it. the
  // spelling tested here comes from the `all: 'HTMLAllCollection'` entry in
  // `known-built-in-return-types` - that entry is load-bearing, and "correcting" it to
  // HTMLCollection would silently restore the truthy fold
  function isAlwaysTruthyType(resolved) {
    if (resolved.primitive) return resolved.type === 'symbol';
    return !/^htmlallcollection$/i.test(resolved.constructor ?? '');
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
    // an ALWAYS-TRUTHY left decides a logical statically: `A || B` / `A ?? B` is always A,
    // `A && B` is always B - so the two-operand union injected entries the runtime value never
    // has (`{ map } = Array.prototype || {}` pulled the Iterator variant). `?:` keeps its
    // union - the ternary test is independent of the branch values.
    // a mayBeNullish left (a nullish-STRIPPED resolution, e.g. `r: number[] | null`) is NOT
    // always truthy at runtime: on the nullish path `A || B` / `A ?? B` yields the RIGHT
    // operand, so folding to left would emit a type-specific Maybe for a receiver the runtime
    // never guarantees (ie:11 TypeError). `&&` keeps its right-fold even then - a nullish
    // left short-circuits to a nullish RESULT, which throws the same TypeError transformed
    // or not (same rationale as the `?:` nullable-branch fold below) - but the fold survivor
    // is marked: `A && B` with a nullish-capable A may be nullish at runtime, so an enclosing
    // `||`/`??` fold must keep its two-operand union (`(r && arr) || s` may yield s - folding
    // to the array operand emits a wrong type-specific Maybe on a runtime string)
    if (left && isAlwaysTruthyType(left)) {
      if ((op === '||' || op === '||=' || op === '??' || op === '??=') && !left.mayBeNullish) return left;
      if (op === '&&' || op === '&&=') return right && left.mayBeNullish ? right.mark('mayBeNullish') : right;
    }
    // ternary: a statically-nullable branch folds away for polyfill purposes - the
    // surviving branch's instance helpers are Maybe-dispatched, and a null receiver
    // throws the same TypeError transformed or not. mirrors the cross-return nullable
    // fold in return-type, so `c ? arr : null` narrows like `if (c) return arr; return null`.
    // the folded value may still be nullish at runtime, so the survivor is marked for
    // an enclosing logical fold (`(c ? arr : null) ?? 'x'` must not fold to Array)
    if (left && right && op === '?:') {
      if (isNullableOrNever(left)) return right.mark('mayBeNullish');
      if (isNullableOrNever(right)) return left.mark('mayBeNullish');
    }
    if (!left || !right) return null;
    // commonType propagates mayBeNullish from either operand to the merged result
    return commonType(left, right);
  }

  // recognise the destructuring-default desugar shape: positive `_ref === void 0 ? D : _ref`
  // (babel) and inverse `_ref !== void 0 ? _ref : D` (esbuild / swc / terser). result type
  // folds default + _ref via `commonType` - an untyped or unrelated-typed `_ref` collapses
  // to null so the caller falls through to the standard `?:` union fold rather than emitting
  // an unsound Maybe-array narrow against a caller-controlled value
  function resolveDesugarDefaultTernary(path) {
    const slot = matchSelfDefaultTernarySlotBound(path.node, path.scope);
    if (!slot) return null;
    const defaultType = resolveNodeType(path.get(slot));
    if (!defaultType) return null;
    const refType = resolveNodeType(path.get(slot === 'consequent' ? 'alternate' : 'consequent'));
    if (!refType) return null;
    // `_ref` declared as `undefined`-only collapses to the default-only path
    if (isNullableOrNever(refType)) return defaultType;
    return commonType(defaultType, refType);
  }

  // scope-bound delegate to the module-level canon: `undefined` is a read-only global
  // but ECMA still allows local shadowing (`var undefined` / `function (undefined) {}`),
  // and `getBinding` returns a descriptor only for a LOCAL binding - the gate that
  // distinguishes bare global-`undefined` from a shadowed identifier
  function matchSelfDefaultTernarySlotBound(node, scope) {
    return matchSelfDefaultTernarySlot(node, {
      isLocalUndefinedName: () => !!getScopeBinding(scope, 'undefined'),
    });
  }

  // `isLiteralOf(node, 'String')` routes through `babelNodeType` which normalises ESTree
  function resolveBinaryOperatorType(operator, leftPath, rightPath) {
    const kind = binaryOperatorResultKind(
      operator,
      () => primitiveTypeOf(resolveNodeType(leftPath)),
      () => primitiveTypeOf(resolveNodeType(rightPath)),
    );
    return kind ? new $Primitive(kind) : null;
  }

  return {
    resolveNumericType,
    resolveMemberPropertyName,
    resolveUnionType,
    resolveDesugarDefaultTernary,
    resolveBinaryOperatorType,
  };
}
