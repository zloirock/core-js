// Type-guard shape primitives + user-defined predicate / assertion narrowing.
//
// Pure top-level exports (no factory closure) - shape builders + AST predicates that both
// `typeof-guards` (uses all four builders) and the predicate path here consume without
// going through factory closure (breaks the predicate <-> typeof guard cycle):
//   typeofGuard(value, negated)              - `typeof x === 'value'` descriptor
//   instanceofGuard(constructorName, negated) - `x instanceof Cls` descriptor
//   guardFromHint(hint, negated)             - lowercase type hint -> typeof; otherwise instanceof
//   guardFromResolvedType(resolved, negated) - resolved Type Object -> guard descriptor
//   isTypeofVar(node, varName)               - `typeof varName` (peeled through TS wrappers)
//
// Factory-shaped surface (`createPredicateGuards`) parses `function isFoo(x): x is T` and
// the assertion form `function assert(x): asserts x is T` to produce guard descriptors that
// the broader type-guard machinery applies to a binding inside the positive branch (for
// `x is T`) or after the call returns normally (for `asserts x is T`).
//
//   parseUserPredicateGuard({ callee, scope, negated, args, varName })
//     consumed by the test-resolver to narrow `if (isFoo(x)) { ... }` shapes
//   parseAssertionStatementGuard(sibling, varName)
//     consumed by the preceding-exit sibling scan for `asserts x is T` statement guards
import { PRIMITIVES } from './base.js';
import { TS_EXPR_WRAPPERS, unwrapExpressionChain, unwrapRuntimeExpr } from '../helpers/ast-patterns.js';

// guard shape builders - single point of truth for the guard descriptor literal
export function typeofGuard(value, negated) {
  return { kind: 'typeof', value, negated };
}
export function instanceofGuard(constructorName, negated) {
  return { kind: 'instanceof', constructorName, negated };
}

// hint convention: lowercase -> typeof guard (primitive), capitalized -> instanceof guard (object)
export function guardFromHint(hint, negated) {
  return PRIMITIVES.has(hint.type) ? typeofGuard(hint.type, negated) : instanceofGuard(hint.type, negated);
}

// convert a resolved type back to a typeof / instanceof guard. types that can't be
// coerced to a primitive or named constructor are dropped (the guard wouldn't help
// polyfill hint inference anyway).
export function guardFromResolvedType(resolved, negated) {
  if (!resolved) return null;
  if (resolved.primitive && PRIMITIVES.has(resolved.type)) return typeofGuard(resolved.type, negated);
  if (resolved.constructor) return instanceofGuard(resolved.constructor, negated);
  return null;
}

// `typeof varName` peeled through TS wrappers (`as` / `satisfies` / `!`) - shared between
// the BinaryExpression branch's left/right peel
export function isTypeofVar(node, varName) {
  if (node?.type !== 'UnaryExpression' || node.operator !== 'typeof') return false;
  const arg = unwrapRuntimeExpr(node.argument);
  return arg?.type === 'Identifier' && arg.name === varName;
}

// detect `?.` anywhere in a call-expression chain.
// ESTree wraps any optional segment in `ChainExpression`; babel encodes optionality
// via dedicated types (`OptionalCallExpression` / `OptionalMemberExpression`).
// run this BEFORE `unwrapRuntimeExpr` strips ChainExpression - that strip would erase
// the signal on the ESTree path.
// Paren + TS wrappers peeled inline (NOT via unwrapRuntimeExpr - that strips
// ChainExpression and would erase the signal). without this, `((asrt as any)?.(x))`
// as a statement is recognised as a non-optional call and incorrectly narrows
function hasOptionalChainInCall(rawExpr) {
  let cur = rawExpr;
  while (cur) {
    // SE-extracted callee `(0, obj?.assertStr)(x)`: walk SE tail (runtime callee).
    // CallExpression / MemberExpression: descend into callee / object respectively.
    // ChainExpression / Optional* types: optional segment found, bail caller.
    // Paren / TS wrappers: peel and continue
    if (TS_EXPR_WRAPPERS.has(cur.type) || cur.type === 'ParenthesizedExpression') {
      cur = cur.expression;
      continue;
    }
    switch (cur.type) {
      case 'ChainExpression':
      case 'OptionalCallExpression':
      case 'OptionalMemberExpression': return true;
      case 'CallExpression': cur = cur.callee; break;
      case 'MemberExpression': cur = cur.object; break;
      case 'SequenceExpression': cur = cur.expressions.at(-1); break;
      default: return false;
    }
  }
  return false;
}

export function createPredicateGuards({
  resolveMemberCallChain,
  unwrapTypeAnnotation,
  memberCallReturnAnnotation,
  resolveBindingReturnInfo,
  findAmbientFunctionPaths,
  resolveTypeAnnotation,
}) {
  // verify a `TSTypePredicate` references the call-arg identified by varName: walk fnParams
  // for the slot named `parameterName`, then check `args[slot]` is `Identifier{varName}`.
  // without this, `function isStr(opts, x): x is string` paired with `isStr(o, input)` would
  // narrow the wrong arg. babel uses `params`, oxc/TS-ESTree uses `parameters` for method sigs;
  // probe both. peel TS expression wrappers (`as`, `!`, parens) on the call-arg so wrapped
  // forms (`isStr(o, input as any)`) still bind.
  // any `SpreadElement` in args breaks positional mapping (spread length is unknown at
  // compile time, may consume one or many param slots): bail rather than narrow the wrong
  // binding. `isStr(...arr, input)` paired with `(opts, x): x is T` would otherwise map
  // args[1]=input to params[1]=x even though the spread may already have filled `x`
  function matchPredicateArg({ predicate, fnNode, args, varName }) {
    if (predicate?.parameterName?.type !== 'Identifier') return false;
    const params = fnNode?.params ?? fnNode?.parameters;
    if (!params) return false;
    if (args?.some(a => a?.type === 'SpreadElement')) return false;
    const targetName = predicate.parameterName.name;
    for (let i = 0; i < params.length; i++) {
      if (params[i]?.name !== targetName) continue;
      const arg = args?.[i];
      if (!arg) return false;
      const unwrapped = unwrapRuntimeExpr(arg);
      return unwrapped?.type === 'Identifier' && unwrapped.name === varName;
    }
    return false;
  }

  // enumerate the function-like declarations a callee may resolve to, paired with their
  // declared return annotation and the lexical scope to resolve type names against. method-
  // form yields a single leaf-member candidate from the dotted chain. identifier-form yields
  // the runtime binding plus all ambient overload siblings (TSDeclareFunction headers) so
  // multi-overload predicates - where only one header carries `x is T` - are still found.
  // ambient list is filtered against the runtime binding to avoid retesting the same node.
  // `unwrapRuntimeExpr` peels ESTree's `ChainExpression`, TS expression wrappers, and
  // parens in one step; the dedicated-shape branch then matches both `MemberExpression`
  // and babel's `OptionalMemberExpression` (`obj?.isStr`) - both resolve identically
  function predicateCandidates(callee, scope) {
    const memberNode = unwrapRuntimeExpr(callee);
    if ((memberNode?.type === 'MemberExpression' || memberNode?.type === 'OptionalMemberExpression')
      && !memberNode.computed
      && memberNode.property?.type === 'Identifier') {
      const result = resolveMemberCallChain(memberNode, scope);
      if (!result) return [];
      return [{
        fnNode: result.member,
        returnType: unwrapTypeAnnotation(memberCallReturnAnnotation(result.member)),
        scope: result.scope,
      }];
    }
    if (callee.type !== 'Identifier') return [];
    const out = [];
    const binding = scope.getBinding(callee.name);
    const seen = new Set();
    const push = path => {
      if (seen.has(path)) return;
      seen.add(path);
      const info = resolveBindingReturnInfo(path.node);
      if (info) out.push({ fnNode: info.fnNode, returnType: info.returnType, scope: path.scope });
    };
    if (binding) push(binding.path);
    for (const ambient of findAmbientFunctionPaths(callee.name, scope)) push(ambient);
    return out;
  }

  // resolve a callee to a guard descriptor when its return type is a `TSTypePredicate`.
  // `asserts` flag picks between the two predicate forms:
  //   `x is T`         - narrows only inside the truthy branch (asserts=false)
  //   `asserts x is T` - narrows after the call completes normally (asserts=true)
  // `args` + `varName` bind `parameterName` to a positional call-arg so non-first-arg
  // predicates (`function isStr(opts, x): x is T`) narrow the right binding
  function resolvePredicateGuard({ callee, scope, negated, asserts, args, varName }) {
    if (!scope) return null;
    for (const c of predicateCandidates(callee, scope)) {
      if (c.returnType?.type !== 'TSTypePredicate' || !!c.returnType.asserts !== asserts) continue;
      if (!matchPredicateArg({ predicate: c.returnType, fnNode: c.fnNode, args, varName })) continue;
      const resolved = resolveTypeAnnotation(c.returnType.typeAnnotation, c.scope);
      const guard = guardFromResolvedType(resolved, negated);
      if (guard) return guard;
    }
    return null;
  }

  // user-defined type predicate: `function isStr(x): x is string`, arrow form, or method
  // assigned to a const. assertion form (`asserts x is T`) goes through `resolvePredicateGuard`
  // with asserts=true via `parseAssertionStatementGuard`
  function parseUserPredicateGuard({ callee, scope, negated, args, varName }) {
    return resolvePredicateGuard({ callee, scope, negated, asserts: false, args, varName });
  }

  // `assertArray(x)` as a statement - `asserts x is T` narrows x from that point forward.
  // any-arg-position via predicate.parameterName matching, so `obj.assertStr(opts, input)`
  // with `(opts, x): asserts x is T` narrows `input` (not the first arg). peel callee
  // wrappers (`(0, isStr)`, `((isStr))`, `isStr as any`, `isStr!`) so non-Identifier shapes
  // still hit the binding-name check inside resolvePredicateGuard.
  // optional-chain forms (`obj?.assertStr(x)`, `obj.assertStr?.(x)`, `(asrt as any)?.(x)`)
  // do NOT narrow in TS - the assertion may be skipped at runtime when the receiver is
  // null/undefined, so post-statement code can't trust the assertion's signature.
  // `unwrapExpressionChain` peels Paren / SE / TS wrappers in alternation so the runtime
  // call surfaces through any mix: `(side(), assertStr(x))`, `((assertStr(x)))`,
  // `(side(), (assertStr(x) as any))` all reach the same CallExpression. ChainExpression
  // peel inside is safe here because `hasOptionalChainInCall` already ran above
  function parseAssertionStatementGuard(sibling, varName) {
    if (sibling.node?.type !== 'ExpressionStatement') return null;
    if (hasOptionalChainInCall(sibling.node.expression)) return null;
    const call = unwrapExpressionChain(sibling.node.expression);
    if (call?.type !== 'CallExpression' || !call.arguments?.length) return null;
    const guard = resolvePredicateGuard({
      callee: unwrapExpressionChain(call.callee),
      scope: sibling.scope, negated: false, asserts: true, args: call.arguments, varName,
    });
    if (guard) guard.positive = true;
    return guard;
  }

  return { parseUserPredicateGuard, parseAssertionStatementGuard };
}
