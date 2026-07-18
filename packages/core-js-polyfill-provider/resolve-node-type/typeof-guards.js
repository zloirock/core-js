// Typeof / instanceof / switch / preceding-exit guard parsing. Walks enclosing if /
// conditional / `&&` / `||` / switch-case / preceding-statement contexts to collect type
// guards that narrow a binding's value within the guarded scope. Each guard is a
// { kind: 'typeof' | 'instanceof' | 'typeof-or', value/values/constructorName, negated,
//   positive } record consumed by the broader resolution pipeline to filter member-access
// against the narrowed Type. Condition parsing is VAR-AGNOSTIC (`{ varName, guard }`
// entries): the preceding-exit sibling shapes index a whole statement list in one pass,
// keyed by variable name; the parent-climb shapes filter the entries per queried binding.
//
// Public surface (returned by `createTypeofGuards`):
//   - `findEnclosingTypeGuards({ path, varName, isConst, binding })` - top-level entry,
//     walks the AST upward collecting all applicable guards
//   - `flattenCondition` / `resolveExitCondition` / `getStatementSiblings` - re-exposed
//     for `discriminant-narrow` which receives them via service-object
//   - `reset()` - clears the per-file `earlyExitGuardsCache` WeakMap; called from the
//     factory's per-file reset path
//
// Service-object captures cross-cluster deps: `t` for AST predicates, the closure-bound
// `peelNegation` / `isLiteralOf` / `getMemberProperty` / `constantBindingPath` /
// `lookupNested` / `getOrInitMap` AST helpers, the predicate-guard entries from the
// already-extracted cluster, and the `KNOWN_STATIC_TYPE_GUARDS` table for built-in
// predicate hint lookup
import { getOrInitMap } from './base.js';
import {
  SOURCE_ORDER_STATEMENT_HOST_TYPES,
  cachedContainerPaths,
  peeledLabelNames,
  peelLabeledStatementPath,
  unwrapExpressionChain,
  unwrapParens,
  unwrapRuntimeExpr,
} from '../helpers/ast-patterns.js';
import { globalProxyMemberName } from '../helpers/class-walk.js';
import { guardFromHint, instanceofGuard, isTypeofVar, typeofGuard, typeofVarName } from './guard-shapes.js';

const EMPTY_ENTRIES = [];

function flipGuardEntries(entries) {
  for (const { guard } of entries) guard.negated = !guard.negated;
  return entries;
}

export function createTypeofGuards({
  t,
  getScopeBinding,
  peelNegation,
  isLiteralOf,
  getMemberProperty,
  constantBindingPath,
  lookupNested,
  parseUserPredicateGuardEntries,
  parseAssertionGuardEntries,
  blockAlwaysExits,
  canFallThrough,
  KNOWN_STATIC_TYPE_GUARDS,
  babelBindingAdapter,
}) {
  // VAR-AGNOSTIC single-condition parser: extracts every `{ varName, guard }` entry a test
  // expression carries. most shapes name exactly one variable; a user-predicate call may
  // name several through distinct overload headers. per-name consumers filter the entries
  function parseTypeGuardEntries(testNode, scope) {
    const peeled = peelNegation(testNode);
    // unwrapExpressionChain alternates paren / chain / TS-wrapper / SequenceExpression-tail
    // peels until stable. peelNegation only strips unary `!`; without this, mixed wrappers
    // (`(side(), (typeof x === 'string'))` or `((typeof x === 'string') as boolean)`)
    // leak past the BinaryExpression dispatch and the narrow drops
    const test = unwrapExpressionChain(peeled.test);
    let { negated } = peeled;
    if (test.type === 'BinaryExpression') {
      const { operator } = test;
      // unwrap parens + ChainExpression + TS wrappers so `(x as any) instanceof Array`
      // and `x! instanceof Array` narrow the same as bare `x instanceof Array`
      const left = unwrapRuntimeExpr(test.left);
      const right = unwrapRuntimeExpr(test.right);
      const isNegatedOp = operator === '!==' || operator === '!=';
      if (isNegatedOp || operator === '===' || operator === '==') {
        if (isNegatedOp) negated = !negated;
        // pick the `typeof <var>` side explicitly so `typeof a === typeof b` doesn't misfire
        // (both sides are typeof-vars, neither leaves a literal side - no guard extracts)
        const leftName = typeofVarName(left);
        const typeofName = leftName ?? typeofVarName(right);
        if (typeofName !== null) {
          const literalSide = leftName !== null ? right : left;
          if (isLiteralOf(literalSide, 'String')) {
            return [{ varName: typeofName, guard: typeofGuard(literalSide.value, negated) }];
          }
          // template literal with no expressions: `object` === typeof x
          if (literalSide.type === 'TemplateLiteral' && literalSide.expressions.length === 0) {
            return [{ varName: typeofName, guard: typeofGuard(literalSide.quasis[0].value.cooked, negated) }];
          }
        }
        // `<typeguard> ==/=== false` / `<typeguard> !=/!== true` etc: strip the boolean
        // comparison and recurse on the non-literal side. derived flip: outer.truthy
        // <=> inner.truthy XOR (bool XOR negated). so flip the inner-guard polarity iff
        // `bool === negated` (negated already combines outer `!` prefix and `!=/!==` op)
        const litLeft = isLiteralOf(left, 'Boolean');
        const litRight = !litLeft && isLiteralOf(right, 'Boolean');
        if (litLeft || litRight) {
          const litSide = litLeft ? left : right;
          const innerExpr = litLeft ? right : left;
          const innerEntries = parseTypeGuardEntries(innerExpr, scope);
          if (innerEntries.length) {
            return litSide.value === negated ? flipGuardEntries(innerEntries) : innerEntries;
          }
        }
      }
      if (operator === 'instanceof' && left.type === 'Identifier') {
        // pass scope + adapter so user-shadowed `globalThis`/`self` are detected and skipped:
        // without scope, `x instanceof globalThis.Map` would resolve to global Map even when
        // `globalThis` is locally shadowed (e.g. `function f(globalThis: { Map: any }) {...}`)
        const constructorName = right.type === 'Identifier'
          ? right.name
          : globalProxyMemberName({ node: right, scope, adapter: babelBindingAdapter, path: null });
        if (constructorName) return [{ varName: left.name, guard: instanceofGuard(constructorName, negated) }];
      }
    }
    // KNOWN_STATIC_TYPE_GUARDS (`Array.isArray` / `Number.isFinite` / ...) narrow first-arg
    // only; extra trailing args are ignored at runtime, so accepting them matches user intent.
    // user predicates with positional arg-binding via `parameterName` inspect the call's full
    // args list to find the slot the predicate names (so `function isFoo(opts, x): x is Foo`
    // narrows the second arg). the built-in hint wins for the first-arg name; predicate
    // entries for OTHER names still surface (a member predicate may bind a later arg).
    // OptionalCallExpression (`Array.isArray?.(x)`) is babel's optional-call shape; ESTree
    // wraps it in ChainExpression which `peelNegation`'s `unwrapRuntimeExpr` already strips
    if ((test.type === 'CallExpression' || test.type === 'OptionalCallExpression')
        && test.arguments?.length >= 1) {
      const { callee } = test;
      const propName = getMemberProperty(callee);
      let hintEntry = null;
      if (propName !== null && callee.object?.type === 'Identifier') {
        // `unwrapExpressionChain` peels paren + ChainExpression + TS expression wrappers
        // (`as`, `satisfies`, `<T>cast`, `!`) AND SequenceExpression tail. parity with
        // the user-predicate path so `Array.isArray((0, x as any))` (any mix of side
        // effects + TS wrappers) narrows same as bare `Array.isArray(x)`
        const arg0 = unwrapExpressionChain(test.arguments[0]);
        if (arg0.type === 'Identifier') {
          const hint = lookupNested(KNOWN_STATIC_TYPE_GUARDS, callee.object.name, propName);
          if (hint) hintEntry = { varName: arg0.name, guard: guardFromHint(hint, negated) };
        }
      }
      // pass the full call node: an optional `?.()` lives on the call (`OptionalCallExpression`
      // / `ChainExpression`), not on `callee`, so the predicate guard can gate the complement branch
      const predicateEntries = parseUserPredicateGuardEntries({ callee, scope, negated, args: test.arguments, call: test });
      if (!hintEntry) return predicateEntries;
      const rest = predicateEntries.filter(e => e.varName !== hintEntry.varName);
      return rest.length ? [hintEntry, ...rest] : [hintEntry];
    }
    return EMPTY_ENTRIES;
  }

  // flatten a && b && c when condition is true, or a || b || c when condition is false
  // only flattens the matching operator; mixed operators stay as opaque nodes
  function flattenCondition(node, operator) {
    const result = [];
    const stack = [unwrapParens(node)];
    while (stack.length) {
      const current = unwrapParens(stack.pop());
      if (current.type === 'LogicalExpression' && current.operator === operator) {
        stack.push(current.right, current.left);
      } else {
        result.push(current);
      }
    }
    return result;
  }

  // parse an OR group of typeof guards: typeof x === 'a' || typeof x === 'b' (conditionTrue=true)
  // or De Morgan form: typeof x !== 'a' && typeof x !== 'b' (conditionTrue=false).
  // every part must guard the SAME variable - mixed-name groups narrow nothing
  function parseTypeofOrGuardEntry(node, conditionTrue) {
    const operator = conditionTrue ? '||' : '&&';
    const expectNegated = !conditionTrue;
    node = unwrapParens(node);
    if (node.type !== 'LogicalExpression' || node.operator !== operator) return null;
    const parts = flattenCondition(node, operator);
    const values = new Set();
    let orName = null;
    for (const part of parts) {
      // user predicates are unrelated to typeof - pass null scope to keep this fast
      const [entry, extra] = parseTypeGuardEntries(part, null);
      if (!entry || extra || entry.guard.kind !== 'typeof' || entry.guard.negated !== expectNegated) return null;
      if (orName === null) orName = entry.varName;
      else if (orName !== entry.varName) return null;
      values.add(entry.guard.value);
    }
    return values.size >= 2
      ? { varName: orName, guard: { kind: 'typeof-or', values, negated: expectNegated } }
      : null;
  }

  // VAR-AGNOSTIC condition extraction with && / || flattening: every `{ varName, guard }`
  // entry the condition carries, `positive` polarity applied per guard. scope is the lookup
  // scope for resolving user-defined type predicate functions
  function extractConditionGuardEntries({ testNode, conditionTrue, scope }) {
    const parts = flattenCondition(testNode, conditionTrue ? '&&' : '||');
    const entries = [];
    for (const part of parts) {
      let partEntries = parseTypeGuardEntries(part, scope);
      if (!partEntries.length) {
        const orEntry = parseTypeofOrGuardEntry(part, conditionTrue);
        if (orEntry) partEntries = [orEntry];
      }
      for (const entry of partEntries) {
        entry.guard.positive = conditionTrue !== entry.guard.negated;
        entries.push(entry);
      }
    }
    return entries;
  }

  // per-name view over the var-agnostic extraction - serves the parent-climb shapes
  // (conditional / switch hosts), which query one binding at a time
  function parseGuardsFromCondition({ testNode, conditionTrue, varName, scope }) {
    const guards = [];
    for (const entry of extractConditionGuardEntries({ testNode, conditionTrue, scope })) {
      if (entry.varName === varName) guards.push(entry.guard);
    }
    return guards;
  }

  // if / ternary / && / || - unified: parse guards from condition, determine polarity
  function findConditionalGuards(current, varName) {
    const parent = current.parentPath;
    if (!parent) return [];
    let conditionTrue, testNode;
    if (t.isIfStatement(parent.node) || t.isConditionalExpression(parent.node)) {
      const { key } = current;
      if (key !== 'consequent' && key !== 'alternate') return [];
      conditionTrue = key === 'consequent';
      testNode = parent.node.test;
    } else if (t.isLogicalExpression(parent.node) && current.key === 'right') {
      const { operator } = parent.node;
      if (operator !== '&&' && operator !== '||') return [];
      conditionTrue = operator === '&&';
      testNode = parent.node.left;
    } else return [];
    return parseGuardsFromCondition({ testNode, conditionTrue, varName, scope: current.scope });
  }

  // resolve a string value from a case test: StringLiteral directly or constant Identifier binding
  function caseTestStringValue(test, scope) {
    if (!test) return null;
    if (isLiteralOf(test, 'String')) return test.value;
    if (test.type === 'Identifier') {
      const bindingPath = constantBindingPath(test.name, scope);
      if (t.isVariableDeclarator(bindingPath?.node)) {
        const { init } = bindingPath.node;
        if (isLiteralOf(init, 'String')) return init.value;
      }
    }
    return null;
  }

  // switch (typeof x) { case 'string': ... ; default: ... }
  function findSwitchCaseGuards(current, varName) {
    if (!t.isSwitchCase(current.parentPath?.node)) return [];
    const switchCase = current.parentPath;
    const switchStmt = switchCase.parentPath;
    if (!t.isSwitchStatement(switchStmt?.node)) return [];
    // peel paren / TS-wrapper / SE-tail from discriminant. oxc preserves `switch
    // ((typeof x))` / `switch ((typeof x) as 'string' | 'number')`; `unwrapExpressionChain`
    // also handles `switch ((side(), typeof x))` where SE prefix is runtime-irrelevant
    if (!isTypeofVar(unwrapExpressionChain(switchStmt.node.discriminant), varName)) return [];
    const { cases } = switchStmt.node;
    const { scope } = switchCase;
    const caseIndex = cases.indexOf(switchCase.node);
    const caseValue = caseTestStringValue(switchCase.node.test, scope);
    // specific case: typeof value is known
    if (caseValue !== null) {
      // collect fall-through predecessors into a typeof-or group
      const values = new Set([caseValue]);
      for (let i = caseIndex - 1; i >= 0; i--) {
        if (!canFallThrough(cases[i])) break;
        // bail if default or non-resolvable test in the fall-through chain
        const predValue = caseTestStringValue(cases[i].test, scope);
        if (predValue === null) return [];
        values.add(predValue);
      }
      if (values.size === 1) return [{ kind: 'typeof', value: caseValue, positive: true, negated: false }];
      return [{ kind: 'typeof-or', values, negated: false, positive: true }];
    }
    // default case: none of the explicit cases matched -> negative guards for each
    if (switchCase.node.test === null) {
      // bail if a preceding case can fall through to default - negative guards would be unsound
      if (caseIndex > 0 && canFallThrough(cases[caseIndex - 1])) return [];
      const guards = [];
      for (const $case of cases) {
        const value = caseTestStringValue($case.test, scope);
        if (value !== null) guards.push({ kind: 'typeof', value, positive: false, negated: false });
      }
      return guards;
    }
    return [];
  }

  // if (...) return; -> false (consequent exits, condition was true -> narrowed type is !condition)
  // if (...) {} else return; -> true (alternate exits, condition was true -> narrowed type is condition)
  // `blockedLabels` = label names an enclosing LabeledStatement peel discarded: a
  // `break <label>` targeting one of them resumes right AFTER the labeled guard - at the
  // very use the guard was to protect - so it must NOT count as an exit (else the
  // "exiting" branch's runtime values reach the use un-narrowed: `outer: if (typeof x
  // === "string") break outer; x.at(0)` runs `.at` on the string)
  function resolveExitCondition(sibling, blockedLabels = null) {
    if (!t.isIfStatement(sibling.node)) return null;
    if (blockAlwaysExits(sibling.get('consequent'), 0, blockedLabels)) return false;
    if (sibling.node.alternate && blockAlwaysExits(sibling.get('alternate'), 0, blockedLabels)) return true;
    return null;
  }

  // shared sibling classification for the guard index. LabeledStatement wrappers
  // (`outer: inner: if (...) return;`) peel to the wrapped body first - the label is
  // irrelevant to guard polarity. cached per node; the cached peeled PATH shares the
  // sibling caches' staleness contract
  const siblingExitConditionCache = new WeakMap();
  function siblingExitCondition(sibling) {
    const { node } = sibling;
    let cached = siblingExitConditionCache.get(node);
    if (!cached) {
      const blockedLabels = peeledLabelNames(sibling);
      const peeled = peelLabeledStatementPath(sibling);
      cached = { peeled, conditionTrue: resolveExitCondition(peeled, blockedLabels) };
      siblingExitConditionCache.set(node, cached);
    }
    return cached;
  }

  // per statement-LIST guard index: var-agnostic extraction, entries grouped by variable
  // name as `[{ idx, guards }]` blocks in ascending statement order (per-statement guards
  // keep extraction order). the per-(use, name) sibling scan this replaces re-parsed every
  // preceding statement per query - O(statements) each, quadratic across a large flat scope.
  // INCREMENTAL up to the highest queried statement position: queries only ever ask about
  // PRECEDING statements, which the traversal cursor has already passed - statements ahead
  // of the cursor must not be parsed (estree-toolkit initialises a path's scope only when
  // the traverser reaches it, and predicate resolution reads that scope), so each statement
  // is parsed exactly once, at the maturity the per-query scan parsed it. keyed on the exact
  // paths ARRAY `cachedContainerPaths` handed out: that cache re-validates node identity per
  // retrieval and returns a NEW array when the list changed, so this index inherits the
  // sibling caches' staleness contract
  let exitGuardIndexCache = new WeakMap();
  function exitGuardIndexParsedBefore(siblings, limit) {
    let index = exitGuardIndexCache.get(siblings);
    if (!index) exitGuardIndexCache.set(siblings, index = { parsedUpTo: 0, byName: new Map() });
    for (let i = index.parsedUpTo; i < limit; i++) {
      // unified sibling shapes: condition-bearing early-exit (`if (typeof x === 'string')
      // return;`) and assertion statement (`assertString(x);`)
      const { peeled, conditionTrue } = siblingExitCondition(siblings[i]);
      const entries = conditionTrue !== null
        ? extractConditionGuardEntries({ testNode: peeled.node.test, conditionTrue, scope: peeled.scope })
        : parseAssertionGuardEntries(peeled);
      for (const { varName, guard } of entries) {
        let blocks = index.byName.get(varName);
        if (!blocks) index.byName.set(varName, blocks = []);
        const last = blocks.at(-1);
        if (last?.idx === i) last.guards.push(guard);
        else blocks.push({ idx: i, guards: [guard] });
      }
    }
    if (limit > index.parsedUpTo) index.parsedUpTo = limit;
    return index.byName;
  }

  // if (typeof x === 'string') return; -> x is narrowed after the if
  // `assertArray(x)` -> x is narrowed after the call (asserts-predicate shape)
  // collects ALL preceding guards NEAREST-FIRST (descending statement order, extraction
  // order within a statement) - the order the per-statement backward scan produced
  function findPrecedingExitGuards(siblings, index, varName) {
    const blocks = exitGuardIndexParsedBefore(siblings, Math.min(index, siblings.length)).get(varName);
    if (!blocks) return EMPTY_ENTRIES;
    const guards = [];
    for (let b = blocks.length - 1; b >= 0; b--) {
      if (blocks[b].idx < index) guards.push(...blocks[b].guards);
    }
    return guards;
  }

  // statement index of the NEAREST preceding sibling guarding `varName`, -1 when none -
  // the mutation-invalidation walk climbs from exactly that statement
  function nearestPrecedingGuardIndex(siblings, index, varName) {
    const blocks = exitGuardIndexParsedBefore(siblings, Math.min(index, siblings.length)).get(varName);
    if (blocks) {
      for (let b = blocks.length - 1; b >= 0; b--) {
        if (blocks[b].idx < index) return blocks[b].idx;
      }
    }
    return -1;
  }

  // get the statement list containing `current` if it's a numbered member of a block-like parent.
  // StaticBlock (`class C { static { stmts } }`) holds its statements in the same `body` slot
  // as a regular BlockStatement - sibling early-exit guards should propagate the same way
  function getStatementSiblings(current) {
    if (typeof current.key !== 'number') return null;
    const parent = current.parentPath;
    if (current.listKey === 'body' && SOURCE_ORDER_STATEMENT_HOST_TYPES.has(parent.node?.type)) {
      return cachedContainerPaths(parent, 'body');
    }
    if (current.listKey === 'consequent' && t.isSwitchCase(parent.node)) return cachedContainerPaths(parent, 'consequent');
    return null;
  }

  // hot path: walked repeatedly from both findEnclosingTypeGuards and hasMutationAfterGuards
  // as they climb parent paths. same (pathNode, varName) pair is hit many times across
  // sibling identifier walks; WeakMap keyed on the path node avoids re-scanning siblings
  let earlyExitGuardsCache = new WeakMap();
  function findEarlyExitGuards(current, varName) {
    const node = current?.node;
    if (!node) return [];
    const byVar = getOrInitMap(earlyExitGuardsCache, node);
    if (byVar.has(varName)) return byVar.get(varName);
    const siblings = getStatementSiblings(current);
    const result = siblings ? findPrecedingExitGuards(siblings, current.key, varName) : [];
    byVar.set(varName, result);
    return result;
  }

  // shadow check: a guard's test lives in the enclosing scope (parent of `current` in the
  // walk, sibling-aware for early-exit). when that scope's `varName` resolves to a different
  // binding than the inner usage's, the guard refers to a shadowed identifier and must not
  // narrow our binding. shared by findEnclosingTypeGuards and hasMutationAfterGuards.
  // routes through the shared lookup, not a raw `scope.getBinding`: the identity compare is
  // against what the CALLER resolved, and only the shared lookup answers alike on both parsers
  // for a nested-block `var` (one hoists it natively, the other needs the synthesized twin) -
  // `testPath` anchors that synthesis, so it must be the path the scope was taken from
  function guardAppliesToBinding(testPath, varName, binding) {
    return !binding || getScopeBinding(testPath?.scope, varName, testPath) === binding;
  }

  // collect ALL type guards along the AST path for cumulative narrowing.
  // const bindings can't be reassigned - function boundaries don't invalidate guards.
  // `boundaryHost` (optional): stop after the iteration whose host (`current.parentPath.node`)
  // is that node - used when a reassignment between a fresh inner conditional and the outer
  // guards has made those outer guards stale, so only guards from the host inward are kept
  function findEnclosingTypeGuards({ path, varName, isConst = false, binding = null, boundaryHost = null }) {
    const guards = [];
    for (let current = path.parentPath; current; current = current.parentPath) {
      if (t.isFunction(current.node) && !isConst) break;
      if (guardAppliesToBinding(current.parentPath, varName, binding)) {
        guards.push(
          ...findConditionalGuards(current, varName),
          ...findSwitchCaseGuards(current, varName),
          ...findEarlyExitGuards(current, varName),
        );
      }
      if (boundaryHost && current.parentPath?.node === boundaryHost) break;
    }
    return guards.length ? guards : null;
  }

  function reset() {
    earlyExitGuardsCache = new WeakMap();
    exitGuardIndexCache = new WeakMap();
  }

  return {
    findEnclosingTypeGuards,
    flattenCondition,
    resolveExitCondition,
    // cached per-statement peel + exit-condition classification - shared with the
    // discriminant sibling index so both sibling scans classify statements identically
    siblingExitCondition,
    getStatementSiblings,
    // exposed for the factory's `hasMutationAfterGuards` which walks guard sites alongside
    // reassignment positions to invalidate narrowing across mutations between guard and use
    nearestPrecedingGuardIndex,
    findConditionalGuards,
    findSwitchCaseGuards,
    findEarlyExitGuards,
    guardAppliesToBinding,
    reset,
  };
}
