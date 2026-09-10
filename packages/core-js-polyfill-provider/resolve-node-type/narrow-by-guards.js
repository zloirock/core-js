// Guard-based type narrowing. consumes typeof / instanceof / predicate guards from
// `typeof-guards` + `guard-shapes` and either filters a union annotation's branches or
// synthesises a Type from positive guards alone (when no annotation exists).
//
// Public surface:
//   resolveTypeGuardNarrowing(path) - narrowed Type for an Identifier path, or null
//   findGuardsForBinding(path)      - guards + classification triple, cached per node
//   resolveGuardType(guard)         - the Type a single guard implies (the hint dispatcher reads it)
//   findAnnotationGuard(path)       - a positive predicate guard's declared target (member resolution)
//   reset()                         - per-file cache invalidation
// cluster-private: `matchesTypeofValue` / `matchesGuard` / `narrowByGuards` / `hasMutationAfterGuards`
//
// `hasMutationAfterGuards` / `hasMutationInCapturedFunction` are the soundness filters:
// any reassignment reaching the usage between the guard and the access invalidates the
// narrow; mutation inside a nested captured function also invalidates (deferred calls
// may fire between the guard and the usage)
import {
  FUNCTION_LIKE_NODE_TYPES,
  pathIsInside,
  readStepIsDeferred,
  siblingHostingIndex,
  writeOutrunsUse,
  runsAtImmediateInvocation,
  suspensionPointBefore,
} from '../helpers/ast-patterns.js';
import {
  hasRange,
  isUnionType,
  loopReExecRegionHasViolation,
  OPEN_KEYWORD_ANNOTATION_TYPES,
  nodeRangeContains,
  violationInCapturedFunction,
} from './ast-shapes.js';
import { bindingLoopAnchor } from './straight-line-flow.js';
import { isLoopStatement } from '../destructure-host-shape.js';
import { $Object, $Primitive, PRIMITIVES } from './base.js';

export function createNarrowByGuards({
  getScopeBinding,
  t,
  resolveTypeAnnotation,
  isNullableOrNever,
  foldUnionTypes,
  resolveKnownConstructor,
  findBindingAnnotation,
  followTypeAliasChain,
  applyAliasSubstDeep,
  findEnclosingTypeGuards,
  nearestPrecedingGuardIndex,
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
    // 'annotation'-kind guards (structural predicate targets) stay null here on purpose:
    // their nominal resolution already failed at guard creation, and re-resolving could
    // synthesize an open keyword type that wrongly suppresses generic injection - the
    // member surface lives on the annotation node, consumed by member resolution instead
    return null;
  }

  // a guard filters a candidate iff `matchesGuard === guard.positive`. an `optionalCall`
  // predicate guard (`obj.isStr?.(x)`) may short-circuit without testing x, so it is trusted
  // only in the positive direction: in the complement branch (positive === false) it does
  // not filter, leaving the candidate in the union
  function guardKeeps(resolved, guard) {
    if (guard.optionalCall && !guard.positive) return true;
    // an annotation-kind guard carries a structural target that nominal $-Type matching
    // cannot test - neutral for union filtering in both directions
    if (guard.kind === 'annotation') return true;
    return matchesGuard(resolved, guard) === guard.positive;
  }

  // filter the candidates by the guards and fold the survivors through the canonical union fold -
  // ONE arm policy with every other union site, so a guard can never leave the resolver more certain
  // than the same annotation without one: a survivor nothing could resolve BAILS the whole answer (the
  // value may be of that arm), a nullish survivor is skipped and marks the result `mayBeNullish` (a
  // guard that rules it out - `typeof x === 'string'`, a positive instanceof - keeps the narrow
  // precise; `typeof x === 'object'` keeps null at runtime), a dropped `never` arm carries no runtime
  // value, and the rest must converge. the one certainty a guard DOES add is its own: a positive
  // guard that names a family (`typeof x === 'string'`, `x instanceof Array`) is a runtime test the
  // value passed, so an arm nothing could resolve is either of that family - and the survivors
  // already say so - or not the value at all; a neutral or negative guard proves no such thing.
  // a set that folds to nothing but a nullish arm narrows nothing
  function narrowByGuards(candidates, guards) {
    const familyEstablished = guards.some(guard => guard.positive && resolveGuardType(guard));
    // did that certainty actually carry an arm? it reaches exactly as far as the CONSTRUCTOR the
    // guard names and no further: `w instanceof Array` proves an unresolvable arm is an Array, never
    // what that Array holds, so the survivors' element type is not a thing the guard let us keep
    let familyCarried = false;
    const survivors = candidates.filter(resolved => {
      if (resolved) return guards.every(guard => guardKeeps(resolved, guard));
      if (!familyEstablished) return true;
      familyCarried = true;
      return false;
    });
    const result = foldUnionTypes(survivors, resolved => resolved);
    if (!result || isNullableOrNever(result)) return null;
    if (!familyCarried || !result.inner) return result;
    const bare = result.clone();
    bare.inner = null;
    return bare;
  }

  // shared probes over a binding's constantViolations list. every positional check answers
  // CONSERVATIVELY for a node without source positions - a plugin-minted write, a synthetic host:
  // it is taken to sit before the use and inside every window asked about, so the narrow drops
  // rather than over-keeps
  function createViolationProbes(constantViolations, usagePath) {
    const usageNode = usagePath.node;
    function isBefore(v) {
      // the fourth positional lane, asking the same evaluation-order question as the three value-flow
      // ones: a write whose slot runs ahead of the use's own sits PAST it by span and is still before
      // it in time, so a guard standing between them proves nothing
      return !hasRange(v.node) || !hasRange(usageNode) || v.node.start < usageNode.start
        || writeOutrunsUse(v.node, usagePath);
    }
    // positional containment: the violation's byte range fits inside the node's. the canonical span
    // test, plus this lane's own conservative answer for a node without positions
    function isInsideNode(node, vnode) {
      return !hasRange(node) || !hasRange(vnode) || nodeRangeContains(node, vnode);
    }
    return {
      violatesBefore(scope) {
        return constantViolations.some(v => pathIsInside(v, scope) && isBefore(v));
      },
      // a mutation inside the node's byte range. used for sibling-relative scopes the
      // parentPath walker can't reach. an absent slot (no node at all) hosts nothing
      violatesInsideNode(node) {
        return !!node && constantViolations.some(v => isInsideNode(node, v.node));
      },
      // a before-usage reassignment that sits strictly between the outer guards and the inner
      // fresh re-narrowing conditional: inside `outerHost` (so an outer guard already ran before
      // it) yet outside `innerHost` (so the inner guard does not re-narrow past it). that window
      // is what makes the outer guards stale. a reassignment positioned BEFORE the outer guards
      // is excluded - those guards re-narrow after it and stay valid. a position-less write never
      // reaches here: it sits inside every conditional's test slot, so no conditional is fresh
      violatesBetweenHosts(outerHost, innerHost) {
        return constantViolations.some(v => isBefore(v) && isInsideNode(outerHost, v.node) && !isInsideNode(innerHost, v.node));
      },
    };
  }

  // check whether any reassignment of binding could execute between a guard check and usagePath.
  // soundness rule: if the guard checked a value, the runtime branch that follows must observe
  // THAT same value. three reachability paths beyond plain "mutation descendant of current":
  //   (a) ambient mutation in the guard's OWN test slot - fires after the guard expression
  //       but before the consequent (`if (typeof x === 'string' && (x = 5, true))`)
  //   (b) preceding cases feed mutations into the current SwitchCase: every preceding case TEST
  //       ran (the runtime tries them in order until the match), a preceding BODY ran when it can
  //       fall through into this one (`case 'a': x = 5; case 'b': use(x)`)
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
    const probes = createViolationProbes(constantViolations, usagePath);
    const { violatesBefore, violatesInsideNode, violatesBetweenHosts } = probes;
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
    // (b) everything the switch evaluates before the use's own case body runs. the TEST of every
    // preceding case ran whatever ended its body; the BODIES feed only while each can fall through -
    // a case that cannot (ends in break/return/throw) neither feeds its own body mutation nor any
    // earlier case's, so the body walk stops there while the test walk goes on.
    // a DEFAULT clause is the exception to "preceding": it is reached only once EVERY case test has
    // been evaluated and none matched, so the tests written AFTER it run before it too
    function caseEvaluationViolates(current) {
      const switchCase = current.parentPath;
      const switchStmt = switchCase?.parentPath;
      if (!t.isSwitchStatement(switchStmt?.node)) return false;
      const idx = switchStmt.node.cases.indexOf(switchCase.node);
      const facts = caseEvaluationFacts(switchStmt.node, constantViolations, violatesInsideNode);
      if (!switchCase.node.test) return facts.testAfter[idx + 1];
      return facts.testBefore[idx] || facts.bodyCount[idx] > facts.bodyCount[facts.feedStart[idx]];
    }
    // early-exit invalidation: only the NEAREST guard to usage decides whether the narrow
    // SURVIVES - closer guards re-narrow independently, and a guard with a write in its own live
    // slots (its test, its fall-through branch, an assertion's call argument) never reaches this
    // walk: the collector's floor drops it, so the nearest collected guard is clean. mutation
    // windows: intermediate sibling bodies between nearest and current, prefix of current's own sibling
    function earlyExitInvalidates(current, siblings) {
      const nearestIdx = nearestPrecedingGuardIndex(siblings, current.key, varName);
      // the caller only asks with a non-empty guard set, and the collector derived that set from THIS
      // sibling list at THIS position - both read the one per-variable block list and both admit a
      // block only below the position, so a guard exists at an index under it. what is not enforced is
      // the collector's own memo, keyed on the use NODE and not on where it sits: a re-listed container
      // hands back a fresh index while that memo still answers for the old slot. and the line is not a
      // defensive no-op - without it `from` is 0 and the window below spans the whole prefix, which is
      // a different verdict rather than a cheaper one
      if (nearestIdx < 0) return false;
      const from = nearestIdx + 1;
      if (from < current.key && constantViolations.some(v => {
        const host = siblingHostingIndex(siblings, v);
        return host >= from && host < current.key;
      })) return true;
      return violatesBefore(siblings[current.key]);
    }
    let innerFreshConditional = false;
    // host of the nearest fresh inner re-narrowing conditional (set once, at the first fresh
    // conditional walking leaf->up); feeds the stale-guard boundary computed at the final return
    let nearestFreshHost = null;
    // host of the outermost enclosing conditional guard (last one seen walking leaf->up).
    // a reassignment is "between the outer guards and the inner fresh conditional" only if it
    // lives inside this region; one positioned before it is re-narrowed by it and stays valid
    let outermostGuardHost = null;
    // a body that can SUSPEND is not atomic: at every `await` / `yield` the caller resumes and runs
    // its own code, so a write in an enclosing scope lands between a guard above the suspension and a
    // use below it. the climb stops at the function boundary and never sees such a write, so the
    // guards above the suspension are dropped by position instead. asked only when a write really
    // does live outside the body - inside it the ordinary walk already sees everything
    // the suspension the use is read after, as a POSITION: a guard standing before it ran before the
    // caller's code did, and the two are ordered by source position because both sit in one body
    const suspension = suspensionBeforeUse(usagePath, constantViolations);
    // a reassignment anywhere inside a loop body re-executes before the use on the next iteration, so
    // once we cross such a loop a guard OUTSIDE it no longer holds at the use
    // (`if (typeof x !== 'string') return; while (c) { x.at(0); x = readAnything() }`)
    let crossedBackEdgeLoop = false;
    // a write in a case TEST the switch evaluates before the use's own case body runs. NOT a position:
    // a `default` clause is reached after the tests written BELOW it too, so its body's own guards
    // stand textually before a test that ran first. the level tells them apart instead
    let crossedCaseEvaluation = false;
    // an OUTER guard a reassignment has invalidated while an inner fresh conditional is in scope:
    // a preceding-statement guard (which sets no host, so `violatesBetweenHosts` cannot see it), or
    // any guard reached past a back-edge loop. the inner test re-narrows per its own scope, so the
    // narrow survives - the stale outer guards are dropped through the boundary below instead of
    // being intersected back in
    let staleOuterGuard = false;
    // back-edge soundness shared with the value-flow walk: a reassignment that re-executes on the loop
    // back-edge before the next-iteration use makes a guard outside the loop stale. delegate to the
    // canonical `loopReExecRegionHasViolation` instead of an inline `violatesInsideNode(loop)` - the
    // canonical excludes the once-only for-init slot AND keeps the for-header binding exemption sound
    // (a C-style `for (let x = init; ;)` header carries across; a for-of var / body block does not)
    const loopViolationNodes = constantViolations.map(v => v.node);
    const loopBindingAnchor = bindingLoopAnchor(binding);
    // has everything the guards at this level rest on already run by the time the use does? two
    // sources, and they are ordered differently: a suspension the body parks on orders by POSITION
    // (both sit in one body), while the case tests a `default` is reached through order by LEVEL - a
    // default body follows tests written below it, so position cannot rank them.
    // the verdict is the LEVEL's, not each lane's: the lanes of one level are asked together and a
    // stale one condemns the level. deliberately conservative - a fresh conditional beside a stale
    // exit guard loses with it, which drops a narrow rather than keeping an unproven one
    function levelRanBeforeUse({ parent, siblings, exitIdx, outsideLanes, caseEvalHere }) {
      const laneHosts = [];
      if (outsideLanes) laneHosts.push(parent.node);
      if (exitIdx >= 0) laneHosts.push(siblings[exitIdx].node);
      // a host an emitter REBUILT carries no span to rank against the suspension, and `hasRange` is
      // the one spelling of that question. an unrankable lane counts as having run before the use:
      // that drops the narrow instead of keeping one the resumed caller may have invalidated
      if (suspension !== null && laneHosts.some(node => !hasRange(node) || node.start < suspension)) return true;
      return caseEvalHere ? outsideLanes : crossedCaseEvaluation;
    }
    // the climb stops where the collector stops - at a deferred context, through an immediately
    // invoked body - so both walk the same levels
    for (let current = usagePath, parent; (parent = current.parentPath) && !readStepIsDeferred(parent, current); current = parent) {
      // the once-only `for`-init slot is not behind the back edge: a read there runs before the first
      // body write, the same exclusion the value-flow walk makes
      const inOnceOnlyInit = parent.node.type === 'ForStatement' && current.node === parent.node.init;
      if (!inOnceOnlyInit && isLoopStatement(parent.node)
        && loopReExecRegionHasViolation(parent.node, loopViolationNodes, loopBindingAnchor)) crossedBackEdgeLoop = true;
      const caseEvalHere = t.isSwitchCase(parent.node) && caseEvaluationViolates(current);
      if (caseEvalHere) crossedCaseEvaluation = true;
      // the three lanes, asked once per level
      const conditional = findConditionalGuards(current, varName, binding);
      const switchGuards = findSwitchCaseGuards(current, varName, binding);
      const exitGuards = findEarlyExitGuards(current, varName, binding);
      if (!conditional.length && !switchGuards.length && !exitGuards.length) continue;
      // a guard reached only after crossing a back-edge loop is outside it - it cannot
      // re-establish the narrow per iteration, so the loop-carried reassignment wins over it
      if (crossedBackEdgeLoop) {
        if (!innerFreshConditional) return MUTATED;
        staleOuterGuard = true;
        continue;
      }
      // a guard standing BEFORE the temporal boundary ran before the write that boundary marks, so it
      // is stale whatever lane found it. the lanes sit at different positions on one level - the switch
      // guard at its own host, an exit guard at its statement - so each is judged on its own, and the
      // check is asked AHEAD of the conditional lane, which would otherwise mark such a guard "fresh"
      // and hand it straight back through the stale boundary
      const siblings = getStatementSiblings(current);
      const exitIdx = exitGuards.length && siblings ? nearestPrecedingGuardIndex(siblings, current.key, varName) : -1;
      // at the case's OWN level only the guards from OUTSIDE its body are stale: the switch's guard
      // comes from the discriminant, which every test follows, while an exit guard inside the body
      // runs after all of them. every level above the case holds outside guards alone
      if (levelRanBeforeUse({ parent, siblings, exitIdx, caseEvalHere,
        outsideLanes: conditional.length > 0 || switchGuards.length > 0 })) {
        if (!innerFreshConditional) return MUTATED;
        staleOuterGuard = true;
        continue;
      }
      if (conditional.length) {
        outermostGuardHost = parent.node;
        // a fresh inner conditional re-narrows at runtime regardless of outer-scope mutations.
        // "fresh" requires no mutation in the consequent path AND no mutation in the inner
        // guard's own test slot
        const fresh = !violatesBefore(current) && !violatesInsideNode(conditionalTestNode(current));
        if (fresh) {
          if (!innerFreshConditional) nearestFreshHost = parent.node;
          innerFreshConditional = true;
        } else if (!innerFreshConditional) return MUTATED;
      }
      const switchStale = switchGuards.length && violatesBefore(parent);
      const earlyExitStale = exitGuards.length && earlyExitInvalidates(current, siblings);
      // with a fresh inner conditional in scope, a stale preceding-statement OUTER guard does not
      // invalidate the narrow (the inner test re-narrows per its own scope) - it just must be
      // dropped so its union branch is not intersected back in. without one, it bails outright
      if (!switchStale && !earlyExitStale) continue;
      if (!innerFreshConditional) return MUTATED;
      staleOuterGuard = true;
    }
    // the narrow survives, but if a reassignment sits between the outer guards (wrapping, tracked
    // by outermostGuardHost; or preceding-statement / past a back-edge, flagged above) and the
    // nearest fresh inner conditional, those outer guards are stale: report the fresh host as the
    // boundary so the caller re-collects from it inward and drops them
    const staleBoundaryHost = nearestFreshHost
      && (violatesBetweenHosts(outermostGuardHost, nearestFreshHost) || staleOuterGuard)
      ? nearestFreshHost : null;
    return { mutated: false, staleBoundaryHost };
  }

  // the suspension point a use is read after, or null: the nearest enclosing function has to be one
  // that suspends, a suspension has to sit before the use, and the binding has to carry a write the
  // body itself cannot see - one outside the function, or one with no position to place at all
  function suspensionBeforeUse(usagePath, constantViolations) {
    // the climb walks THROUGH a body that runs at its immediate invocation, so this walk must too -
    // stopping at the first function found an IIFE wrapper and turned the whole rule off
    let fnPath = usagePath.parentPath;
    while (fnPath?.node
      && (!FUNCTION_LIKE_NODE_TYPES.has(fnPath.node.type) || runsAtImmediateInvocation(fnPath))) fnPath = fnPath.parentPath;
    const fnNode = fnPath?.node;
    // the two halves of this line are not alike. the NULL test is load-bearing - the climb above runs
    // off the top of a module-level read and leaves no node to ask - while the KIND test is a fast
    // path: a body that is neither async nor a generator hosts no suspension point for the position
    // scan to find, so dropping it costs time and no answer
    if (!fnNode?.async && !fnNode?.generator) return null;
    // a use with no position of its own ranks before no suspension point, which is the answer the
    // search below already gives for it
    const useStart = usagePath.node.start;
    // the list is whatever the binding lookup MERGED, and a record carrying no node of its own
    // stands outside no function - it ranks before no suspension point either
    const outside = constantViolations.some(v => {
      const start = v.node?.start;
      return typeof start !== 'number' || !nodeRangeContains(fnNode, v.node);
    });
    return outside ? suspensionPointBefore(fnNode, useStart) : null;
  }

  // bail narrowing if any reassignment lives inside a nested function - that function may
  // be invoked between the guard and the usage, breaking type narrowing
  function hasMutationInCapturedFunction({ constantViolations, scope }) {
    return violationInCapturedFunction(constantViolations, scope.path);
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

  // the switch-order facts `caseEvaluationViolates` needs, derived ONCE per (switch, write list)
  // instead of per read: both walks it used to run are prefix questions, and running them per read
  // made the answer cubic in cases x reads x writes.
  //   testBefore[i] / testAfter[i] - does any case strictly before / after `i` carry a write in its
  //     TEST (the `default` clause is reached through every test, including those written below it);
  //   feedStart[i] - the start of the run of fall-through bodies that feeds case `i`, so the bodies
  //     that reach it are exactly [feedStart[i], i), which `bodyCount` then answers in O(1)
  let caseEvaluationFactsCache = new WeakMap();

  function caseEvaluationFacts(switchNode, constantViolations, violatesInsideNode) {
    let byViolations = caseEvaluationFactsCache.get(switchNode);
    if (!byViolations) caseEvaluationFactsCache.set(switchNode, byViolations = new WeakMap());
    const memo = byViolations.get(constantViolations);
    if (memo) return memo;
    const { cases } = switchNode;
    const testBefore = [false];
    const bodyCount = [0];
    const feedStart = [0];
    for (const [i, $case] of cases.entries()) {
      const testViolates = !!$case.test && violatesInsideNode($case.test);
      testBefore.push(testBefore[i] || testViolates);
      bodyCount.push(bodyCount[i] + (violatesInsideNode($case) ? 1 : 0));
      feedStart.push(canFallThrough($case) ? feedStart[i] : i + 1);
    }
    const testAfter = new Array(cases.length + 1).fill(false);
    for (let i = cases.length - 1; i >= 0; i--) {
      testAfter[i] = testAfter[i + 1] || (!!cases[i].test && violatesInsideNode(cases[i].test));
    }
    const facts = { testBefore, testAfter, bodyCount, feedStart };
    byViolations.set(constantViolations, facts);
    return facts;
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
    const binding = getScopeBinding(path.scope, name, path);
    let result = null;
    if (binding) {
      const classification = classifyGuardAnnotation(binding);
      if (classification.kind !== 'closed') {
        const isConst = !binding.constantViolations?.length;
        let guards = findEnclosingTypeGuards({ path, varName: name, isConst, binding });
        let keep = isConst;
        // a violation whose timing the parent chain cannot place - one inside a captured function,
        // or a canonically-recovered write carrying no chain at all - invalidates the guards
        // whatever the positional walk would say, so it decides first and that walk never runs on
        // one: every probe below may then read a violation's chain as present
        if (guards && !isConst && !hasMutationInCapturedFunction(binding)) {
          const { mutated, staleBoundaryHost } = hasMutationAfterGuards(binding, path, name);
          keep = !mutated;
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

  // positive, mutation-checked predicate guard for an Identifier path, with the annotation it was
  // declared with. member resolution retries a structural predicate target (interface) against
  // this annotation - the only transport for member surfaces that no $-Type can carry. `positive`
  // already folds the branch and the test's own negation, so it is the whole polarity
  function findAnnotationGuard(path) {
    const info = findGuardsForBinding(path);
    const guard = info?.guards.find(g => g.annotation && g.positive);
    return guard ? { annotation: guard.annotation, scope: guard.scope } : null;
  }

  function resolveTypeGuardNarrowing(path) {
    const info = findGuardsForBinding(path);
    if (!info) return null;
    const { guards, classification } = info;
    if (classification.kind === 'union') {
      const { types, subst, scope } = classification;
      if (!types?.length) return null;
      // every arm is a candidate, the ones nothing can resolve included - the fold sinks on those
      return narrowByGuards(types.map(member => resolveTypeAnnotation(applyAliasSubstDeep(member, subst), scope)), guards);
    }
    // 'closed' filtered by findGuardsForBinding - only 'none' / 'open' / 'union' reach here. a
    // positive guard that implies no type of its own (`typeof x === 'object'`, an OR group, a
    // structural predicate) is not an arm of anything: it contributes no candidate rather than
    // sinking the ones the other guards imply
    return narrowByGuards(guards.filter(g => g.positive).map(resolveGuardType).filter(Boolean), guards);
  }

  function reset() {
    guardsCache = new WeakMap();
    caseEvaluationFactsCache = new WeakMap();
  }

  return {
    resolveGuardType,
    findGuardsForBinding,
    findAnnotationGuard,
    resolveTypeGuardNarrowing,
    reset,
  };
}
