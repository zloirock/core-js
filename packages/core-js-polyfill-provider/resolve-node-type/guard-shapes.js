// Type-guard shape primitives + user-defined predicate / assertion narrowing.
//
// Pure top-level exports (no factory closure) - the guard DESCRIPTOR builders and AST predicates
// that both `typeof-guards` and the predicate path here consume without going through factory
// closure (breaks the predicate <-> typeof guard cycle). the descriptor is built HERE and nowhere
// else, one builder per kind:
//   typeofGuard(value, negated)               - `typeof x === 'value'`
//   instanceofGuard(constructorName, negated) - `x instanceof Cls`
//   typeofOrGuard(values, negated)            - `typeof x === 'a' || typeof x === 'b'`
//   annotationGuard(negated)                  - a predicate whose target no nominal kind carries
//   guardFromHint(hint, negated)              - lowercase type hint -> typeof; otherwise instanceof
//   guardFromResolvedType(resolved, negated)  - resolved Type Object -> guard descriptor
// the record's fields: `kind` and the kind's payload (`value` / `constructorName` / `values`);
// `negated` - the parser's polarity INPUT (the test's own `!` and `!==`), folded with the branch
// into `positive` by `stampPolarity` and read by nothing after that fold; `positive` - the whole
// polarity every consumer reads; and two optional stamps - `optionalCall` (`markOptionalCall`: the
// guard's call may have short-circuited without testing its argument, so it is trusted only where
// it provably ran) and `annotation` / `scope` (a predicate's declared target, for member resolution)
//   isTypeofVar(node, varName)                - `typeof varName` (peeled through TS wrappers)
//
// Factory-shaped surface (`createPredicateGuards`) parses `function isFoo(x): x is T` and
// the assertion form `function assert(x): asserts x is T` to produce VAR-AGNOSTIC guard
// entries (`{ varName, guard }`) that the broader type-guard machinery applies to a binding
// inside the positive branch (for `x is T`) or after the call returns normally (for
// `asserts x is T`).
//
//   parseUserPredicateGuardEntries({ callee, scope, negated, args, optionalCall })
//     consumed by the test-resolver to narrow `if (isFoo(x)) { ... }` shapes
//   parseAssertionGuardEntries(sibling)
//     consumed by the preceding-exit guard index for `asserts x is T` statement guards
import { PRIMITIVES, dropLeadingThisParam } from './base.js';
import {
  discriminateOverloadsByArgs,
  isImplementationSignature,
  keywordPrimitiveKind,
  literalArgKind,
} from './ast-shapes.js';
import {
  getTypeArgs,
  patternSlotTarget,
  spreadAtOrBefore,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  unwrapExpressionChain,
  unwrapSafeSequenceTail,
} from '../helpers/ast-patterns.js';

const EMPTY_GUARD_ENTRIES = [];

// guard shape builders - single point of truth for the guard descriptor literal, one per kind.
// `typeof x === 'value'`
export function typeofGuard(value, negated) {
  return { kind: 'typeof', value, negated };
}

// `x instanceof Cls`
export function instanceofGuard(constructorName, negated) {
  return { kind: 'instanceof', constructorName, negated };
}

// `typeof x === 'a' || typeof x === 'b'` - the value is ONE of `values`
export function typeofOrGuard(values, negated) {
  return { kind: 'typeof-or', values, negated };
}

// a predicate whose declared target no nominal kind carries (an interface, a type literal): neutral
// for union filtering, its `annotation` stamp is what member resolution retries against
export function annotationGuard(negated) {
  return { kind: 'annotation', negated };
}

// the polarity fold: a guard holds in a branch iff the branch took the test's truthy side XOR the
// test itself negated it. the ONE writer of `positive`
export function stampPolarity(guard, conditionTrue) {
  guard.positive = conditionTrue !== guard.negated;
  return guard;
}

// the ONE writer of `optionalCall` - absent, not false, on a guard whose call always ran
export function markOptionalCall(guard, optionalCall) {
  if (optionalCall) guard.optionalCall = true;
  return guard;
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

// may this CALL not run at all - does a `?.` anywhere on its chain short-circuit it? the question
// beside `receiverCarriesLiveOptional`'s, and a different one: that walk asks whether a receiver's
// short-circuit reaches what FOLLOWS it, so source parens end it (`(a?.b).c` throws natively); here
// a paren around the call leaves the call's own `?.` live (`(f?.(x))` skips the assertion when `f`
// is nullish), so parens are peeled and the walk goes on, and a `?.` sealed in the callee's
// receiver is taken as short-circuiting too - a sealed `(a?.b).assert(x)` would throw rather than
// skip, so the conservative answer only forgoes a narrow.
// ESTree wraps any optional segment in `ChainExpression`; babel encodes optionality via dedicated
// types (`OptionalCallExpression` / `OptionalMemberExpression`). once a `ChainExpression` wrapper
// has been stripped (the test-resolver hands over the unwrapped call), the optional segment
// survives only as the `optional: true` boolean on the residual ESTree `CallExpression` /
// `MemberExpression`, so that flag is checked too. an SE-extracted callee `(0, obj?.assertStr)(x)`
// walks the SE tail (the runtime callee)
export function hasOptionalChainInCall(rawExpr) {
  let cur = rawExpr;
  while (cur) {
    if (TRANSPARENT_EXPR_WRAPPER_TYPES.has(cur.type)) {
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
  memberCallParams,
  resolveBindingReturnInfo,
  findAmbientFunctionPaths,
  findBindingAnnotation,
  resolveTypeAnnotation,
}) {
  // what the call says about an argument's TYPE with no path to resolve it through: a literal spells
  // its own kind, an identifier bound with a keyword annotation spells that kind. a TOP annotation
  // (`unknown` / `any`) says NOTHING, and in particular does not refute a narrower param: the guard
  // parser holds no path, so it cannot see the narrowing in force at the call site, and TS selects the
  // arm that narrowing fits. reading the declared `unknown` as a refutation picked a foreign arm.
  // the primitive kinds and the tops are disjoint keyword sets, so that silence is what the kind
  // reader already answers - a top of its own here would only spell the same null twice
  function argKindOf(argNode, scope) {
    const literalKind = literalArgKind(argNode);
    if (literalKind !== null) return literalKind;
    const unwrapped = unwrapSafeSequenceTail(argNode);
    if (unwrapped.type !== 'Identifier') return null;
    const binding = getScopeBinding(scope, unwrapped.name);
    const annotation = binding ? unwrapTypeAnnotation(findBindingAnnotation(binding.path)) : null;
    return keywordPrimitiveKind(annotation);
  }

  // the call-arg NAME a `TSTypePredicate` binds: walk the params for the slot named
  // `parameterName`, then unwrap `args[slot]` to its Identifier - so `function isStr(opts,
  // x): x is string` paired with `isStr(o, input)` names `input`, never the wrong arg. peel
  // TS expression wrappers (`as`, `!`, parens, chain) AND SE tail on the call-arg so
  // `isStr(o, input as any)` / `isStr(o, (0, input))` still bind to `input`.
  // a spread AT or BEFORE the slot shifts it (`isStr(...arr, input)` may already have filled
  // `x`), so positional binding is undecidable there; a spread after the slot leaves it in place
  function predicateArgName({ predicate, params, args }) {
    if (predicate?.parameterName?.type !== 'Identifier') return null;
    // drop a leading `this` pseudo-param (`function isStr(this: void, x): x is T`) so the type-level
    // param slots align with the runtime call args - else the index is off by one and binds the wrong
    // argument, losing the narrow
    const runtimeParams = dropLeadingThisParam(params);
    const targetName = predicate.parameterName.name;
    // peel `AssignmentPattern` so defaulted predicate params (`function isStr(x = ''): x is string`)
    // still match - the inner Identifier holds the parameterName, not the AssignmentPattern itself
    const slot = runtimeParams.findIndex(param => patternSlotTarget(param).name === targetName);
    if (slot === -1 || spreadAtOrBefore(args, slot)) return null;
    const unwrapped = unwrapSafeSequenceTail(args[slot]);
    return unwrapped?.type === 'Identifier' ? unwrapped.name : null;
  }

  // enumerate the signatures a callee may resolve to - `{ fnNode, params, returnType, scope }`,
  // with the declared return annotation, the parameter list read off whichever slot the
  // declaration shape keeps it in, and the lexical scope to resolve type names against. member-
  // form yields every same-named callable member of the dotted chain's leaf (an overload set is a
  // set); identifier-form yields the runtime binding plus all ambient overload siblings
  // (TSDeclareFunction headers) so multi-overload predicates - where only one header carries
  // `x is T` - are still found. ambient list is filtered against the runtime binding to avoid
  // retesting the same node.
  // `unwrapSafeSequenceTail` peels ESTree's `ChainExpression`, TS expression wrappers,
  // parens AND SequenceExpression tail in one step. SE tail is the actual runtime callee
  // (`(side(), isFoo)(x)` invokes `isFoo` with `this=undefined`); the type predicate lives
  // on the bound function regardless of SE-prefix side effects. dedicated-shape branch then
  // matches both `MemberExpression` and babel's `OptionalMemberExpression` (`obj?.isStr`).
  // SE-prefix expressions stay in the AST - emission preserves them via `meta.sideEffects`.
  // a member callee resolves through the receiver's ANNOTATION chain: an instance of a concrete
  // class (`new C()`) carries none and contributes no signature
  function predicateCandidates(callee, scope) {
    const peeled = unwrapSafeSequenceTail(callee);
    if ((peeled?.type === 'MemberExpression' || peeled?.type === 'OptionalMemberExpression')
      && !peeled.computed
      && peeled.property?.type === 'Identifier') {
      const result = resolveMemberCallChain(peeled, scope);
      if (!result) return [];
      return result.members.map(member => ({
        fnNode: member,
        params: memberCallParams(member),
        returnType: unwrapTypeAnnotation(memberCallReturnAnnotation(member)),
        scope: result.scope,
      }));
    }
    if (peeled?.type !== 'Identifier') return [];
    const out = [];
    const binding = getScopeBinding(scope, peeled.name);
    const seen = new Set();
    function push(path) {
      if (seen.has(path)) return;
      seen.add(path);
      const info = resolveBindingReturnInfo(path.node);
      // a TSFunctionType binding-annotation keeps its params under `parameters` on babel 7, and
      // Flow's `DeclareFunction` - an ambient shape this list admits - carries neither slot
      if (!info) return;
      const { fnNode, returnType } = info;
      out.push({ fnNode, params: fnNode.params ?? fnNode.parameters ?? null, returnType, scope: path.scope });
    }
    if (binding) push(binding.path);
    for (const ambient of findAmbientFunctionPaths(peeled.name, scope)) push(ambient);
    return out;
  }

  // the guard entry ONE signature contributes to this call, or null when it contributes none: a
  // return that is not the asked predicate form, or a predicate naming a param the call fills with
  // no plain identifier. the predicate's ANNOTATION rides on the guard regardless of its nominal
  // kind: a structural target (interface / type literal) resolves to an UNKNOWN-constructor
  // nominal type whose members no $-Type can carry, so member resolution retries against the
  // annotation node once every nominal path has failed. union filtering treats the annotation-only
  // kind as neutral
  function predicateEntryOf({ fnNode, params, returnType, scope }, { negated, asserts, args, optionalCall }) {
    if (returnType?.type !== 'TSTypePredicate' || !!returnType.asserts !== asserts) return null;
    const varName = predicateArgName({ predicate: returnType, params, args });
    if (varName === null) return null;
    const guard = guardFromResolvedType(resolveTypeAnnotation(returnType.typeAnnotation, scope), negated) ?? annotationGuard(negated);
    guard.annotation = returnType.typeAnnotation;
    guard.scope = scope;
    return { varName, guard: markOptionalCall(guard, optionalCall), fnNode };
  }

  // two signatures agree when they narrow the same argument to the same nominal target. what the
  // annotation adds to it - the members a structural target carries, the type arguments a built-in
  // carries - is `sharedAnnotation`'s: a bare structural target (a type literal, no nominal at all)
  // agrees on nothing but its own node, and without it the guard is neutral
  function sameGuardTarget(a, b) {
    return a.varName === b.varName && a.guard.kind === b.guard.kind && a.guard.value === b.guard.value
      && a.guard.constructorName === b.guard.constructorName;
  }

  // the annotation two agreeing heads both spell, or null: two bare references to one name (the
  // heads share a scope, so one name is one declaration; a parameterised reference carries its own
  // arguments). an agreed nominal whose heads spell different annotations goes bare - the
  // first head's members or type arguments are not what the other head's runtime value carries
  function sharedAnnotation(a, b) {
    const [ra, rb] = [unwrapTypeAnnotation(a), unwrapTypeAnnotation(b)];
    if (ra?.type !== 'TSTypeReference' || rb?.type !== 'TSTypeReference' || getTypeArgs(ra) || getTypeArgs(rb)) return null;
    return ra.typeName.type === 'Identifier' && rb.typeName.type === 'Identifier' && ra.typeName.name === rb.typeName.name ? a : null;
  }

  // resolve a callee to VAR-AGNOSTIC guard entries (`{ varName, guard }`) when the signature the
  // call resolves to returns a `TSTypePredicate`. `asserts` picks between the two predicate forms:
  //   `x is T`         - narrows only inside the truthy branch (asserts=false)
  //   `asserts x is T` - narrows after the call completes normally (asserts=true)
  // TS resolves the call to ONE signature - the first whose params accept the args - so the
  // overload set goes through the canonical discrimination over the call's argument NODES (literal-
  // and arity-aware, plus what an identifier argument's own annotation says; this parser holds no
  // paths to resolve an argument through), and the implementation signature of an overloaded
  // function is no candidate: callers never see
  // it. the selected signature alone narrows, and only if it is a predicate; when the args pin
  // no single arm, every arm they do not refute must name the same argument and the same target,
  // else the call narrows nothing - a guard picked off one arm would emit a type-specific helper
  // on a foreign runtime value; the annotation behind the agreed target rides along only when the
  // arms spell one. `optionalCall` tags the guards so the narrower trusts them only in
  // the positive direction (see `parseUserPredicateGuardEntries`)
  function resolvePredicateGuardEntries({ callee, scope, negated, asserts, args, optionalCall = false }) {
    if (!scope) return EMPTY_GUARD_ENTRIES;
    const declared = predicateCandidates(callee, scope);
    const heads = declared.filter(c => !isImplementationSignature(c.fnNode));
    const { selected, candidates } = discriminateOverloadsByArgs(heads.length ? heads : declared, c => c.params,
      args, args.map(arg => argKindOf(arg, scope)));
    let entry = null;
    for (const arm of selected ? [selected] : candidates) {
      const armEntry = predicateEntryOf(arm, { negated, asserts, args, optionalCall });
      if (!armEntry || (entry && !sameGuardTarget(entry, armEntry))) return EMPTY_GUARD_ENTRIES;
      if (entry) entry.guard.annotation = sharedAnnotation(entry.guard.annotation, armEntry.guard.annotation);
      entry ??= armEntry;
    }
    return entry ? [{ varName: entry.varName, guard: entry.guard }] : EMPTY_GUARD_ENTRIES;
  }

  // user-defined type predicate: `function isStr(x): x is string`, arrow form, or method
  // assigned to a const. assertion form (`asserts x is T`) goes through the entries resolver
  // with asserts=true via the assertion-statement path below.
  // an optional-chained predicate call (`obj.isStr?.(x)`, `obj?.isStr(x)`, `(p as any)?.(x)`)
  // may short-circuit to `undefined` (falsy) WITHOUT testing x when the receiver is
  // null/undefined. that's sound in the positive (truthy) branch - a truthy result means the
  // call ran and `x is T` held - but UNSOUND in the complement (else / after-return) branch,
  // where the falsy result could be a short-circuit rather than a genuine "not T". the caller
  // decides `optionalCall` once for the call node (the `?.` lives on it, not on `callee`) and
  // hands it to every lane, so the built-in hint lane and this one mark alike
  function parseUserPredicateGuardEntries({ callee, scope, negated, args, optionalCall }) {
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
  let assertionCallCache = new WeakMap();
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

  // an `asserts` statement has no complement branch: its guards hold from the statement on
  function parseAssertionGuardEntries(sibling) {
    const call = assertionCallOf(sibling);
    if (!call) return EMPTY_GUARD_ENTRIES;
    const entries = resolvePredicateGuardEntries({
      callee: unwrapExpressionChain(call.callee),
      scope: sibling.scope, negated: false, asserts: true, args: call.arguments,
    });
    for (const { guard } of entries) stampPolarity(guard, true);
    return entries;
  }

  // every per-file cache in the factory is rebuilt at the parser-level entry so the memory
  // footprint stays deterministic; this cluster owned one without publishing the hook
  function reset() {
    assertionCallCache = new WeakMap();
  }

  return { parseUserPredicateGuardEntries, parseAssertionGuardEntries, reset };
}
