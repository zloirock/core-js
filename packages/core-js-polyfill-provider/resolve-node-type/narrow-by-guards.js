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
    return {
      violates(scope) {
        return constantViolations.some(v => isDescendantOf(v, scope));
      },
      violatesBefore(scope) {
        return constantViolations.some(v => isDescendantOf(v, scope) && isBefore(v));
      },
      // positional containment: mutation byte range fits inside node's byte range. used
      // for sibling-relative scopes the parentPath walker can't reach
      violatesInsideNode(node) {
        if (!hasStart(node) || node.end === null || node.end === undefined) return false;
        const { start, end } = node;
        return constantViolations.some(v => {
          const n = v.node;
          return hasStart(n) && n.end !== null && n.end !== undefined && n.start >= start && n.end <= end;
        });
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
  function hasMutationAfterGuards(binding, usagePath, varName) {
    const { constantViolations } = binding;
    if (!constantViolations.length) return false;
    const probes = createViolationProbes(constantViolations, usagePath.node);
    const { violates, violatesBefore, violatesInsideNode } = probes;
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
        if (violatesInsideNode(cases[i])) return true;
        if (!canFallThrough(cases[i])) break;
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
    let innerFreshConditional = false;
    for (let current = usagePath, parent; (parent = current.parentPath) && !t.isFunction(parent.node); current = parent) {
      if (!guardAppliesToBinding(parent.scope, varName, binding)) continue;
      if (findConditionalGuards(current, varName).length) {
        const fresh = !violatesBefore(current) && !violatesInsideNode(conditionalTestNode(current));
        if (fresh) innerFreshConditional = true;
        else if (!innerFreshConditional) return true;
      }
      if (innerFreshConditional) continue;
      if (findSwitchCaseGuards(current, varName).length
        && (violatesBefore(parent) || fallThroughCaseViolates(current))) return true;
      if (findEarlyExitGuards(current, varName).length
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

  // annotation shapes that map to an arbitrary object / mixed-content surface. typeof /
  // instanceof legitimately refines these to a concrete type; anything outside the set is
  // already concrete enough that guard-based refinement would over-narrow.
  // utility-type names (`Record` / `Partial` / `Readonly` / `Required` / `NonNullable`)
  // wrap arbitrary object surfaces; distributive utilities (`Pick` / `Omit` / `Exclude` /
  // `Extract`) name a concrete sub-shape and stay outside this set
  const OPEN_OBJECT_LIKE_ANNOTATION_TYPES = new Set([
    'TSUnknownKeyword',
    'TSAnyKeyword',
    'TSObjectKeyword',
    'AnyTypeAnnotation',
    'MixedTypeAnnotation',
  ]);

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
    return OPEN_OBJECT_LIKE_ANNOTATION_TYPES.has(node?.type)
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
    if (resolved?.type === 'TSUnionType' || resolved?.type === 'UnionTypeAnnotation') {
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
        const guards = findEnclosingTypeGuards({ path, varName: name, isConst, binding });
        if (guards && (isConst
            || (!hasMutationAfterGuards(binding, path, name)
              && !hasMutationInCapturedFunction(binding)))) {
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
