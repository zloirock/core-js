// Discriminated-union narrowing. consolidates two collaborating sub-domains:
//   - guards collector (`findDiscriminantGuards`): walks enclosing if / ternary / `&&` /
//     preceding-exit constructs to collect `<obj>.kind === 'tag'` guards that narrow the
//     receiver's type inside the guarded body. Each guard records the discriminator field +
//     literal value (`{field: 'kind', value: 'a', positive: true}`).
//   - narrowing entry points:
//       `narrowDiscriminatedUnion`        - uses the guards above to filter the union to
//         branches whose literal-typed discriminant member agrees with each surviving guard.
//       `narrowUnionByAssignmentLiteral`  - inspects the variable's last preceding `=`
//         assignment; when the RHS is an ObjectExpression whose literal properties uniquely
//         match one branch's literal-typed members, narrows to that branch (mirrors TS's
//         flow-sensitive "narrowing by assignment").
//
// kept in one cluster because `narrowDiscriminatedUnion` calls `findDiscriminantGuards`
// internally - co-location avoids a forward-decl thunk between them.
//
// `findPrecedingBlockAssignment` is exposed for external callers (the broader assignment
// search; weaker invariant than `findLastStraightLineAssignment` from straight-line-flow,
// because it requires only block-child preceding-sibling reachability, not var-scope-wide
// straight-line execution).
import {
  isMemberAccessNode,
  isMemberWriteHost,
  peelLabeledStatementPath,
  SOURCE_ORDER_STATEMENT_HOST_TYPES,
  unwrapRuntimeExpr,
} from '../helpers/ast-patterns.js';
import { scopeNode, bindingCrossesLoopBackEdge } from './straight-line-flow.js';
import { isUnionType, loopReExecRegionHasViolation, violationInCapturedFunction } from './ast-shapes.js';
import { isLoopStatement } from '../destructure-host-shape.js';

// nullish-keyword annotation shapes: any property-access guard (`x.kind === 'a'`)
// would TypeError on these at runtime, so the branch is unreachable in the guarded
// scope. TS keywords + Flow type-annotation variants. `NullLiteral` deliberately omitted
// (runtime literal, only appears wrapped inside TSLiteralType, not as a direct union
// branch in either parser). bottom types (`never` / Flow `empty`) have no inhabitants,
// so their union branches are unreachable for the same reason - guard branch cannot
// fire on a value that does not exist
const NULLISH_BRANCH_TYPES = new Set([
  'TSNullKeyword',
  'TSUndefinedKeyword',
  'TSVoidKeyword',
  'TSNeverKeyword',
  'NullLiteralTypeAnnotation',
  'VoidTypeAnnotation',
  'EmptyTypeAnnotation',
]);

export function createDiscriminantNarrow({
  t,
  peelNegation,
  pathKey,
  getMemberProperty,
  flattenCondition,
  resolveComputedKeyName,
  getStatementSiblings,
  resolveExitCondition,
  literalKeyValue,
  findPatternKeyPath,
  getKeyName,
  unwrapTypeAnnotation,
  canFallThrough,
  getTypeMembers,
  findTypeMember,
  followTypeAliasChain,
  applySubst,
  collectBindingReferences,
}) {
  // --- Guards collector ---

  // `<path>.field OP 'value'` where OP is `===` / `==` / `!==` / `!=`; returns null for
  // other shapes. `conditionTrue` flips the sign when the guard sits in an else-branch.
  // `scope` (optional) enables value-side resolution beyond bare literals: `Kind.A` /
  // `Kind['A']` enum-member access, identifier alias to a literal, single-quasi template
  // literal - all routed through `resolveComputedKeyName` which already handles them
  function parseDiscriminantCheck({ rawTest, targetKey, conditionTrue, scope }) {
    const { test, negated } = peelNegation(rawTest);
    if (negated) conditionTrue = !conditionTrue;
    if (test?.type !== 'BinaryExpression') return null;
    const isEq = test.operator === '===' || test.operator === '==';
    const isNeq = test.operator === '!==' || test.operator === '!=';
    if (!isEq && !isNeq) return null;
    // `unwrapRuntimeExpr` peels parens, `ChainExpression` (oxc optional-chain wrapper),
    // and TS expression wrappers (`as` / `satisfies` / `!`) - covers all transparent
    // adapters that may sit on either side of the equality. a peel that misses TS wrappers
    // would drop the narrow for `(box as A).kind === 'a'`
    const left = unwrapRuntimeExpr(test.left);
    const right = unwrapRuntimeExpr(test.right);
    const pair = memberLiteralPair({ memberExpr: left, literalNode: right, targetKey, scope })
      ?? memberLiteralPair({ memberExpr: right, literalNode: left, targetKey, scope });
    return pair && { ...pair, positive: isEq === conditionTrue };
  }

  // the discriminant FIELD may sit behind nested hops (`u.m.k === 'a'` discriminates `u`):
  // collect the field path from the test's member chain down to the narrowed binding.
  // every hop needs a statically-named key (literal, or alias / enum-member via the
  // scope-aware resolver - mirroring the value side); the chain below the collected
  // fields must equal `targetKey` exactly, with TS wrappers peeled (`(box as A).kind`).
  // returns the root-first field path or null when the shape diverges
  function matchTargetFieldPath(memberExpr, targetKey, scope) {
    const fields = [];
    let current = memberExpr;
    while (current?.type === 'MemberExpression' || current?.type === 'OptionalMemberExpression') {
      let field = getMemberProperty(current);
      if (field === null && current.computed && scope) field = resolveComputedKeyName(current.property, scope);
      if (field === null) return null;
      fields.unshift(field);
      current = unwrapRuntimeExpr(current.object);
      if (pathKey(current) === targetKey) return fields;
    }
    return null;
  }

  // discriminant literal VALUES span more than KEY literals: a union member can be
  // discriminated by `true` / `false` and bigint literal TYPES, which `literalKeyValue`
  // (key-domain: string / number) never extracts. bigints normalize to a `<digits>n`
  // string so the babel shape (BigIntLiteral, digits in `.value`) and the estree shape
  // (Literal with a bigint `.value` + raw digits in `.bigint`) compare equal, and never
  // collide with a same-digit number (number 1 vs string '1n'). null / undefined
  // discriminants are KEYWORD types (TSNullKeyword), not literal nodes - they keep the
  // permissive pass-through. used by BOTH comparison sides: the test expression and the
  // union member's TSLiteralType
  function discriminantLiteralValue(node) {
    if (!node) return null;
    if (typeof node.value === 'boolean' && (node.type === 'BooleanLiteral' || node.type === 'Literal')) return node.value;
    if (node.type === 'BigIntLiteral' || (node.type === 'Literal' && typeof node.value === 'bigint')) {
      return `${ node.bigint ?? node.value }n`;
    }
    return literalKeyValue(node);
  }

  // bare literal first (cheap, no scope walk), then enum-member / alias-chain /
  // template-literal via `resolveComputedKeyName`. without the second branch,
  // `box.kind === Kind.A` (and `Kind['A']` / `Kind[`A`]`) stays unmatched and the
  // discriminant narrowing falls back to the unrefined union receiver
  function resolveLiteralOrComputed(node, scope) {
    return discriminantLiteralValue(node) ?? (scope ? resolveComputedKeyName(node, scope) : null);
  }

  function memberLiteralPair({ memberExpr, literalNode, targetKey, scope }) {
    const fieldPath = matchTargetFieldPath(memberExpr, targetKey, scope);
    if (fieldPath === null) return null;
    const value = resolveLiteralOrComputed(literalNode, scope);
    return value === null ? null : { fieldPath, value };
  }

  // a member sub-path narrow (`obj.a.b`) is invalidated by a write to that exact sub-path
  // (`obj.a.b = other` / `obj.a.b++`) OR to any strict PREFIX of it (`obj.a = other`): rebinding
  // an intermediate object changes the object `obj.a.b` reads from, so the narrow no longer holds.
  // neither is a `constantViolation` of the root binding `obj`. collect such writes from the root
  // binding's references (each `obj.a... = ...` mentions `obj`) so the positional interval check
  // drops the narrow just like a whole-binding rebind would. `collectBindingReferences` is the
  // parser-agnostic enumerator (babel `referencePaths`, estree-toolkit program-index fallback) -
  // reading `binding.referencePaths` directly would miss every reference under the oxc adapter
  function memberPathWriteViolations({ objectBinding, rootName, anchorPath, targetKey }) {
    const out = [];
    for (const ref of collectBindingReferences(objectBinding, rootName, anchorPath) ?? []) {
      // climb to the top of the member-access chain rooted at this `obj` reference
      let p = ref;
      while (isMemberAccessNode(p.parentPath?.node) && p.parentPath.node.object === p.node) p = p.parentPath;
      // record only when the climbed member chain is itself the WRITE TARGET of its host -
      // assignment / update / delete, OR a destructure-pattern slot / for-x head (the canonical
      // `isMemberWriteHost` enumeration; the bare hostType check missed those, so a `[obj.a] = v`
      // or `for (obj.a of it)` write left the narrow unsoundly retained)
      if (!isMemberWriteHost(p)) continue;
      // exact narrowed path, or a strict segment-prefix of it (`obj.a` vs target `obj.a.b`); a
      // deeper write (`obj.a.b.c`) only mutates a property OF the narrowed object, so it is excluded
      const writeKey = pathKey(p.node);
      if (writeKey !== null && (writeKey === targetKey || targetKey.startsWith(`${ writeKey }.`))) out.push({ node: p.parentPath.node });
    }
    return out;
  }

  // narrowing-context: snapshot of varPath's binding-identity + reassignment history that
  // each candidate guard must clear before contributing. extracted into a single record so
  // both walk-up and preceding-exit collectors share one signature. `this` receivers are
  // not lexically bound - skip the scope lookup and seed empty violations rather than
  // re-resolving across each guard check
  function buildDiscriminantContext(varPath, targetKey) {
    const [rootName] = targetKey.split('.', 1);
    const objectBinding = rootName === 'this' ? null : varPath.scope?.getBinding(rootName);
    const violations = [...objectBinding?.constantViolations ?? []];
    if (targetKey.includes('.') && objectBinding) {
      violations.push(...memberPathWriteViolations({ objectBinding, rootName, anchorPath: varPath, targetKey }));
    }
    return { rootName, objectBinding, violations, objectStart: varPath.node?.start };
  }

  // ANY constantViolation whose `.node.start` falls inside one of `intervals`. each entry is
  // `{ from, to, inclusive }` - open `(from, to)` by default, closed `[from, to]` when
  // `inclusive`. undefined endpoints skip the entry rather than match-all. returns true
  // CONSERVATIVELY when a violation has no `.start` (synthetic AST nodes - we cannot tell
  // where they sit, so assume potentially-violating). consumers therefore drop the narrow
  // rather than retain it, matching the `hasMutationAfterGuards` polarity used elsewhere
  function violationsHitAnyInterval(violations, intervals) {
    if (!violations?.length) return false;
    for (const v of violations) {
      const start = v.node?.start;
      if (start === undefined || start === null) return true;
      for (const { from, to, inclusive } of intervals) {
        if (from === undefined || to === undefined) continue;
        if (inclusive ? (start >= from && start <= to) : (start > from && start < to)) return true;
      }
    }
    return false;
  }

  // a guard is valid for narrowing iff (a) `rootName` resolves to the same binding in the
  // guard's enclosing scope as at varPath (rejects inner-shadow leakage), and (b) no
  // reassignment of that binding sits in the open interval (testEnd, objectStart) (between
  // guard end and use site) OR in the closed interval [testStart, testEnd] (an SE inside
  // the guard expression itself, e.g. `if ((x = other, x.kind === 'a'))` invalidates narrow
  // because the binding at the use site is the post-SE value, not the pre-test one).
  // routed through `violationsHitAnyInterval` so synthetic violations conservatively drop
  // the guard - mirrors `hasMutationAfterGuards`' `isBefore` polarity
  function discriminantGuardApplies(scope, testNode, ctx) {
    const { rootName, objectBinding, violations, objectStart } = ctx;
    if (rootName !== 'this' && objectBinding && scope?.getBinding(rootName) !== objectBinding) return false;
    if (objectBinding && violationInCapturedFunction(t, violations, objectBinding.scope?.path)) return false;
    const testStart = testNode?.start;
    const testEnd = testNode?.end;
    if (testEnd === undefined || objectStart === undefined) return false;
    return !violationsHitAnyInterval(violations, [
      { from: testEnd, to: objectStart, inclusive: false },
      { from: testStart, to: testEnd, inclusive: true },
    ]);
  }

  // flatten `&&` (truthy) / `||` (falsy) chains so a discriminant clause embedded alongside
  // other tests (`if (x && f.kind === 'a')` / `if (!ready || f.kind !== 'b') return;`) still
  // contributes its narrowing. each clause goes through `parseDiscriminantCheck` (which peels
  // its own `!`/parens), survivors append to `out`. `scope` threads through to enable
  // enum-member / alias-chain resolution on the literal side of the comparison
  function pushDiscriminantClauses({ test, conditionTrue, targetKey, out, scope }) {
    const parts = flattenCondition(test, conditionTrue ? '&&' : '||');
    for (const part of parts) {
      const guard = parseDiscriminantCheck({ rawTest: part, targetKey, conditionTrue, scope });
      if (guard) out.push(guard);
    }
  }

  // scan preceding-sibling statements of `current` at its block level; for each one that
  // unconditionally exits (`if (X) return;` / `... else throw ...`), collect the narrowed
  // discriminant form into `out`. mirrors `findPrecedingExitGuards` but for discriminant kinds
  function collectPrecedingExitDiscriminants({ current, targetKey, out, ctx }) {
    const siblings = getStatementSiblings(current);
    if (!siblings) return;
    for (let i = current.key - 1; i >= 0; i--) {
      // peel LabeledStatement wrap symmetric with typeof-guards.parseSiblingGuards. without
      // the peel `outer: if (kind !== 'a') return;` would skip discriminant narrow
      // (resolveExitCondition gates on IfStatement type)
      const sibling = peelLabeledStatementPath(siblings[i]);
      const exitCond = resolveExitCondition(sibling);
      if (exitCond === null) continue;
      if (!discriminantGuardApplies(sibling.scope, sibling.node.test, ctx)) continue;
      pushDiscriminantClauses({ test: sibling.node.test, conditionTrue: exitCond, targetKey, out, scope: sibling.scope });
    }
  }

  // `switch (<target>.<field>) { case 'value': ... }` - discriminant narrow via case test
  // value. emits `{field, value, positive: true}` for the current explicit case (with no
  // fall-through predecessor; fall-through requires OR-of-values which the AND-semantics
  // guards.every filter can't express - bail conservatively). default case with no
  // preceding fall-through emits negative guards for each explicit case value
  function collectSwitchCaseDiscriminants({ current, targetKey, out, ctx }) {
    const switchCase = current.parentPath;
    if (!t.isSwitchCase(switchCase?.node)) return;
    // gate on consequent slot - mirror of the `if (current.key !== 'consequent' &&
    // current.key !== 'alternate') continue;` gate in `findDiscriminantGuards`'s
    // IfStatement / ConditionalExpression branches. a use INSIDE the case's `test`
    // expression hasn't entered the narrowed body yet; applying the case's narrow there
    // is wrong (`case w.val.at(-1):` shouldn't see `w` as already-narrowed). consequent
    // items are array entries (numeric `current.key`, `listKey === 'consequent'`)
    if (current.listKey !== 'consequent') return;
    const switchStmt = switchCase.parentPath;
    if (!t.isSwitchStatement(switchStmt?.node)) return;
    const fieldPath = matchTargetFieldPath(unwrapRuntimeExpr(switchStmt.node.discriminant), targetKey, switchStmt.scope);
    if (fieldPath === null) return;
    if (!discriminantGuardApplies(switchStmt.scope, switchStmt.node.discriminant, ctx)) return;
    const { cases } = switchStmt.node;
    const { scope } = switchCase;
    const caseIndex = cases.indexOf(switchCase.node);
    if (caseIndex > 0 && canFallThrough(cases[caseIndex - 1])) return;
    // default branch (`test === null`): narrow by excluding every explicit case value
    if (switchCase.node.test === null) {
      for (const $case of cases) {
        const value = resolveLiteralOrComputed($case.test, scope);
        if (value !== null) out.push({ fieldPath, value, positive: false });
      }
      return;
    }
    const value = resolveLiteralOrComputed(switchCase.node.test, scope);
    if (value !== null) out.push({ fieldPath, value, positive: true });
  }

  // walk up collecting `<path>.kind === 'a'` / `!==` guards from enclosing if / ternary / `&&`,
  // plus preceding early-exit siblings. `targetKey` covers arbitrary LHS shapes
  // (Identifier / `this.x` / `obj.a.b`). binding-identity + mutation checks (via `ctx`)
  // reject inner-shadow leakage and stale narrowing across reassignments
  function findDiscriminantGuards(varPath, targetKey) {
    const guards = [];
    const ctx = buildDiscriminantContext(varPath, targetKey);
    const bindingScopeNode = ctx.objectBinding ? scopeNode(ctx.objectBinding.scope) : null;
    const violationNodes = ctx.violations.map(v => v.node);
    // once we walk out past a back-edge loop whose body reassigns the binding, every guard above
    // it is outside the loop and cannot re-narrow per iteration - drop it (mirror narrow-by-guards)
    let crossedBackEdgeLoop = false;
    for (let current = varPath; current?.parentPath; current = current.parentPath) {
      const parent = current.parentPath;
      if (!crossedBackEdgeLoop && isLoopStatement(parent.node)
        && loopReExecRegionHasViolation(parent.node, violationNodes, bindingScopeNode)) {
        crossedBackEdgeLoop = true;
      }
      // function boundary: guards above this point fire at call-evaluation time, but
      // the use inside the function runs at invocation time; for rebindable bindings any
      // outer-scope reassignment between those moments invalidates narrowing. mirrors the
      // typeof-side stop in `findEnclosingTypeGuards`. const bindings stay closure-stable
      if (t.isFunction(parent.node) && ctx.violations.length) break;
      if (crossedBackEdgeLoop) continue;
      let test;
      let conditionTrue;
      if (t.isIfStatement(parent.node) || t.isConditionalExpression(parent.node)) {
        if (current.key !== 'consequent' && current.key !== 'alternate') continue;
        conditionTrue = current.key === 'consequent';
        test = parent.node.test;
      } else if (t.isLogicalExpression(parent.node) && current.key === 'right'
          && (parent.node.operator === '&&' || parent.node.operator === '||')) {
        // `&&` right side: left was truthy, condition holds positively
        // `||` right side: left was falsy, condition holds negatively
        // mirrors `findConditionalGuards`' LogicalExpression handling for typeof guards
        conditionTrue = parent.node.operator === '&&';
        test = parent.node.left;
      } else {
        collectSwitchCaseDiscriminants({ current, targetKey, out: guards, ctx });
        collectPrecedingExitDiscriminants({ current, targetKey, out: guards, ctx });
        continue;
      }
      if (!discriminantGuardApplies(parent.scope, test, ctx)) continue;
      pushDiscriminantClauses({ test, conditionTrue, targetKey, out: guards, scope: parent.scope });
    }
    return guards;
  }

  // --- Narrowing entry points ---

  // resolve the binding's identifier name across both runtime path libs (babel exposes
  // `.identifier`, estree-toolkit exposes `.name` directly). fall back to varPath's name
  // when the binding object is shaped without either - covers shorthand/destructured
  function bindingTargetName(binding, varPath) {
    return binding.identifier?.name ?? binding.name ?? varPath.node?.name ?? null;
  }

  // a parent.scope-bearing block context: BlockStatement / Program / StaticBlock children
  // are evaluated in source order, so a preceding sibling assignment is guaranteed to run
  // before the use site. all other parent shapes (IfStatement, function decl headers,
  // expression positions) skip the block-local assignment scan
  function isBlockChildPath(parent, current) {
    return SOURCE_ORDER_STATEMENT_HOST_TYPES.has(parent.node?.type)
      && current.listKey === 'body' && typeof current.key === 'number';
  }

  // assignment shape that re-binds `targetName`: simple Identifier LHS OR destructure pattern
  // (ArrayPattern / ObjectPattern) whose key-path walker turns up `targetName`. resolvePath's
  // destructure branch then extracts the matching RHS slot
  function assignmentBindsTarget(expr, targetName, scope) {
    if (expr?.type !== 'AssignmentExpression' || expr.operator !== '=') return false;
    const { left } = expr;
    if (left?.type === 'Identifier') return left.name === targetName;
    return !!findPatternKeyPath(left, targetName, scope);
  }

  // any constantViolation whose source-position falls in the open interval (lowExcl, highExcl).
  // shares `violationsHitAnyInterval`'s synthetic-violation polarity (no `.start` -> assume
  // possible -> drop narrow)
  function hasReassignmentBetween(binding, lowExcl, highExcl) {
    return violationsHitAnyInterval(binding?.constantViolations, [
      { from: lowExcl, to: highExcl, inclusive: false },
    ]);
  }

  // scan preceding ExpressionStatement siblings within a block-child parent, returning the
  // path of the first AssignmentExpression that re-binds `targetName`. ObjectPattern
  // destructure-assignment is only parseable as `({...} = R)` - the parens become an AST node
  // in oxc-parser (ESTree preserves ParenthesizedExpression), unwrap so the AssignmentExpression
  // is reachable. babel strips parens at parse, so the unwrap is a no-op there.
  // when a candidate hit is found, validate no intermediate sibling reassigns the binding
  // (`f = X; if (cond) f = Y; f.use()`): the intermediate `if-f=Y` may have rebound `f` to a
  // different shape, so the candidate's RHS no longer represents the value at the use site.
  // bail to null so the caller falls back to the declared type. without this, narrowing
  // unsoundly picks the FIRST preceding match and ignores conditional shadowing
  function findPrecedingSiblingAssignment({ parent, currentKey, targetName, binding, varPath }) {
    const siblings = parent.get('body');
    for (let i = currentKey - 1; i >= 0; i--) {
      const sib = siblings[i];
      if (sib?.node?.type !== 'ExpressionStatement') continue;
      let expr = sib.node.expression;
      let exprPath = sib.get('expression');
      while (expr?.type === 'ParenthesizedExpression') {
        expr = expr.expression;
        exprPath = exprPath.get('expression');
      }
      if (assignmentBindsTarget(expr, targetName, sib.scope)) {
        if (hasReassignmentBetween(binding, sib.node.end, varPath.node?.start)) return null;
        return exprPath;
      }
    }
    return null;
  }

  // `for (x = R; ...) { use x; }` - the init slot's AssignmentExpression runs before ANY
  // iteration body, so a use inside the body is preceded by the init assignment. sibling-scan
  // only covers block bodies; without this branch, for-init reassignments slip past and the
  // narrow-by-assignment falls back to the unrefined declared type.
  // for-UPDATE slot (`for (w = R1; cond; w = R2) { use w }`) reassigns the binding on every
  // iteration after the first - the body's narrow can no longer trust init's RHS for iter 2+.
  // `hasReassignmentBetween` over (init.end, body.start) catches both an `=` AE in `.update`
  // and any other rebind shape (`++`, `+=`, destructure-LHS)
  function findForInitAssignment(parent, currentKey, targetName, binding) {
    if (!t.isForStatement(parent.node) || currentKey !== 'body') return null;
    const { init, body } = parent.node;
    if (!init || !t.isAssignmentExpression(init)) return null;
    if (!assignmentBindsTarget(init, targetName, parent.scope)) return null;
    if (binding && hasReassignmentBetween(binding, init.end, body?.start)) return null;
    return parent.get('init');
  }

  // walk varPath's ancestors looking for an `=` assignment at a preceding-sibling statement
  // that's GUARANTEED to have run before varPath. unlike `findLastStraightLineAssignment`,
  // which insists on straight-line reachability all the way to the binding's var-scope, this
  // accepts assignments in any enclosing block of the use site - those are guaranteed because
  // the use site is in the same control-flow path. starts at the closest block-child ancestor
  // and walks outward until the binding's declaration scope
  function findPrecedingBlockAssignment(binding, varPath) {
    if (!binding.constantViolations?.length) return null;
    // a captured-function reassignment can run between the preceding assignment and the use, so the
    // assignment-literal narrow is not safe to keep - mirror discriminantGuardApplies / narrow-by-guards
    if (violationInCapturedFunction(t, binding.constantViolations, binding.scope?.path)) return null;
    const targetName = bindingTargetName(binding, varPath);
    if (!targetName) return null;
    // loop back-edge: an assignment in an enclosing block OUTSIDE the loop is stale from iteration 2
    // once the loop body reassigns the binding on the back-edge - degrade to generic
    if (bindingCrossesLoopBackEdge(t, varPath, binding)) return null;
    const limit = scopeNode(binding.scope);
    for (let current = varPath; current?.parentPath; current = current.parentPath) {
      const parent = current.parentPath;
      // function boundary: preceding sibling in an outer block is not guaranteed to
      // run before a closure-captured use - the closure may invoke after later outer
      // reassignments. binding rebindable was already gated above
      if (t.isFunction(parent.node)) return null;
      if (isBlockChildPath(parent, current)) {
        const hit = findPrecedingSiblingAssignment({ parent, currentKey: current.key, targetName, binding, varPath });
        if (hit) return hit;
      }
      const forInit = findForInitAssignment(parent, current.key, targetName, binding);
      if (forInit) return forInit;
      if (parent.node === limit) return null;
    }
    return null;
  }

  // collect own non-computed Identifier/StringLiteral-keyed properties whose value is a
  // primitive literal (string / number) - the RHS projection used to discriminate which
  // union branch the assignment shape commits to. returns null when a SpreadElement is
  // present anywhere - spread can override any literal key at runtime (`{kind:'a', ...x}`
  // where `x.kind === 'b'`), so narrowing to the literal-side branch would be unsound
  function collectObjectLiteralProps(rhs) {
    const literals = new Map();
    for (const p of rhs.properties) {
      if (!p) continue;
      if (p.type === 'SpreadElement' || p.type === 'ExperimentalSpreadProperty') return null;
      if (p.computed || (p.type !== 'ObjectProperty' && p.type !== 'Property')) continue;
      const keyName = getKeyName(p.key);
      const literalValue = discriminantLiteralValue(p.value);
      if (keyName !== null && literalValue !== null) literals.set(keyName, literalValue);
    }
    return literals;
  }

  // shared narrowing pipeline: flatten nested-union branches first so `type Outer = (X|Y)`
  // aliases surface inner branches at the top level; filter by `predicate`; assemble.
  // baseline for the all-pass check is the FLATTENED branch count - using `aliased.types.length`
  // (the pre-flatten outer-union count) would false-positive `type Outer = (X|Y) | (Z|W)`
  // (outer length 2) when 2 of 4 inner branches survive. preserves accumulated type-param
  // substitutions through the narrowed result - without applying subst, `T[]` inside a
  // surviving branch of `type Foo<T> = { kind: 'a'; val: T[] } | ...` would stay unresolved
  // and downstream dispatch would see Array(null) instead of Array<string>
  function narrowUnionWithPredicate(aliased, subst, scope, predicate) {
    const flattened = flattenUnionBranches(aliased.types, scope);
    const filtered = flattened.filter(predicate);
    if (!filtered.length || filtered.length === flattened.length) return null;
    const narrowed = filtered.length === 1
      ? unwrapTypeAnnotation(filtered[0])
      : { type: aliased.type, types: filtered };
    return applySubst(narrowed, subst);
  }

  // narrow a union annotation by inspecting the variable's last preceding `=` assignment:
  // when the RHS is an ObjectExpression whose literal-property values uniquely match one
  // branch's literal-typed members, narrow to that branch. mirrors TS's flow-sensitive
  // "narrowing by assignment" so post-mutation accesses see the new shape rather than the
  // declared union. permissive: branches with non-literal members or missing RHS keys pass
  // through, single-branch result wins
  function narrowUnionByAssignmentLiteral(varPath, annotation, scope) {
    const binding = varPath.scope?.getBinding(varPath.node?.name);
    if (!binding) return null;
    const lastAssign = findPrecedingBlockAssignment(binding, varPath);
    const rhs = lastAssign?.node?.right;
    if (rhs?.type !== 'ObjectExpression') return null;
    const { node: aliased, subst } = followTypeAliasChain(unwrapTypeAnnotation(annotation), scope);
    if (!isUnionType(aliased)) return null;
    const rhsLiterals = collectObjectLiteralProps(rhs);
    if (rhsLiterals === null || rhsLiterals.size === 0) return null;
    return narrowUnionWithPredicate(aliased, subst, scope, branch => branchMatchesLiterals(branch, rhsLiterals, scope));
  }

  // a union branch survives if every literal-typed member with a key present in `rhsLiterals`
  // matches the projected RHS value. members with non-literal types / missing RHS keys /
  // unresolvable types pass through (permissive; same convention as discriminant narrow)
  function branchMatchesLiterals(branch, rhsLiterals, scope) {
    const members = getTypeMembers({ objectType: unwrapTypeAnnotation(branch), scope });
    if (!members) return true;
    for (const m of members) {
      if (m.type !== 'TSPropertySignature' || m.computed) continue;
      const memberType = m.typeAnnotation && unwrapTypeAnnotation(m.typeAnnotation);
      if (memberType?.type !== 'TSLiteralType') continue;
      const expected = discriminantLiteralValue(memberType.literal);
      const keyName = getKeyName(m.key);
      if (expected === null || keyName === null || !rhsLiterals.has(keyName)) continue;
      if (rhsLiterals.get(keyName) !== expected) return false;
    }
    return true;
  }

  function narrowDiscriminatedUnion(objectPath, annotation, scope) {
    // cheap early exit before `followTypeAliasChain` spins up the alias walker
    const targetKey = pathKey(objectPath.node);
    if (!targetKey) return null;
    const { node: aliased, subst } = followTypeAliasChain(annotation, scope);
    if (!isUnionType(aliased)) return null;
    const guards = findDiscriminantGuards(objectPath, targetKey);
    if (!guards.length) return null;
    // permissive: branches with unresolvable discriminant members pass through
    return narrowUnionWithPredicate(aliased, subst, scope, branch => branchMatchesGuards(branch, guards, scope));
  }

  // recursively expand alias chains that resolve to unions so each inner branch appears
  // at the top-level filter list. non-union branches push the RESOLVED alias body (with
  // accumulated subst applied) rather than the raw ref - that way `type N = null; type
  // Outer = Inner | N` surfaces N as `TSNullKeyword` to the downstream `NULLISH_BRANCH_TYPES`
  // filter instead of as a `TSTypeReference` the filter doesn't recognise.
  // `applySubst` is null-safe (`type-subst.js`) so non-generic aliases pay no extra alloc.
  // cycle protection: `visited` tracks already-expanded UnionType node identities;
  // cyclic alias chains (`type A = B | C; type B = A`) resolve B and C both to the same
  // UnionType identity, and re-expanding it would recurse forever. on hit, push the raw
  // ref so the downstream filter sees an un-expanded TypeReference and bails permissively
  function flattenUnionBranches(types, scope, visited = new Set()) {
    const out = [];
    for (const branch of types) {
      const { node: resolved, subst } = followTypeAliasChain(unwrapTypeAnnotation(branch), scope);
      if (!isUnionType(resolved)) {
        out.push(applySubst(resolved, subst));
        continue;
      }
      if (visited.has(resolved)) {
        out.push(branch);
        continue;
      }
      visited.add(resolved);
      for (const inner of flattenUnionBranches(resolved.types, scope, visited)) {
        out.push(applySubst(inner, subst));
      }
    }
    return out;
  }

  // a branch survives discriminant filtering when every guard's expected value agrees with
  // the branch's literal-typed member at the same key. nullish-keyword branches (`null`,
  // `undefined`, `void`) are excluded outright -- runtime evaluation of any property-
  // access guard (`x.kind === 'a'`) would TypeError before the comparison, so the branch
  // is unreachable in the guarded scope. non-literal / unresolvable members pass through
  // permissively (matches the existing precedent for unknown member types)
  function branchMatchesGuards(branch, guards, scope) {
    const unwrapped = unwrapTypeAnnotation(branch);
    if (NULLISH_BRANCH_TYPES.has(unwrapped?.type)) return false;
    return guards.every(guard => guardMatchesBranchMember(guard, unwrapped, scope));
  }

  function guardMatchesBranchMember({ fieldPath, value, positive }, objectType, scope) {
    // walk the guard's field path hop by hop; an unresolvable hop passes permissively,
    // matching the single-hop precedent for unknown member types
    let current = objectType;
    for (const field of fieldPath) {
      const memberType = findTypeMember({ objectType: current, key: field, scope });
      if (!memberType) return true;
      current = followTypeAliasChain(unwrapTypeAnnotation(memberType), scope).node;
    }
    const literal = current?.type === 'TSLiteralType' ? discriminantLiteralValue(current.literal) : null;
    return literal === null || (literal === value) === positive;
  }

  return {
    findPrecedingBlockAssignment,
    narrowUnionByAssignmentLiteral,
    narrowDiscriminatedUnion,
  };
}
