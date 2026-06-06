// Guard-based type narrowing. consumes typeof / instanceof / predicate guards from
// `typeof-guards` + `guard-shapes` and either filters a union annotation's branches or
// synthesises a Type from positive guards alone (when no annotation exists).
//
// Public surface:
//   resolveTypeGuardNarrowing(path) - narrowed Type for an Identifier path, or null
//   findGuardsForBinding(path)      - guards + classification triple, cached per node
//   matchesTypeofValue / matchesGuard - low-level predicates
//   reset()                         - per-file cache invalidation
//
// `hasMutationAfterGuards` / `hasMutationInCapturedFunction` are the soundness filters:
// any reassignment reaching the usage between the guard and the access invalidates the
// narrow; mutation inside a nested captured function also invalidates (deferred calls
// may fire between the guard and the usage)
import { peelLabeledStatementNode } from '../helpers/ast-patterns.js';
import { isUnionType, OPEN_KEYWORD_ANNOTATION_TYPES, violationInCapturedFunction } from './ast-shapes.js';
import { isLoopStatement } from '../destructure-host-shape.js';
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
  canFallThrough,
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

  // a guard filters a candidate iff `matchesGuard === guard.positive`. an `optionalCall`
  // predicate guard (`obj.isStr?.(x)`) may short-circuit without testing x, so it is trusted
  // only in the positive direction: in the complement branch (positive === false) it does
  // not filter, leaving the candidate in the union
  function guardKeeps(resolved, guard) {
    if (guard.optionalCall && !guard.positive) return true;
    return matchesGuard(resolved, guard) === guard.positive;
  }

  // filter candidate types by guards, return the unique surviving type or null
  function narrowByGuards(candidates, guards) {
    let result = null;
    for (const resolved of candidates) {
      if (!resolved) continue;
      if (isNullableOrNever(resolved)) continue;
      if (!guards.every(guard => guardKeeps(resolved, guard))) continue;
      result = commonType(result, resolved);
      if (!result) return null;
    }
    return result;
  }

  // shared probes over a binding's constantViolations list. all positional checks share the
  // same source-position fallback (synthetic nodes treated as conservatively-before-usage)
  function createViolationProbes(constantViolations, usageNode) {
    function hasStart(node) {
      return node?.start !== null && node?.start !== undefined;
    }
    // synthetic AST nodes (no source positions) - assume mutation is before usage so
    // narrowing drops rather than over-keeps
    function isBefore(v) {
      return !hasStart(v.node) || !hasStart(usageNode) || v.node.start < usageNode.start;
    }
    function isDescendantOf(path, scope) {
      for (let p = path; p; p = p.parentPath) if (p === scope) return true;
      return false;
    }
    // positional containment: violation byte range fits inside node's byte range.
    // unknown ranges -> not contained (callers treat that as conservatively-outside)
    function isInsideNode(node, vnode) {
      return hasStart(node) && node.end !== null && node.end !== undefined
        && hasStart(vnode) && vnode.end !== null && vnode.end !== undefined
        && vnode.start >= node.start && vnode.end <= node.end;
    }
    return {
      violates(scope) {
        return constantViolations.some(v => isDescendantOf(v, scope));
      },
      violatesBefore(scope) {
        return constantViolations.some(v => isDescendantOf(v, scope) && isBefore(v));
      },
      // mutation byte range fits inside node's byte range. used for sibling-relative
      // scopes the parentPath walker can't reach
      violatesInsideNode(node) {
        if (!hasStart(node) || node.end === null || node.end === undefined) return false;
        return constantViolations.some(v => isInsideNode(node, v.node));
      },
      // a before-usage reassignment that sits strictly between the outer guards and the inner
      // fresh re-narrowing conditional: inside `outerHost` (so an outer guard already ran before
      // it) yet outside `innerHost` (so the inner guard does not re-narrow past it). that window
      // is what makes the outer guards stale. a reassignment positioned BEFORE the outer guards
      // is excluded - those guards re-narrow after it and stay valid
      violatesBetweenHosts(outerHost, innerHost) {
        return constantViolations.some(v => isBefore(v)
          && isInsideNode(outerHost, v.node) && !isInsideNode(innerHost, v.node));
      },
    };
  }

  // check whether any reassignment of binding could execute between a guard check and usagePath.
  // soundness rule: if the guard checked a value, the runtime branch that follows must observe
  // THAT same value. three reachability paths beyond plain "mutation descendant of current":
  //   (a) ambient mutation in the guard's OWN test slot - fires after the guard expression
  //       but before the consequent (`if (typeof x === 'string' && (x = 5, true))`)
  //   (b) preceding fall-through case bodies feed mutations into the current SwitchCase via
  //       absence of `break` (`case 'a': x = 5; case 'b': use(x)`)
  //   (c) early-exit sibling's OWN test slot when the OR-side runs but the return doesn't fire
  //       (`if (typeof x !== 'string' || (x = 5, false)) return;` - LHS=false, RHS runs, !return)
  //
  // returns { mutated, staleBoundaryHost }. `staleBoundaryHost` (when set) is the host node
  // of the nearest fresh inner re-narrowing conditional that a reassignment between it and
  // the outer guards has invalidated: the caller must collect guards only from that host
  // inward, dropping the stale outer guards that would otherwise over-narrow the union
  function hasMutationAfterGuards(binding, usagePath, varName) {
    // every early exit is "a mutation invalidates the narrow, no stale-guard boundary to
    // report"; only the final fall-through can carry a boundary. share one read-only sentinel
    const MUTATED = { mutated: true, staleBoundaryHost: null };
    const { constantViolations } = binding;
    if (!constantViolations.length) return { mutated: false, staleBoundaryHost: null };
    const probes = createViolationProbes(constantViolations, usagePath.node);
    const { violates, violatesBefore, violatesInsideNode, violatesBetweenHosts } = probes;
    // (a) test slot of conditional/logical guard host. for IfStatement/Conditional the host's
    // `test` is the guard expression; for LogicalExpression where guards came from LHS, RHS
    // mutations live in `current` (the right operand) and `violatesBefore(current)` covers them
    function conditionalTestNode(current) {
      const parent = current.parentPath;
      if (!parent) return null;
      const pnode = parent.node;
      if (t.isIfStatement(pnode) || t.isConditionalExpression(pnode)) return pnode.test;
      if (t.isLogicalExpression(pnode)) return pnode.left;
      return null;
    }
    // (b) preceding fall-through cases feed mutations into the current SwitchCase. walks
    // back until a case with a runtime exit (return/throw/break)
    function fallThroughCaseViolates(current) {
      const switchCase = current.parentPath;
      const switchStmt = switchCase?.parentPath;
      if (!t.isSwitchStatement(switchStmt?.node)) return false;
      const { cases } = switchStmt.node;
      const idx = cases.indexOf(switchCase.node);
      for (let i = idx - 1; i >= 0; i--) {
        // gate FIRST: a case that cannot fall through (ends in break/return/throw) neither feeds its
        // own body mutation nor any earlier case's into the current case, so stop before counting it
        // as a violation - checking the mutation first would wrongly invalidate a break/return-ended case
        if (!canFallThrough(cases[i])) break;
        if (violatesInsideNode(cases[i])) return true;
      }
      return false;
    }
    // early-exit invalidation: only the NEAREST guard to usage matters - closer guards
    // re-narrow independently. mutation windows: intermediate sibling bodies between
    // nearest and current, prefix of current's own sibling, and (c) nearest guard's test slot
    function earlyExitInvalidates(current, siblings) {
      let nearestIdx = -1;
      for (let i = current.key - 1; i >= 0; i--) {
        if (siblingGuardsBinding(siblings[i], varName)) {
          nearestIdx = i;
          break;
        }
      }
      if (nearestIdx < 0) return false;
      // `parseSiblingGuards` accepts `outer: if (...) return;` by peeling LabeledStatement;
      // the same peel must run here or label-wrapped test-slot mutation stays invisible
      const nearestNode = peelLabeledStatementNode(siblings[nearestIdx]?.node);
      if (t.isIfStatement(nearestNode) && violatesInsideNode(nearestNode.test)) return true;
      for (let j = nearestIdx + 1; j < current.key; j++) if (violates(siblings[j])) return true;
      return violatesBefore(siblings[current.key]);
    }
    // a fresh inner conditional re-narrows at runtime regardless of outer-scope mutations.
    // "fresh" requires no mutation in the consequent path AND no mutation in the inner
    // guard's own test slot
    const bindingGuardedAt = current => !!(findConditionalGuards(current, varName).length
      || findSwitchCaseGuards(current, varName).length
      || findEarlyExitGuards(current, varName).length);
    let innerFreshConditional = false;
    // host of the nearest fresh inner re-narrowing conditional (set once, at the first fresh
    // conditional walking leaf->up); feeds the stale-guard boundary computed at the final return
    let nearestFreshHost = null;
    // host of the outermost enclosing conditional guard (last one seen walking leaf->up).
    // a reassignment is "between the outer guards and the inner fresh conditional" only if it
    // lives inside this region; one positioned before it is re-narrowed by it and stays valid
    let outermostGuardHost = null;
    // a reassignment anywhere inside a loop body re-executes before the use on the next
    // iteration, so once we cross such a loop a guard OUTSIDE it no longer holds at the use
    // (`if (typeof x !== 'string') return; while (c) { x.at(0); x = readAnything() }`). an
    // inner conditional that re-narrows each iteration (innerFreshConditional) stays exempt
    let crossedBackEdgeLoop = false;
    // a preceding-statement outer guard (early-exit / switch fall-through) that a reassignment
    // has invalidated, discovered while an inner fresh conditional is already in scope. unlike a
    // wrapping outer guard (tracked via outermostGuardHost), it sets no host, so the
    // violatesBetweenHosts check below can't see it - this flag carries the staleness instead
    let stalePrecedingOuterGuard = false;
    for (let current = usagePath, parent; (parent = current.parentPath) && !t.isFunction(parent.node); current = parent) {
      if (!innerFreshConditional && isLoopStatement(parent.node) && violatesInsideNode(parent.node)) crossedBackEdgeLoop = true;
      if (!guardAppliesToBinding(parent.scope, varName, binding)) continue;
      // a guard reached only after crossing a back-edge loop is outside it - it cannot
      // re-establish the narrow per iteration, so the loop-carried reassignment wins
      if (crossedBackEdgeLoop && bindingGuardedAt(current)) return MUTATED;
      if (findConditionalGuards(current, varName).length) {
        outermostGuardHost = parent.node;
        const fresh = !violatesBefore(current) && !violatesInsideNode(conditionalTestNode(current));
        if (fresh) {
          if (!innerFreshConditional) nearestFreshHost = parent.node;
          innerFreshConditional = true;
        } else if (!innerFreshConditional) return MUTATED;
      }
      const switchStale = findSwitchCaseGuards(current, varName).length
        && (violatesBefore(parent) || fallThroughCaseViolates(current));
      const earlyExitStale = findEarlyExitGuards(current, varName).length
        && earlyExitInvalidates(current, getStatementSiblings(current));
      // with a fresh inner conditional in scope, a stale preceding-statement OUTER guard does not
      // invalidate the narrow (the inner test re-narrows per its own scope) - it just must be
      // dropped so its union branch is not intersected back in. without one, it bails outright
      if (innerFreshConditional) {
        if (switchStale || earlyExitStale) stalePrecedingOuterGuard = true;
        continue;
      }
      if (switchStale || earlyExitStale) return MUTATED;
    }
    // the narrow survives, but if a reassignment sits between the outer guards (wrapping, tracked
    // by outermostGuardHost; or preceding-statement, flagged above) and the nearest fresh inner
    // conditional, those outer guards are stale: report the fresh host as the boundary so the
    // caller re-collects from it inward and drops them
    const staleBoundaryHost = nearestFreshHost
      && (violatesBetweenHosts(outermostGuardHost, nearestFreshHost) || stalePrecedingOuterGuard)
      ? nearestFreshHost : null;
    return { mutated: false, staleBoundaryHost };
  }

  // bail narrowing if any reassignment lives inside a nested function - that function may
  // be invoked between the guard and the usage, breaking type narrowing
  function hasMutationInCapturedFunction({ constantViolations, scope }) {
    return violationInCapturedFunction(t, constantViolations, scope.path);
  }

  // utility-type names (`Record` / `Partial` / `Readonly` / `Required` / `NonNullable`)
  // wrap arbitrary object surfaces and refine the same way keyword opens do; distributive
  // utilities (`Pick` / `Omit` / `Exclude` / `Extract`) name a concrete sub-shape and stay
  // outside this set. keyword set lives in `ast-shapes` to share with class-object-member
  const OPEN_UTILITY_TYPE_NAMES = new Set([
    'Record',
    'Partial',
    'Readonly',
    'Required',
    'NonNullable',
  ]);

  function utilityTypeRefName(node) {
    if (node?.type !== 'TSTypeReference') return null;
    const { typeName } = node;
    return typeName?.type === 'Identifier' ? typeName.name : null;
  }

  function isOpenAnnotation(node) {
    return OPEN_KEYWORD_ANNOTATION_TYPES.has(node?.type)
      || OPEN_UTILITY_TYPE_NAMES.has(utilityTypeRefName(node));
  }

  // classify a binding's annotation for the guard-based narrowing path:
  //   'none'   - no annotation; guards produce the type from scratch
  //   'union'  - union annotation; guards filter its branches (types/subst provided)
  //   'open'   - unknown / any / object / mixed / open-utility; guards may refine to concrete
  //   'closed' - any other annotation; guards can't meaningfully refine it
  function classifyGuardAnnotation(binding) {
    const annotation = findBindingAnnotation(binding.path);
    if (!annotation) return { kind: 'none' };
    const { scope } = binding.path;
    const { node: resolved, subst } = followTypeAliasChain(annotation, scope);
    if (isUnionType(resolved)) {
      return { kind: 'union', types: resolved.types, subst, scope };
    }
    if (isOpenAnnotation(resolved)) return { kind: 'open' };
    return { kind: 'closed' };
  }

  // shared prologue: find guards for an identifier binding, cached per AST node.
  // classify annotation BEFORE collecting guards - concrete 'closed' shapes can't be refined,
  // so skipping the O(depth) parent walk for them is the main win
  let guardsCache = new WeakMap();
  function findGuardsForBinding(path) {
    if (!t.isIdentifier(path.node)) return null;
    const { node } = path;
    if (guardsCache.has(node)) return guardsCache.get(node);
    const { name } = node;
    const binding = path.scope?.getBinding(name);
    let result = null;
    if (binding) {
      const classification = classifyGuardAnnotation(binding);
      if (classification.kind !== 'closed') {
        const isConst = !binding.constantViolations?.length;
        let guards = findEnclosingTypeGuards({ path, varName: name, isConst, binding });
        let keep = isConst;
        if (guards && !isConst) {
          const { mutated, staleBoundaryHost } = hasMutationAfterGuards(binding, path, name);
          keep = !mutated && !hasMutationInCapturedFunction(binding);
          // a reassignment between a fresh inner conditional and the outer guards made the
          // latter stale - re-collect from that host inward so they no longer over-narrow
          if (keep && staleBoundaryHost) {
            guards = findEnclosingTypeGuards({ path, varName: name, isConst, binding, boundaryHost: staleBoundaryHost });
          }
        }
        if (guards && keep) result = { binding, guards, classification };
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
    // 'closed' filtered by findGuardsForBinding - only 'none' / 'open' / 'union' reach here
    return narrowByGuards(guards.filter(g => g.positive).map(resolveGuardType), guards);
  }

  function reset() {
    guardsCache = new WeakMap();
  }

  return {
    resolveGuardType,
    findGuardsForBinding,
    resolveTypeGuardNarrowing,
    reset,
  };
}
