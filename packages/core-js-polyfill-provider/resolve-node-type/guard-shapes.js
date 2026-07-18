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
// the assertion form `function assert(x): asserts x is T` to produce VAR-AGNOSTIC guard
// entries (`{ varName, guard }`) that the broader type-guard machinery applies to a binding
// inside the positive branch (for `x is T`) or after the call returns normally (for
// `asserts x is T`).
//
//   parseUserPredicateGuardEntries({ callee, scope, negated, args, call })
//     consumed by the test-resolver to narrow `if (isFoo(x)) { ... }` shapes
//   parseAssertionGuardEntries(sibling)
//     consumed by the preceding-exit guard index for `asserts x is T` statement guards
import { PRIMITIVES, dropLeadingThisParam, peelAssignmentPattern } from './base.js';
import { TS_EXPR_WRAPPERS, unwrapExpressionChain, unwrapSafeSequenceTail } from '../helpers/ast-patterns.js';

const EMPTY_GUARD_ENTRIES = [];

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

// the variable name under a `typeof <var>` expression, peeled through TS wrappers (`as` /
// `satisfies` / `!`), parens, chain, AND SequenceExpression tail (`typeof (0, varName)`
// evaluates the SE prefix for side effects then runs `typeof` on the tail's binding - same
// shape as bare `typeof varName`). null when the operand is not a plain identifier
export function typeofVarName(node) {
  if (node?.type !== 'UnaryExpression' || node.operator !== 'typeof') return null;
  const arg = unwrapSafeSequenceTail(node.argument);
  return arg?.type === 'Identifier' ? arg.name : null;
}

export function isTypeofVar(node, varName) {
  return typeofVarName(node) === varName;
}

// detect `?.` anywhere in a call-expression chain.
// ESTree wraps any optional segment in `ChainExpression`; babel encodes optionality
// via dedicated types (`OptionalCallExpression` / `OptionalMemberExpression`).
// peel ParenthesizedExpression + TS_EXPR_WRAPPERS inline; do NOT use the shared peelers
// that strip `ChainExpression` - that strip would erase the optional signal on ESTree.
// without this dedicated walk, `((asrt as any)?.(x))` as a statement is recognised as
// a non-optional call and incorrectly narrows.
// once a `ChainExpression` wrapper has been stripped (the test-resolver hands us the
// unwrapped call), the optional segment survives only as the `optional: true` boolean on
// the residual ESTree `CallExpression` / `MemberExpression`, so check that flag too
function hasOptionalChainInCall(rawExpr) {
  let cur = rawExpr;
  while (cur) {
    // SE-extracted callee `(0, obj?.assertStr)(x)`: walk SE tail (runtime callee).
    // CallExpression / MemberExpression: optional flag found -> bail; else descend
    // into callee / object respectively.
    // ChainExpression / Optional* types: optional segment found, bail caller.
    // Paren / TS wrappers: peel and continue
    if (TS_EXPR_WRAPPERS.has(cur.type) || cur.type === 'ParenthesizedExpression') {
      cur = cur.expression;
      continue;
    }
    if (cur.optional === true && (cur.type === 'CallExpression' || cur.type === 'MemberExpression')) return true;
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
  getScopeBinding,
  resolveMemberCallChain,
  unwrapTypeAnnotation,
  memberCallReturnAnnotation,
  resolveBindingReturnInfo,
  findAmbientFunctionPaths,
  resolveTypeAnnotation,
}) {
  // the call-arg NAME a `TSTypePredicate` binds: walk fnParams for the slot named
  // `parameterName`, then unwrap `args[slot]` to its Identifier - so `function isStr(opts,
  // x): x is string` paired with `isStr(o, input)` names `input`, never the wrong arg.
  // babel uses `params`, oxc/TS-ESTree uses `parameters` for method sigs; probe both. peel
  // TS expression wrappers (`as`, `!`, parens, chain) AND SE tail on the call-arg so
  // `isStr(o, input as any)` / `isStr(o, (0, input))` still bind to `input`.
  // any `SpreadElement` in args breaks positional mapping (spread length is unknown at
  // compile time, may consume one or many param slots): bail rather than narrow the wrong
  // binding. `isStr(...arr, input)` paired with `(opts, x): x is T` would otherwise map
  // args[1]=input to params[1]=x even though the spread may already have filled `x`
  function predicateArgName({ predicate, fnNode, args }) {
    if (predicate?.parameterName?.type !== 'Identifier') return null;
    // drop a leading `this` pseudo-param (`function isStr(this: void, x): x is T`) so the type-level
    // param slots align with the runtime call args - else the index is off by one and binds the wrong
    // argument, losing the narrow
    const params = dropLeadingThisParam(fnNode?.params ?? fnNode?.parameters);
    if (!params) return null;
    if (args?.some(a => a?.type === 'SpreadElement')) return null;
    const targetName = predicate.parameterName.name;
    for (let i = 0; i < params.length; i++) {
      // peel `AssignmentPattern` so defaulted predicate params (`function isStr(x = ''): x is string`)
      // still match - the inner Identifier holds the parameterName, not the AssignmentPattern itself
      if (peelAssignmentPattern(params[i])?.name !== targetName) continue;
      const arg = args?.[i];
      if (!arg) return null;
      const unwrapped = unwrapSafeSequenceTail(arg);
      return unwrapped?.type === 'Identifier' ? unwrapped.name : null;
    }
    return null;
  }

  // enumerate the function-like declarations a callee may resolve to, paired with their
  // declared return annotation and the lexical scope to resolve type names against. method-
  // form yields a single leaf-member candidate from the dotted chain. identifier-form yields
  // the runtime binding plus all ambient overload siblings (TSDeclareFunction headers) so
  // multi-overload predicates - where only one header carries `x is T` - are still found.
  // ambient list is filtered against the runtime binding to avoid retesting the same node.
  // `unwrapSafeSequenceTail` peels ESTree's `ChainExpression`, TS expression wrappers,
  // parens AND SequenceExpression tail in one step. SE tail is the actual runtime callee
  // (`(side(), isFoo)(x)` invokes `isFoo` with `this=undefined`); the type predicate lives
  // on the bound function regardless of SE-prefix side effects. dedicated-shape branch then
  // matches both `MemberExpression` and babel's `OptionalMemberExpression` (`obj?.isStr`).
  // SE-prefix expressions stay in the AST - emission preserves them via `meta.sideEffects`
  function predicateCandidates(callee, scope) {
    const peeled = unwrapSafeSequenceTail(callee);
    if ((peeled?.type === 'MemberExpression' || peeled?.type === 'OptionalMemberExpression')
      && !peeled.computed
      && peeled.property?.type === 'Identifier') {
      const result = resolveMemberCallChain(peeled, scope);
      if (!result) return [];
      return [{
        fnNode: result.member,
        returnType: unwrapTypeAnnotation(memberCallReturnAnnotation(result.member)),
        scope: result.scope,
      }];
    }
    if (peeled?.type !== 'Identifier') return [];
    const out = [];
    const binding = getScopeBinding(scope, peeled.name);
    const seen = new Set();
    function push(path) {
      if (seen.has(path)) return;
      seen.add(path);
      const info = resolveBindingReturnInfo(path.node);
      if (info) out.push({ fnNode: info.fnNode, returnType: info.returnType, scope: path.scope });
    }
    if (binding) push(binding.path);
    for (const ambient of findAmbientFunctionPaths(peeled.name, scope)) push(ambient);
    return out;
  }

  // resolve a callee to VAR-AGNOSTIC guard entries (`{ varName, guard }`) when its return
  // type is a `TSTypePredicate`. `asserts` flag picks between the two predicate forms:
  //   `x is T`         - narrows only inside the truthy branch (asserts=false)
  //   `asserts x is T` - narrows after the call completes normally (asserts=true)
  // `args` bind `parameterName` to a positional call-arg so non-first-arg predicates
  // (`function isStr(opts, x): x is T`) narrow the right binding. one call may guard SEVERAL
  // names through distinct overload headers - the first candidate to name a variable wins
  // for that variable, mirroring the first-match order a per-name candidate walk had.
  // `optionalCall` tags the guard so the narrower trusts it only in the positive direction
  // (an optional-chained predicate may short-circuit without testing the arg - see below)
  function resolvePredicateGuardEntries({ callee, scope, negated, asserts, args, optionalCall = false }) {
    if (!scope) return EMPTY_GUARD_ENTRIES;
    let entries = null;
    for (const c of predicateCandidates(callee, scope)) {
      if (c.returnType?.type !== 'TSTypePredicate' || !!c.returnType.asserts !== asserts) continue;
      const argName = predicateArgName({ predicate: c.returnType, fnNode: c.fnNode, args });
      if (argName === null || entries?.some(e => e.varName === argName)) continue;
      const resolved = resolveTypeAnnotation(c.returnType.typeAnnotation, c.scope);
      // transport the predicate's ANNOTATION on the guard regardless of its nominal kind:
      // a structural target (interface / type literal) resolves to an UNKNOWN-constructor
      // nominal type whose members no $-Type can carry, so member resolution retries
      // against the annotation node once every nominal path has failed. union filtering
      // treats the annotation-only kind as neutral
      const guard = guardFromResolvedType(resolved, negated)
        ?? { kind: 'annotation', negated };
      guard.annotation = c.returnType.typeAnnotation;
      guard.scope = c.scope;
      if (optionalCall) guard.optionalCall = true;
      (entries ??= []).push({ varName: argName, guard });
    }
    return entries ?? EMPTY_GUARD_ENTRIES;
  }

  // user-defined type predicate: `function isStr(x): x is string`, arrow form, or method
  // assigned to a const. assertion form (`asserts x is T`) goes through the entries resolver
  // with asserts=true via the assertion-statement path below.
  // an optional-chained predicate call (`obj.isStr?.(x)`, `obj?.isStr(x)`, `(p as any)?.(x)`)
  // may short-circuit to `undefined` (falsy) WITHOUT testing x when the receiver is
  // null/undefined. that's sound in the positive (truthy) branch - a truthy result means the
  // call ran and `x is T` held - but UNSOUND in the complement (else / after-return) branch,
  // where the falsy result could be a short-circuit rather than a genuine "not T". gate it
  // exactly as the assertion-statement path does and mark the guard optional so the complement
  // direction is not narrowed. `call` is the full call node (the `?.` lives on it, not on `callee`)
  function parseUserPredicateGuardEntries({ callee, scope, negated, args, call }) {
    const optionalCall = !!call && hasOptionalChainInCall(call);
    return resolvePredicateGuardEntries({ callee, scope, negated, asserts: false, args, optionalCall });
  }

  // `assertArray(x)` as a statement - `asserts x is T` narrows x from that point forward.
  // any-arg-position via predicate.parameterName matching, so `obj.assertStr(opts, input)`
  // with `(opts, x): asserts x is T` narrows `input` (not the first arg). peel callee
  // wrappers (`(0, isStr)`, `((isStr))`, `isStr as any`, `isStr!`) so non-Identifier shapes
  // still reach the binding lookup inside the entries resolver.
  // optional-chain forms (`obj?.assertStr(x)`, `obj.assertStr?.(x)`, `(asrt as any)?.(x)`)
  // do NOT narrow in TS - the assertion may be skipped at runtime when the receiver is
  // null/undefined, so post-statement code can't trust the assertion's signature.
  // `unwrapExpressionChain` peels Paren / SE / TS wrappers in alternation so the runtime
  // call surfaces through any mix: `(side(), assertStr(x))`, `((assertStr(x)))`,
  // `(side(), (assertStr(x) as any))` all reach the same CallExpression. ChainExpression
  // peel inside is safe here because `hasOptionalChainInCall` already ran above
  // var-independent statement classification, cached per node: the sibling guard scans re-ask
  // the same statement for every (use, name) pair, and the optional-chain / unwrap shape walk
  // dominated on large flat scopes. the name-bound predicate tail below stays per-call
  const assertionCallCache = new WeakMap();
  function assertionCallOf(sibling) {
    const { node } = sibling;
    if (node?.type !== 'ExpressionStatement') return null;
    let call = assertionCallCache.get(node);
    if (call === undefined) {
      call = null;
      if (!hasOptionalChainInCall(node.expression)) {
        const candidate = unwrapExpressionChain(node.expression);
        if (candidate?.type === 'CallExpression' && candidate.arguments?.length) call = candidate;
      }
      assertionCallCache.set(node, call);
    }
    return call;
  }

  function parseAssertionGuardEntries(sibling) {
    const call = assertionCallOf(sibling);
    if (!call) return EMPTY_GUARD_ENTRIES;
    const entries = resolvePredicateGuardEntries({
      callee: unwrapExpressionChain(call.callee),
      scope: sibling.scope, negated: false, asserts: true, args: call.arguments,
    });
    for (const { guard } of entries) guard.positive = true;
    return entries;
  }

  return { parseUserPredicateGuardEntries, parseAssertionGuardEntries };
}
