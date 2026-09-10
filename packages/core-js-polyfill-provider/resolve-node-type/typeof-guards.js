// Typeof / instanceof / switch / preceding-exit guard parsing. Walks enclosing if /
// conditional / `&&` / `||` / switch-case / preceding-statement contexts to collect type
// guards that narrow a binding's value within the guarded scope. Each guard is a descriptor
// built in `guard-shapes.js` - `{ kind: 'typeof' | 'instanceof' | 'typeof-or' | 'annotation',
// value / constructorName / values, negated, positive, optionalCall?, annotation?, scope? }` -
// consumed by the broader resolution pipeline to filter member-access against the narrowed
// Type. Condition parsing is VAR-AGNOSTIC (`{ varName, guard }` entries): the preceding-exit
// sibling shapes index a whole statement list in one pass, keyed by variable name; the
// parent-climb shapes filter the entries per queried binding.
//
// Public surface (returned by `createTypeofGuards`):
//   - `findEnclosingTypeGuards({ path, varName, isConst, binding })` - top-level entry,
//     walks the AST upward collecting all applicable guards
//   - `flattenCondition` / `siblingExitCondition` / `getStatementSiblings` - re-exposed
//     for `discriminant-narrow` which receives them via service-object
//   - `reset()` - the factory's per-file reset path re-mints `conditionEntriesCache`,
//     `earlyExitGuardsCache` and `exitGuardIndexCache`, which bounds the per-file footprint and
//     makes it deterministic. it cures no staleness: it runs at file EXIT, past every in-place
//     rewrite the file's own resolution has already read through. correctness rests on the
//     node-keyed invariant `resolve-node-type.js` states, so a cache added here earns its KEYS
//     rather than a line in reset - `siblingExitConditionCache` needs no line there at all, keyed
//     as it is on the statement node itself
//
// Service-object captures cross-cluster deps: `t` for AST predicates, the closure-bound
// `peelNegation` / `isLiteralOf` / `getMemberProperty` / `constantBindingPath` /
// `lookupNested` / `getOrInitMap` AST helpers, the predicate-guard entries from the
// already-extracted cluster, the `KNOWN_STATIC_TYPE_GUARDS` table for built-in predicate hint
// lookup, and the injector's alias channel (`staticPairFromPolyfillBinding`) that names the
// built-in a pure-import binding stands for
import { getOrInitMap } from './base.js';
import {
  SOURCE_ORDER_STATEMENT_HOST_TYPES,
  cachedContainerPaths,
  peeledLabelNames,
  siblingHostingIndex,
  peelLabeledStatementPath,
  readStepIsDeferred,
  unwrapExpressionChain,
  unwrapParens,
  unwrapRuntimeExpr,
} from '../helpers/ast-patterns.js';
import { hasRange, nodeRangeContains } from './ast-shapes.js';
import { resolve as resolveBuiltInMeta } from '../index.js';
import {
  globalProxyMemberName,
} from '../detect-usage/resolve.js';
import {
  guardFromHint,
  hasOptionalChainInCall,
  instanceofGuard,
  isTypeofVar,
  markOptionalCall,
  stampPolarity,
  typeofGuard,
  typeofOrGuard,
  typeofVarName,
} from './guard-shapes.js';

const EMPTY_ENTRIES = [];

// can the `?.` on a BUILT-IN static guard's call actually short-circuit? two conditions, and the
// answer is no only when both hold.
// core-js installs NOTHING for the guard - neither its namespace nor the static itself carries a
// definition here - so it stands on the runtime floor every supported engine already has, the
// library calls it natively in its own internals, and no configuration can take it away
// (`Array.isArray`). a guard core-js CAN install is build-conditional in BOTH directions - a target
// that lacks it and an `exclude` that drops its module leave the static genuinely absent - and keeps
// the three-valued stamp: every uncertainty about presence resolves to the wide answer, because the
// stamp is what holds the complement branch's arm and dropping it narrows the injection set.
// ... and every optional segment stands over THAT namespace: the call (`Array.isArray?.(x)`) and the
// member reading the static off a bare namespace identifier (`Array?.isArray(x)`). a `?.` deeper
// down - a realm hop, a call in the receiver - tests a value the presence answer says nothing about
function guardCallCannotShortCircuit({ constructor, method }, callee) {
  const peeled = unwrapRuntimeExpr(callee);
  if (peeled?.type !== 'MemberExpression' && peeled?.type !== 'OptionalMemberExpression') return false;
  if (unwrapRuntimeExpr(peeled.object)?.type !== 'Identifier') return false;
  return !resolveBuiltInMeta({ kind: 'global', name: constructor })
    && !resolveBuiltInMeta({ kind: 'property', object: constructor, key: method, placement: 'static' });
}

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
  staticPairFromPolyfillBinding,
}) {
  // the built-in a guard OPERAND names, or null. an unbound name is the global itself; a binding the
  // pass minted stands for the built-in it imports - babel rewrites `Number.isFinite` to
  // `_Number$isFinite` and `x instanceof Promise` to `_Promise` before the receiver behind the guard
  // is resolved, and the injector's hint channel is how every other reader recovers the original; a
  // user binding shadows the name (`const Array = Map; x instanceof Array` really tests `instanceof
  // Map`, so narrowing to the built-in would suppress its polyfill where a real instance flows in).
  // a member spelling (`globalThis.Array`) is the shared proxy-nav walk's, shadow gate included
  function builtInNamedBy(node, scope) {
    if (node.type !== 'Identifier') return globalProxyMemberName({ node, scope, adapter: babelBindingAdapter, path: null });
    if (!scope || !babelBindingAdapter.hasBinding(scope, node.name)) return node.name;
    return babelBindingAdapter.getBindingPolyfillHint(scope, node.name);
  }

  // the `{ constructor, method }` a static-guard CALLEE names, or null: the source's member spelling
  // on a built-in namespace, or the bare pure-import binding a rewrite left in its place, mapped
  // back through the injector's entry path
  function staticGuardCallee(callee, scope) {
    const peeled = unwrapRuntimeExpr(callee);
    const method = getMemberProperty(peeled);
    if (method !== null) {
      const constructor = builtInNamedBy(unwrapRuntimeExpr(peeled.object), scope);
      return constructor ? { constructor, method } : null;
    }
    return peeled.type === 'Identifier' && scope
      ? staticPairFromPolyfillBinding(scope, peeled.name, peeled.start ?? null) : null;
  }

  // VAR-AGNOSTIC single-condition parser: extracts every `{ varName, guard }` entry a test
  // expression carries. most shapes name exactly one variable; a user-predicate call may
  // name several through distinct overload headers. per-name consumers filter the entries.
  // `scope` is the scope the TEST evaluates in - it gates every built-in identification above
  // and resolves user predicates, so no lane may drop it
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
          // the flip algebra holds over `{ true, false }`. a guard whose call may not have run is
          // THREE-valued - `undefined` on a short-circuit - and a comparison against `false` cannot
          // tell that from a genuine answer on either side (`undefined !== false` is truthy, `undefined
          // === false` falsy), so such a guard carries nothing here in either direction
          const trusted = litSide.value ? innerEntries : innerEntries.filter(entry => !entry.guard.optionalCall);
          if (trusted.length) return litSide.value === negated ? flipGuardEntries(trusted) : trusted;
        }
      }
      if (operator === 'instanceof' && left.type === 'Identifier') {
        const constructorName = builtInNamedBy(right, scope);
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
      // an optional `?.()` anywhere on the call may short-circuit without testing the argument:
      // decided ONCE for the call and stamped on every guard it yields, whichever lane minted it
      const optionalCall = hasOptionalChainInCall(test);
      const { callee } = test;
      let hintEntry = null;
      const staticGuard = staticGuardCallee(callee, scope);
      if (staticGuard) {
        // `unwrapExpressionChain` peels paren + ChainExpression + TS expression wrappers
        // (`as`, `satisfies`, `<T>cast`, `!`) AND SequenceExpression tail. parity with
        // the user-predicate path so `Array.isArray((0, x as any))` (any mix of side
        // effects + TS wrappers) narrows same as bare `Array.isArray(x)`
        const arg0 = unwrapExpressionChain(test.arguments[0]);
        if (arg0.type === 'Identifier') {
          const hint = lookupNested(KNOWN_STATIC_TYPE_GUARDS, staticGuard.constructor, staticGuard.method);
          // a `?.` over a static this build cannot be without is dead code, and the guard it carries
          // tested its argument on every path - the complement branch narrows like a plain call's
          const liveOptional = optionalCall && !guardCallCannotShortCircuit(staticGuard, callee);
          if (hint) hintEntry = { varName: arg0.name, guard: markOptionalCall(guardFromHint(hint, negated), liveOptional) };
        }
      }
      const predicateEntries = parseUserPredicateGuardEntries({ callee, scope, negated, args: test.arguments, optionalCall });
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
  // every part must guard the SAME variable - mixed-name groups narrow nothing. each disjunct
  // is parsed in the test's own scope: the built-in gates are soundness inputs, not precision
  // ones, and a group is only ever recognised in the direction that proves membership, so a
  // disjunct whose call may not have run (a `?.()` predicate) is sound there and merely marks
  // the group for the boolean-comparison unwrap above
  function parseTypeofOrGuardEntry(node, conditionTrue, scope) {
    const operator = conditionTrue ? '||' : '&&';
    const expectNegated = !conditionTrue;
    node = unwrapParens(node);
    if (node.type !== 'LogicalExpression' || node.operator !== operator) return null;
    const parts = flattenCondition(node, operator);
    const values = new Set();
    let orName = null;
    let optionalCall = false;
    for (const part of parts) {
      const [entry, extra] = parseTypeGuardEntries(part, scope);
      if (!entry || extra || entry.guard.kind !== 'typeof' || entry.guard.negated !== expectNegated) return null;
      if (orName === null) orName = entry.varName;
      else if (orName !== entry.varName) return null;
      values.add(entry.guard.value);
      optionalCall ||= !!entry.guard.optionalCall;
    }
    return values.size >= 2
      ? { varName: orName, guard: markOptionalCall(typeofOrGuard(values, expectNegated), optionalCall) }
      : null;
  }

  // VAR-AGNOSTIC condition extraction with && / || flattening: every `{ varName, guard }`
  // entry the condition carries, `positive` polarity applied per guard. scope is the lookup
  // scope for resolving user-defined type predicate functions and the built-in gates.
  // memoised per (test node, polarity): the guard climb re-asks one condition for every use
  // below it and for every level of the mutation walk, and the user-predicate lane resolves a
  // callee each time. a test node evaluates in one scope and the descriptors are read-only
  // once stamped, so the cached entries are shared
  let conditionEntriesCache = new WeakMap();
  function extractConditionGuardEntries({ testNode, conditionTrue, scope }) {
    const byPolarity = getOrInitMap(conditionEntriesCache, testNode);
    if (byPolarity.has(conditionTrue)) return byPolarity.get(conditionTrue);
    const parts = flattenCondition(testNode, conditionTrue ? '&&' : '||');
    const entries = [];
    for (const part of parts) {
      let partEntries = parseTypeGuardEntries(part, scope);
      if (!partEntries.length) {
        const orEntry = parseTypeofOrGuardEntry(part, conditionTrue, scope);
        if (orEntry) partEntries = [orEntry];
      }
      for (const entry of partEntries) entries.push({ varName: entry.varName, guard: stampPolarity(entry.guard, conditionTrue) });
    }
    byPolarity.set(conditionTrue, entries);
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

  // shadow check: a guard's test lives in the scope of the node that HOSTS it (the `if`, the
  // switch statement's parent, the statement list). when that scope's `varName` resolves to a
  // different binding than the inner usage's, the guard refers to a shadowed identifier and
  // must not narrow our binding. every lane applies it to its own anchor. routes through the
  // shared lookup, not a raw `scope.getBinding`: the identity compare is against what the
  // CALLER resolved, and only the shared lookup answers alike on both parsers for a
  // nested-block `var` (one hoists it natively, the other needs the synthesized twin) -
  // `testPath` anchors that synthesis, so it must be the path the scope was taken from
  function guardAppliesToBinding(testPath, varName, binding) {
    return !binding || getScopeBinding(testPath.scope, varName, testPath) === binding;
  }

  // if / ternary / && / || - unified: parse guards from condition, determine polarity. the
  // test is parsed in the HOST's scope: a braced branch opens a block of its own, and a name
  // declared in it - a predicate, a namespace - is not what the test read
  function findConditionalGuards(current, varName, binding) {
    const parent = current.parentPath;
    if (!parent) return EMPTY_ENTRIES;
    let conditionTrue, testNode;
    if (t.isIfStatement(parent.node) || t.isConditionalExpression(parent.node)) {
      const { key } = current;
      if (key !== 'consequent' && key !== 'alternate') return EMPTY_ENTRIES;
      conditionTrue = key === 'consequent';
      testNode = parent.node.test;
    } else if (t.isLogicalExpression(parent.node) && current.key === 'right') {
      const { operator } = parent.node;
      if (operator !== '&&' && operator !== '||') return EMPTY_ENTRIES;
      conditionTrue = operator === '&&';
      testNode = parent.node.left;
    } else return EMPTY_ENTRIES;
    if (!guardAppliesToBinding(parent, varName, binding)) return EMPTY_ENTRIES;
    return parseGuardsFromCondition({ testNode, conditionTrue, varName, scope: parent.scope });
  }

  // resolve a string value from a case test: StringLiteral directly or constant Identifier binding
  function caseTestStringValue(rawTest, scope) {
    const test = unwrapRuntimeExpr(rawTest);
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

  // switch (typeof x) { case 'string': ... ; default: ... }. no slot gate: the lane fires only for a
  // case test that IS a string literal or a const-bound identifier, and no use of the guarded
  // binding can stand inside one - so every use reaching here is in a consequent. the
  // discriminant is evaluated OUTSIDE the case block: a case-level lexical shadowing the
  // name is not what `typeof` read, so the identity check anchors on the statement's parent
  function findSwitchCaseGuards(current, varName, binding) {
    if (!t.isSwitchCase(current.parentPath?.node)) return EMPTY_ENTRIES;
    const switchCase = current.parentPath;
    const switchStmt = switchCase.parentPath;
    if (!guardAppliesToBinding(switchStmt.parentPath, varName, binding)) return EMPTY_ENTRIES;
    // peel paren / TS-wrapper / SE-tail from discriminant. oxc preserves `switch
    // ((typeof x))` / `switch ((typeof x) as 'string' | 'number')`; `unwrapExpressionChain`
    // also handles `switch ((side(), typeof x))` where SE prefix is runtime-irrelevant
    if (!isTypeofVar(unwrapExpressionChain(switchStmt.node.discriminant), varName)) return EMPTY_ENTRIES;
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
        if (predValue === null) return EMPTY_ENTRIES;
        values.add(predValue);
      }
      if (values.size === 1) return [stampPolarity(typeofGuard(caseValue, false), true)];
      return [stampPolarity(typeofOrGuard(values, false), true)];
    }
    // default case: none of the explicit cases matched -> negative guards for each
    if (switchCase.node.test === null) {
      // bail if a preceding case can fall through to default - negative guards would be unsound
      if (caseIndex > 0 && canFallThrough(cases[caseIndex - 1])) return EMPTY_ENTRIES;
      const guards = [];
      for (const $case of cases) {
        const value = caseTestStringValue($case.test, scope);
        if (value !== null) guards.push(stampPolarity(typeofGuard(value, false), false));
      }
      return guards;
    }
    return EMPTY_ENTRIES;
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

  // shared sibling classification for the guard index and the mutation walk. LabeledStatement
  // wrappers (`outer: inner: if (...) return;`) peel to the wrapped body first - the label is
  // irrelevant to guard polarity. cached per node; the cached peeled PATH shares the
  // sibling caches' staleness contract
  const siblingExitConditionCache = new WeakMap();
  const NO_SIBLING_GUARD = { peeled: null, conditionTrue: null };
  function siblingExitCondition(sibling) {
    const { node } = sibling;
    // a REMOVED sibling: the index is keyed on the paths array the container cache handed out, and
    // that cache validates by length plus three sampled nodes - an emitter that inserts a statement
    // and drops the one beside it (the assignment-host overwrite does exactly that) leaves both
    // unchanged, so a path whose statement is gone can still be read here. it guards nothing any
    // more, which is the same answer re-materializing the list gives
    if (!node) return NO_SIBLING_GUARD;
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
      if (!peeled) continue;
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
  // collects the preceding guards from `floor` on, NEAREST-FIRST (descending statement order,
  // extraction order within a statement) - the order the per-statement backward scan produced
  function findPrecedingExitGuards(siblings, index, varName, floor) {
    const blocks = exitGuardIndexParsedBefore(siblings, Math.min(index, siblings.length)).get(varName);
    if (!blocks) return EMPTY_ENTRIES;
    const guards = [];
    for (let b = blocks.length - 1; b >= 0; b--) {
      if (blocks[b].idx < index && blocks[b].idx >= floor) guards.push(...blocks[b].guards);
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

  // the slots of a preceding sibling a write is LIVE at the use from: the whole of a plain statement
  // or an assertion, and for an exit guard its test (`if (typeof x !== 'string' || (x = 5, false))
  // return;` - the OR-side runs, the return does not) plus its NON-exiting branch, which falls
  // through to the use; a write in the branch that exits never reaches it. the ONE owner of that
  // slot rule, read by the collection floor below
  function exitGuardLiveSlots(sibling) {
    const { peeled, conditionTrue } = siblingExitCondition(sibling);
    if (!peeled || conditionTrue === null || !t.isIfStatement(peeled.node)) return [sibling.node];
    const { node } = peeled;
    return [node.test, conditionTrue ? node.consequent : node.alternate].filter(Boolean);
  }

  // a preceding guard the binding was written AFTER proves nothing at the use, however that guard
  // ends: the collected set starts at the statement after the last preceding sibling carrying a live
  // write. a write with no source positions may stand anywhere, so every preceding guard is stale.
  // asked per WRITE rather than per sibling: a live slot sits inside its own statement's span, so the
  // one sibling a write can be live in is the one hosting it, and no other sibling has an answer to
  // give. the walk this replaces re-asked every preceding statement about every write, which on one
  // binding carrying writes AND uses at density is cubic in the statement count
  function staleExitFloor(siblings, index, violations) {
    if (!violations?.length) return 0;
    if (violations.some(v => !hasRange(v.node))) return index;
    const limit = Math.min(index, siblings.length);
    let floor = 0;
    for (const v of violations) {
      const host = siblingHostingIndex(siblings, v.node);
      if (host < floor || host >= limit) continue;
      if (exitGuardLiveSlots(siblings[host]).some(slot => nodeRangeContains(slot, v.node))) floor = host + 1;
    }
    return floor;
  }
  let earlyExitGuardsCache = new WeakMap();

  // hot path: walked repeatedly from both findEnclosingTypeGuards and hasMutationAfterGuards
  // as they climb parent paths. same (pathNode, varName) pair is hit many times across
  // sibling identifier walks; WeakMap keyed on the path node avoids re-scanning siblings. the
  // binding is fixed per (use node, name), so the floor computed from its writes is too
  function findEarlyExitGuards(current, varName, binding) {
    const { node } = current;
    const siblings = getStatementSiblings(current);
    if (!siblings || !guardAppliesToBinding(current.parentPath, varName, binding)) return EMPTY_ENTRIES;
    const byVar = getOrInitMap(earlyExitGuardsCache, node);
    if (byVar.has(varName)) return byVar.get(varName);
    // a null binding means the name is bound by nothing - the guard applies to every read of it,
    // and a name nothing declares carries no write for an exit guard to go stale against
    const floor = staleExitFloor(siblings, current.key, binding?.constantViolations);
    const result = findPrecedingExitGuards(siblings, current.key, varName, floor);
    byVar.set(varName, result);
    return result;
  }

  // collect ALL type guards along the AST path for cumulative narrowing. the climb starts at the
  // path itself: an identifier that IS a ternary arm or a logical right operand is guarded by its
  // own host. a read below a deferred context runs at an unknown time relative to the writes above
  // it, so no guard above the context holds for a rebindable binding - the canonical read-side
  // step, so an immediately invoked body stays inside the climb; a const cannot change, and its
  // guards hold anywhere.
  // `boundaryHost` (optional): stop after the iteration whose host (`current.parentPath.node`)
  // is that node - used when a reassignment between a fresh inner conditional and the outer
  // guards has made those outer guards stale, so only guards from the host inward are kept
  function findEnclosingTypeGuards({ path, varName, isConst = false, binding = null, boundaryHost = null }) {
    const guards = [];
    for (let current = path, child = null; current; child = current, current = current.parentPath) {
      if (!isConst && readStepIsDeferred(current, child)) break;
      guards.push(
        ...findConditionalGuards(current, varName, binding),
        ...findSwitchCaseGuards(current, varName, binding),
        ...findEarlyExitGuards(current, varName, binding),
      );
      if (boundaryHost && current.parentPath?.node === boundaryHost) break;
    }
    return guards.length ? guards : null;
  }

  function reset() {
    conditionEntriesCache = new WeakMap();
    earlyExitGuardsCache = new WeakMap();
    exitGuardIndexCache = new WeakMap();
  }

  return {
    findEnclosingTypeGuards,
    flattenCondition,
    // cached per-statement peel + exit-condition classification - shared with the
    // discriminant sibling index and the mutation walk so every sibling scan classifies
    // statements identically
    siblingExitCondition,
    getStatementSiblings,
    // exposed for the factory's `hasMutationAfterGuards` which walks guard sites alongside
    // reassignment positions to invalidate narrowing across mutations between guard and use
    nearestPrecedingGuardIndex,
    findConditionalGuards,
    findSwitchCaseGuards,
    findEarlyExitGuards,
    reset,
  };
}
