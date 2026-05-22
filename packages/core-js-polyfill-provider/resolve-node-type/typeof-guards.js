// Typeof / instanceof / switch / preceding-exit guard parsing. Walks enclosing if /
// conditional / `&&` / `||` / switch-case / preceding-statement contexts to collect type
// guards that narrow a binding's value within the guarded scope. Each guard is a
// { kind: 'typeof' | 'instanceof' | 'typeof-or', value/values/constructorName, negated,
//   positive } record consumed by the broader resolution pipeline to filter member-access
// against the narrowed Type.
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
import { peelLabeledStatementPath, unwrapExpressionChain, unwrapParens, unwrapRuntimeExpr } from '../helpers/ast-patterns.js';
import { globalProxyMemberName } from '../helpers/class-walk.js';
import { guardFromHint, instanceofGuard, isTypeofVar, typeofGuard } from './guard-shapes.js';

export function createTypeofGuards({
  t,
  peelNegation,
  isLiteralOf,
  getMemberProperty,
  constantBindingPath,
  lookupNested,
  parseUserPredicateGuard,
  parseAssertionStatementGuard,
  blockAlwaysExits,
  canFallThrough,
  KNOWN_STATIC_TYPE_GUARDS,
  babelBindingAdapter,
}) {
  function parseTypeGuard(testNode, varName, scope) {
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
        // pick the `typeof varName` side explicitly so `typeof a === typeof b` doesn't misfire
        const leftIsTypeof = isTypeofVar(left, varName);
        const rightIsTypeof = !leftIsTypeof && isTypeofVar(right, varName);
        if (leftIsTypeof || rightIsTypeof) {
          const literalSide = leftIsTypeof ? right : left;
          if (isLiteralOf(literalSide, 'String')) return typeofGuard(literalSide.value, negated);
          // template literal with no expressions: `object` === typeof x
          if (literalSide.type === 'TemplateLiteral' && literalSide.expressions.length === 0) {
            return typeofGuard(literalSide.quasis[0].value.cooked, negated);
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
          const innerGuard = parseTypeGuard(innerExpr, varName, scope);
          if (innerGuard) {
            if (litSide.value === negated) innerGuard.negated = !innerGuard.negated;
            return innerGuard;
          }
        }
      }
      if (operator === 'instanceof'
        && left.type === 'Identifier' && left.name === varName) {
        // pass scope + adapter so user-shadowed `globalThis`/`self` are detected and skipped:
        // without scope, `x instanceof globalThis.Map` would resolve to global Map even when
        // `globalThis` is locally shadowed (e.g. `function f(globalThis: { Map: any }) {...}`)
        const constructorName = right.type === 'Identifier'
          ? right.name
          : globalProxyMemberName({ node: right, scope, adapter: babelBindingAdapter, path: null });
        if (constructorName) return instanceofGuard(constructorName, negated);
      }
    }
    // KNOWN_STATIC_TYPE_GUARDS (`Array.isArray` / `Number.isFinite` / ...) narrow first-arg
    // only; extra trailing args are ignored at runtime, so accepting them matches user intent.
    // user predicates with positional arg-binding via `parameterName` route through
    // `parseUserPredicateGuard`, which inspects the call's full args list to find the slot
    // matching `varName` (so `function isFoo(opts, x): x is Foo` narrows the second arg).
    // OptionalCallExpression (`Array.isArray?.(x)`) is babel's optional-call shape; ESTree
    // wraps it in ChainExpression which `peelNegation`'s `unwrapRuntimeExpr` already strips
    if ((test.type === 'CallExpression' || test.type === 'OptionalCallExpression')
        && test.arguments?.length >= 1) {
      const { callee } = test;
      const propName = getMemberProperty(callee);
      if (propName !== null && callee.object?.type === 'Identifier') {
        // `unwrapExpressionChain` peels paren + ChainExpression + TS expression wrappers
        // (`as`, `satisfies`, `<T>cast`, `!`) AND SequenceExpression tail. parity with
        // the user-predicate path so `Array.isArray((0, x as any))` (any mix of side
        // effects + TS wrappers) narrows same as bare `Array.isArray(x)`
        const arg0 = unwrapExpressionChain(test.arguments[0]);
        if (arg0.type === 'Identifier' && arg0.name === varName) {
          const hint = lookupNested(KNOWN_STATIC_TYPE_GUARDS, callee.object.name, propName);
          if (hint) return guardFromHint(hint, negated);
        }
      }
      const userGuard = parseUserPredicateGuard({ callee, scope, negated, args: test.arguments, varName });
      if (userGuard) return userGuard;
    }
    return null;
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
  // or De Morgan form: typeof x !== 'a' && typeof x !== 'b' (conditionTrue=false)
  function parseTypeofOrGuard(node, varName, conditionTrue) {
    const operator = conditionTrue ? '||' : '&&';
    const expectNegated = !conditionTrue;
    node = unwrapParens(node);
    if (node.type !== 'LogicalExpression' || node.operator !== operator) return null;
    const parts = flattenCondition(node, operator);
    const values = new Set();
    for (const part of parts) {
      // user predicates are unrelated to typeof - pass null scope to keep this fast
      const guard = parseTypeGuard(part, varName, null);
      if (!guard || guard.kind !== 'typeof' || guard.negated !== expectNegated) return null;
      values.add(guard.value);
    }
    return values.size >= 2 ? { kind: 'typeof-or', values, negated: expectNegated } : null;
  }

  // extract guards for varName from a condition, applying && / || flattening.
  // scope is the lookup scope for resolving user-defined type predicate functions.
  function parseGuardsFromCondition({ testNode, conditionTrue, varName, scope }) {
    const parts = flattenCondition(testNode, conditionTrue ? '&&' : '||');
    const guards = [];
    for (const part of parts) {
      const guard = parseTypeGuard(part, varName, scope) || parseTypeofOrGuard(part, varName, conditionTrue);
      if (guard) {
        guard.positive = conditionTrue !== guard.negated;
        guards.push(guard);
      }
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
  function resolveExitCondition(sibling) {
    if (!t.isIfStatement(sibling.node)) return null;
    if (blockAlwaysExits(sibling.get('consequent'))) return false;
    if (sibling.node.alternate && blockAlwaysExits(sibling.get('alternate'))) return true;
    return null;
  }

  // shared sibling-to-guards parser. unifies condition-bearing early-exit
  // (`if (typeof x === 'string') return;`) and assertion-statement (`assertString(x);`).
  // LabeledStatement wrappers (`outer: inner: if (...) return;`) peel to the wrapped body
  // first - the label is irrelevant to guard polarity
  function parseSiblingGuards(sibling, varName) {
    sibling = peelLabeledStatementPath(sibling);
    const conditionTrue = resolveExitCondition(sibling);
    if (conditionTrue !== null) {
      return parseGuardsFromCondition({ testNode: sibling.node.test, conditionTrue, varName, scope: sibling.scope });
    }
    const assertionGuard = parseAssertionStatementGuard(sibling, varName);
    return assertionGuard ? [assertionGuard] : [];
  }

  // does this single sibling apply a narrowing guard to `varName`?
  function siblingGuardsBinding(sibling, varName) {
    return parseSiblingGuards(sibling, varName).length > 0;
  }

  // if (typeof x === 'string') return; -> x is narrowed after the if
  // `assertArray(x)` -> x is narrowed after the call (asserts-predicate shape)
  // collects ALL preceding guards, including && / || flattening
  function findPrecedingExitGuards(siblings, index, varName) {
    const guards = [];
    for (let i = index - 1; i >= 0; i--) guards.push(...parseSiblingGuards(siblings[i], varName));
    return guards;
  }

  // get the statement list containing `current` if it's a numbered member of a block-like parent.
  // StaticBlock (`class C { static { stmts } }`) holds its statements in the same `body` slot
  // as a regular BlockStatement - sibling early-exit guards should propagate the same way
  function getStatementSiblings(current) {
    if (typeof current.key !== 'number') return null;
    const parent = current.parentPath;
    if (current.listKey === 'body'
      && (t.isBlockStatement(parent.node) || t.isProgram(parent.node) || t.isStaticBlock(parent.node))) {
      return parent.get('body');
    }
    if (current.listKey === 'consequent' && t.isSwitchCase(parent.node)) return parent.get('consequent');
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
  // narrow our binding. shared by findEnclosingTypeGuards and hasMutationAfterGuards
  function guardAppliesToBinding(testScope, varName, binding) {
    return !binding || testScope?.getBinding(varName) === binding;
  }

  // collect ALL type guards along the AST path for cumulative narrowing.
  // const bindings can't be reassigned - function boundaries don't invalidate guards
  function findEnclosingTypeGuards({ path, varName, isConst = false, binding = null }) {
    const guards = [];
    for (let current = path.parentPath; current; current = current.parentPath) {
      if (t.isFunction(current.node) && !isConst) break;
      if (!guardAppliesToBinding(current.parentPath?.scope, varName, binding)) continue;
      guards.push(
        ...findConditionalGuards(current, varName),
        ...findSwitchCaseGuards(current, varName),
        ...findEarlyExitGuards(current, varName),
      );
    }
    return guards.length ? guards : null;
  }

  function reset() {
    earlyExitGuardsCache = new WeakMap();
  }

  return {
    findEnclosingTypeGuards,
    flattenCondition,
    resolveExitCondition,
    getStatementSiblings,
    // exposed for the factory's `hasMutationAfterGuards` which walks guard sites alongside
    // reassignment positions to invalidate narrowing across mutations between guard and use
    siblingGuardsBinding,
    findConditionalGuards,
    findSwitchCaseGuards,
    findEarlyExitGuards,
    guardAppliesToBinding,
    reset,
  };
}
