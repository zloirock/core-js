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
// internally - consolidating drops the forward-decl thunk the factory previously needed.
//
// `findPrecedingBlockAssignment` is exposed for external callers (the broader assignment
// search; weaker invariant than `findLastStraightLineAssignment` from straight-line-flow,
// because it requires only block-child preceding-sibling reachability, not var-scope-wide
// straight-line execution).
import { unwrapParens } from '../helpers/ast-patterns.js';
import { scopeNode } from './straight-line-flow.js';

// oxc wraps optional chains in ChainExpression (`s?.kind` -> `ChainExpression > Member{optional}`);
// babel uses OptionalMemberExpression directly. peel both so downstream sees the member node
function peelParensAndChain(node) {
  node = unwrapParens(node);
  if (node?.type === 'ChainExpression') node = node.expression;
  return node;
}

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
  getTypeMembers,
  findTypeMember,
  followTypeAliasChain,
  applySubst,
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
    const left = peelParensAndChain(test.left);
    const right = peelParensAndChain(test.right);
    const pair = memberLiteralPair({ memberExpr: left, literalNode: right, targetKey, scope })
      ?? memberLiteralPair({ memberExpr: right, literalNode: left, targetKey, scope });
    return pair && { ...pair, positive: isEq === conditionTrue };
  }

  function memberLiteralPair({ memberExpr, literalNode, targetKey, scope }) {
    const field = getMemberProperty(memberExpr);
    if (field === null) return null;
    if (pathKey(memberExpr.object) !== targetKey) return null;
    // value side: bare literal first (cheap, no scope walk), then enum-member / alias-chain /
    // template-literal via `resolveComputedKeyName`. without the second branch,
    // `box.kind === Kind.A` (and `Kind['A']` / `Kind[`A`]`) stays unmatched and the
    // discriminant narrowing falls back to the unrefined union receiver
    const value = literalKeyValue(literalNode)
      ?? (scope ? resolveComputedKeyName(literalNode, scope) : null);
    return value === null ? null : { field, value };
  }

  // narrowing-context: snapshot of varPath's binding-identity + reassignment history that
  // each candidate guard must clear before contributing. extracted into a single record so
  // both walk-up and preceding-exit collectors share one signature
  function buildDiscriminantContext(varPath, targetKey) {
    const [rootName] = targetKey.split('.', 1);
    return {
      rootName,
      objectBinding: rootName === 'this' ? null : varPath.scope?.getBinding(rootName),
      violations: rootName === 'this' ? [] : varPath.scope?.getBinding(rootName)?.constantViolations ?? [],
      objectStart: varPath.node?.start,
    };
  }

  // a guard is valid for narrowing iff (a) `rootName` resolves to the same binding in the
  // guard's enclosing scope as at varPath (rejects inner-shadow leakage), and (b) no
  // reassignment of that binding sits between `testEnd` and the use site (`ctx.objectStart`).
  // missing-position polarity mirrors `hasMutationAfterGuards`' `isBefore`: synthetic AST
  // nodes without source ranges are conservatively assumed to potentially violate, so the
  // guard drops rather than over-keeps. without the symmetry, discriminant narrowing would
  // SILENTLY survive synthetic violations while typeof / instanceof guards correctly drop
  function discriminantGuardApplies(scope, testEnd, ctx) {
    const { rootName, objectBinding, violations, objectStart } = ctx;
    if (rootName !== 'this' && objectBinding && scope?.getBinding(rootName) !== objectBinding) return false;
    if (testEnd === undefined || objectStart === undefined) return false;
    return !violations.some(v => {
      const start = v.node?.start;
      if (start === undefined || start === null) return true;
      return start > testEnd && start < objectStart;
    });
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
      const sibling = siblings[i];
      const exitCond = resolveExitCondition(sibling);
      if (exitCond === null) continue;
      if (!discriminantGuardApplies(sibling.scope, sibling.node.test?.end, ctx)) continue;
      pushDiscriminantClauses({ test: sibling.node.test, conditionTrue: exitCond, targetKey, out, scope: sibling.scope });
    }
  }

  // walk up collecting `<path>.kind === 'a'` / `!==` guards from enclosing if / ternary / `&&`,
  // plus preceding early-exit siblings. `targetKey` covers arbitrary LHS shapes
  // (Identifier / `this.x` / `obj.a.b`). binding-identity + mutation checks (via `ctx`)
  // reject inner-shadow leakage and stale narrowing across reassignments
  function findDiscriminantGuards(varPath, targetKey) {
    const guards = [];
    const ctx = buildDiscriminantContext(varPath, targetKey);
    for (let current = varPath; current?.parentPath; current = current.parentPath) {
      const parent = current.parentPath;
      // function boundary: guards above this point fire at call-evaluation time, but
      // the use inside the function runs at invocation time; for rebindable bindings any
      // outer-scope reassignment between those moments invalidates narrowing. mirrors the
      // typeof-side stop in `findEnclosingTypeGuards`. const bindings stay closure-stable
      if (t.isFunction(parent.node) && ctx.violations.length) break;
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
        collectPrecedingExitDiscriminants({ current, targetKey, out: guards, ctx });
        continue;
      }
      if (!discriminantGuardApplies(parent.scope, test?.end, ctx)) continue;
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
    return (t.isBlockStatement(parent.node) || t.isProgram(parent.node)
        || (t.isStaticBlock && t.isStaticBlock(parent.node)))
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

  // walk varPath's ancestors looking for an `=` assignment at a preceding-sibling statement
  // that's GUARANTEED to have run before varPath. unlike `findLastStraightLineAssignment`,
  // which insists on straight-line reachability all the way to the binding's var-scope, this
  // accepts assignments in any enclosing block of the use site - those are guaranteed because
  // the use site is in the same control-flow path. starts at the closest block-child ancestor
  // and walks outward until the binding's declaration scope
  function findPrecedingBlockAssignment(binding, varPath) {
    if (!binding.constantViolations?.length) return null;
    const targetName = bindingTargetName(binding, varPath);
    if (!targetName) return null;
    const limit = scopeNode(binding.scope);
    for (let current = varPath; current?.parentPath; current = current.parentPath) {
      const parent = current.parentPath;
      // function boundary: preceding sibling in an outer block is not guaranteed to
      // run before a closure-captured use - the closure may invoke after later outer
      // reassignments. binding rebindable was already gated above
      if (t.isFunction(parent.node)) return null;
      if (isBlockChildPath(parent, current)) {
        const siblings = parent.get('body');
        for (let i = current.key - 1; i >= 0; i--) {
          const sib = siblings[i];
          if (sib?.node?.type !== 'ExpressionStatement') continue;
          // ObjectPattern destructure-assignment is only parseable as `({...} = R)` - the
          // parens become an AST node in oxc-parser (ESTree preserves ParenthesizedExpression),
          // unwrap so the AssignmentExpression is reachable. babel strips parens at parse,
          // so the unwrap is a no-op there
          let expr = sib.node.expression;
          let exprPath = sib.get('expression');
          while (expr?.type === 'ParenthesizedExpression') {
            expr = expr.expression;
            exprPath = exprPath.get('expression');
          }
          if (assignmentBindsTarget(expr, targetName, sib.scope)) return exprPath;
        }
      }
      if (parent.node === limit) return null;
    }
    return null;
  }

  // collect own non-computed Identifier/StringLiteral-keyed properties whose value is a
  // primitive literal (string / number) - the RHS projection used to discriminate which
  // union branch the assignment shape commits to
  function collectObjectLiteralProps(rhs) {
    const literals = new Map();
    for (const p of rhs.properties) {
      if (!p || p.computed || (p.type !== 'ObjectProperty' && p.type !== 'Property')) continue;
      const keyName = getKeyName(p.key);
      const literalValue = literalKeyValue(p.value);
      if (keyName !== null && literalValue !== null) literals.set(keyName, literalValue);
    }
    return literals;
  }

  // post-filter union assembly: drop on no-narrow / all-pass, unwrap when single branch,
  // otherwise rebuild the union. shared by both narrowing paths (discriminant-guard +
  // assignment-literal) so they emit identical-shape annotations
  function buildNarrowedUnion(filtered, aliased) {
    if (!filtered.length || filtered.length === aliased.types.length) return null;
    return filtered.length === 1 ? unwrapTypeAnnotation(filtered[0]) : { type: aliased.type, types: filtered };
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
    const { node: aliased } = followTypeAliasChain(unwrapTypeAnnotation(annotation), scope);
    if (aliased?.type !== 'TSUnionType' && aliased?.type !== 'UnionTypeAnnotation') return null;
    const rhsLiterals = collectObjectLiteralProps(rhs);
    if (rhsLiterals.size === 0) return null;
    const filtered = aliased.types.filter(branch => branchMatchesLiterals(branch, rhsLiterals, scope));
    return buildNarrowedUnion(filtered, aliased);
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
      const expected = literalKeyValue(memberType.literal);
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
    if (aliased?.type !== 'TSUnionType' && aliased?.type !== 'UnionTypeAnnotation') return null;
    const guards = findDiscriminantGuards(objectPath, targetKey);
    if (!guards.length) return null;
    // permissive: branches with unresolvable discriminant members pass through
    const filtered = aliased.types.filter(branch => branchMatchesGuards(branch, guards, scope));
    const narrowed = buildNarrowedUnion(filtered, aliased);
    if (!narrowed) return null;
    // preserve accumulated type-param substitutions through the narrowed result - without
    // applying subst, `T[]` inside a surviving branch of `type Foo<T> = { kind: 'a'; val: T[] } | ...`
    // would stay unresolved and downstream dispatch would see Array(null) instead of Array<string>
    return applySubst(narrowed, subst);
  }

  // a branch survives discriminant filtering when every guard's expected value agrees with
  // the branch's literal-typed member at the same key - non-literal members pass through
  // (permissive; matches the existing precedent for unresolvable members)
  function branchMatchesGuards(branch, guards, scope) {
    for (const { field, value, positive } of guards) {
      const memberType = findTypeMember({ objectType: unwrapTypeAnnotation(branch), key: field, scope });
      if (!memberType) continue;
      const { node: resolvedNode } = followTypeAliasChain(unwrapTypeAnnotation(memberType), scope);
      const literal = resolvedNode?.type === 'TSLiteralType' ? literalKeyValue(resolvedNode.literal) : null;
      if (literal !== null && (literal === value) !== positive) return false;
    }
    return true;
  }

  return {
    findPrecedingBlockAssignment,
    narrowUnionByAssignmentLiteral,
    narrowDiscriminatedUnion,
  };
}
