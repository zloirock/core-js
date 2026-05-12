// Guard-based type narrowing. consumes the typeof / instanceof / predicate guards produced
// by `typeof-guards` + `guard-shapes` and either:
//   - filters a union annotation's branches down to the surviving members, or
//   - synthesises a Type from the positive guards alone (when no annotation exists).
//
// Public surface:
//   resolveTypeGuardNarrowing(path) - returns a narrowed Type for an Identifier path, or
//                                     null if no guards apply / mutations invalidate them
//   findGuardsForBinding(path)      - guards + classification triple; cached per AST node
//   matchesTypeofValue / matchesGuard - low-level predicates (used internally + reusable)
//   reset()                         - per-file cache invalidation
//
// `hasMutationAfterGuards` / `hasMutationInCapturedFunction` are the soundness filters:
//   - mutation between the nearest invalidating guard and the usage drops the narrowing
//     (the binding could have been reassigned to a different shape between the check and
//     the access)
//   - mutation inside any nested function captured from the binding's scope drops it too
//     (deferred calls may fire between the guard and the usage)
//
// Service object: ~15 entries spanning factory function decls (`resolveTypeAnnotation`,
// `commonType`, etc.), cluster outputs from `typeof-guards` (the guard finders) and
// `type-subst` (`followTypeAliasChain`, plus the late-bound `applyAliasSubstDeep` via thunk).
import { $Object, $Primitive, PRIMITIVES } from './base.js';

export function createNarrowByGuards({
  t,
  resolveTypeAnnotation,
  isNullableOrNever,
  commonType,
  resolveKnownConstructor,
  findBindingAnnotation,
  followTypeAliasChain,
  applyAliasSubstDeep,
  findEnclosingTypeGuards,
  guardAppliesToBinding,
  siblingGuardsBinding,
  findConditionalGuards,
  findSwitchCaseGuards,
  findEarlyExitGuards,
  getStatementSiblings,
}) {
  function matchesTypeofValue(resolved, value) {
    if (value === 'object') return (!resolved.primitive && resolved.constructor !== 'Function') || resolved.type === 'null';
    if (value === 'function') return resolved.constructor === 'Function';
    return resolved.primitive && resolved.type === value;
  }

  function matchesGuard(resolved, guard) {
    if (guard.kind === 'typeof') return matchesTypeofValue(resolved, guard.value);
    if (guard.kind === 'typeof-or') {
      for (const value of guard.values) if (matchesTypeofValue(resolved, value)) return true;
      return false;
    }
    return !resolved.primitive && resolved.constructor === guard.constructorName;
  }

  // resolve the type a guard implies: typeof 'string' -> $Primitive('string'),
  // instanceof Array -> $Object('Array')
  function resolveGuardType(guard) {
    if (guard.kind === 'typeof') {
      if (PRIMITIVES.has(guard.value)) return new $Primitive(guard.value);
      if (guard.value === 'function') return new $Object('Function');
      // 'object' is too ambiguous - could be Array, Map, Set, Date, null, etc.
      return null;
    }
    if (guard.kind === 'instanceof') return resolveKnownConstructor(guard.constructorName);
    return null;
  }

  // filter candidate types by guards, return the unique surviving type or null
  function narrowByGuards(candidates, guards) {
    let result = null;
    for (const resolved of candidates) {
      if (!resolved) continue;
      if (isNullableOrNever(resolved)) continue;
      if (!guards.every(guard => matchesGuard(resolved, guard) === guard.positive)) continue;
      result = commonType(result, resolved);
      if (!result) return null;
    }
    return result;
  }

  // check whether any reassignment of binding could execute between a guard check and usagePath
  function hasMutationAfterGuards(binding, usagePath, varName) {
    const { constantViolations } = binding;
    const usageStart = usagePath.node.start;
    function isDescendantOf(path, scope) {
      for (let p = path; p; p = p.parentPath) if (p === scope) return true;
      return false;
    }
    // missing source positions (synthetic AST nodes) - conservatively assume mutation
    // is positionally before usage so narrowing drops rather than over-keeps
    function isBefore(v) {
      return v.node.start === null || v.node.start === undefined
        || usageStart === null || usageStart === undefined || v.node.start < usageStart;
    }
    function violates(scope) {
      return constantViolations.some(v => isDescendantOf(v, scope));
    }
    function violatesBefore(scope) {
      return constantViolations.some(v => isDescendantOf(v, scope) && isBefore(v));
    }
    // early-exit-guard invalidation: only the NEAREST guard to usage matters - closer
    // guards re-narrow the binding independently of older guards' invalidation, and the
    // mutation window `(nearestIdx, current.key]` (incl. prefix of current sibling before
    // usage) is the only window that can invalidate runtime narrowing. older guards are
    // subsumed; their invalidation by mutations BEFORE the nearest guard is irrelevant
    function earlyExitInvalidates(current, siblings) {
      let nearestIdx = -1;
      for (let i = current.key - 1; i >= 0; i--) {
        if (siblingGuardsBinding(siblings[i], varName)) {
          nearestIdx = i;
          break;
        }
      }
      if (nearestIdx < 0) return false;
      for (let j = nearestIdx + 1; j < current.key; j++) if (violates(siblings[j])) return true;
      return violatesBefore(siblings[current.key]);
    }
    // a fresh inner conditional whose guard has no mutations between it and the usage
    // re-narrows at runtime regardless of outer-scope mutations - the inner guard's
    // condition re-evaluates after any outer-scope reassignment. once seen, outer-level
    // mutations don't invalidate narrowing
    let innerFreshConditional = false;
    for (let current = usagePath, parent; (parent = current.parentPath) && !t.isFunction(parent.node); current = parent) {
      if (!guardAppliesToBinding(parent.scope, varName, binding)) continue;
      if (findConditionalGuards(current, varName).length) {
        if (!violatesBefore(current)) innerFreshConditional = true;
        else if (!innerFreshConditional) return true;
      }
      if (findSwitchCaseGuards(current, varName).length && violatesBefore(parent) && !innerFreshConditional) return true;
      if (findEarlyExitGuards(current, varName).length && !innerFreshConditional
        && earlyExitInvalidates(current, getStatementSiblings(current))) return true;
    }
    return false;
  }

  // bail narrowing if any reassignment lives inside a nested function - that function may
  // be invoked between the guard and the usage, breaking type narrowing
  function hasMutationInCapturedFunction({ constantViolations, scope }) {
    if (!constantViolations?.length) return false;
    return constantViolations.some(v => {
      for (let p = v.parentPath; p && p !== scope.path; p = p.parentPath) {
        if (t.isFunction(p.node)) return true;
      }
      return false;
    });
  }

  // classify a binding's annotation for the guard-based narrowing path:
  //   'none'   - no annotation; guards produce the type from scratch
  //   'union'  - union annotation; guards filter its branches (types/subst provided)
  //   'open'   - unknown/any/object/mixed; guards may refine it to a concrete type
  //   'closed' - any other annotation; guards can't meaningfully refine it
  function classifyGuardAnnotation(binding) {
    const annotation = findBindingAnnotation(binding.path);
    if (!annotation) return { kind: 'none' };
    const { scope } = binding.path;
    const { node: resolved, subst } = followTypeAliasChain(annotation, scope);
    if (resolved?.type === 'TSUnionType' || resolved?.type === 'UnionTypeAnnotation') {
      return { kind: 'union', types: resolved.types, subst, scope };
    }
    // TS `unknown`/`any`/`object`, Flow `mixed`/`any` are wide-open enough that
    // typeof / instanceof guards can refine them - `unknown` is the canonical place
    // users put guards and `object` still accepts Array.isArray() / instanceof
    if (resolved?.type === 'TSUnknownKeyword' || resolved?.type === 'TSAnyKeyword'
      || resolved?.type === 'TSObjectKeyword' || resolved?.type === 'AnyTypeAnnotation'
      || resolved?.type === 'MixedTypeAnnotation') return { kind: 'open' };
    return { kind: 'closed' };
  }

  // shared prologue: find guards for an identifier binding, cached per AST node
  let guardsCache = new WeakMap();
  function findGuardsForBinding(path) {
    if (!t.isIdentifier(path.node)) return null;
    const { node } = path;
    if (guardsCache.has(node)) return guardsCache.get(node);
    const { name } = node;
    const binding = path.scope?.getBinding(name);
    let result = null;
    if (binding) {
      // classify the annotation BEFORE collecting guards - a concrete (closed) annotation
      // can't be refined by typeof/instanceof, and neither caller uses guards in that case.
      // skipping the parent-path walk here is the main win (guard collection is O(depth))
      const classification = classifyGuardAnnotation(binding);
      if (classification.kind !== 'closed') {
        const isConst = !binding.constantViolations?.length;
        const guards = findEnclosingTypeGuards({ path, varName: name, isConst, binding });
        if (guards && (isConst
            || (!hasMutationAfterGuards(binding, path, name)
              && !hasMutationInCapturedFunction(binding)))) {
          // stash the classification on the result - callers reuse it instead of re-deriving
          result = { binding, guards, classification };
        }
      }
    }
    guardsCache.set(node, result);
    return result;
  }

  function resolveTypeGuardNarrowing(path) {
    const info = findGuardsForBinding(path);
    if (!info) return null;
    const { guards, classification } = info;
    if (classification.kind === 'union') {
      const { types, subst, scope } = classification;
      if (!types?.length) return null;
      return narrowByGuards(types.map(member => resolveTypeAnnotation(applyAliasSubstDeep(member, subst), scope)), guards);
    }
    // 'closed' is already filtered by findGuardsForBinding - only 'none', 'open', 'union' reach here
    return narrowByGuards(guards.filter(g => g.positive).map(resolveGuardType), guards);
  }

  function reset() {
    guardsCache = new WeakMap();
  }

  // `matchesTypeofValue` / `matchesGuard` / `narrowByGuards` stay cluster-private
  // (consumed only by `resolveGuardType` / `resolveTypeGuardNarrowing` internally)
  return {
    resolveGuardType,
    findGuardsForBinding,
    resolveTypeGuardNarrowing,
    reset,
  };
}
