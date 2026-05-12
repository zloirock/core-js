// Straight-line predecessor-assignment finder. given a binding and a usage position,
// returns the last `<binding> = <value>` (or destructure / compound / `var` redecl) whose
// execution is GUARANTEED to have run before the usage - same var-scope (possibly nested
// through plain blocks / synchronous IIFEs), no conditional control flow between
// assignment and use. callers use the captured value to type-narrow `let`-bindings that
// are mutated in a deterministic prefix.
//
// Public surface:
//   findLastStraightLineAssignment(binding, usagePath) - the main query
//   assignLeft(node) / assignRightKey(node)            - AssignmentExpression vs
//                                                        VariableDeclarator slot adapters
//   scopeNode(s)                                       - scope-anchor AST node (babel
//                                                        `.block` vs estree-toolkit `.path.node`)
//   reset()                                            - per-file cache invalidation
//
// O(V) cache build per binding (sorted by source position), O(log V) per query.
import { ASSIGN_LEFT_TYPES, MAX_DEPTH } from './base.js';

// node-shape adapters: AssignmentExpression has left/right/operator; VariableDeclarator
// has id/init. extracted at module level so `findLastStraightLineAssignment`'s callers
// can reuse them on the returned node (avoids re-implementing the dialect switch)
export function assignLeft(n) {
  return n.type === 'VariableDeclarator' ? n.id : n.left;
}
export function assignRightKey(n) {
  return n.type === 'VariableDeclarator' ? 'init' : 'right';
}
// the AST node a scope is anchored to; Babel exposes `.block`, estree-toolkit `.path.node`
export function scopeNode(s) {
  return s.block ?? s.path?.node;
}

export function createStraightLineFlow({ t, babelNodeType }) {
  // walk a constant-violation path up to the enclosing assignment node. accepts:
  //   - `x = y` / `({x} = y)`                          -> AssignmentExpression
  //   - `var x = y` redeclaration (subsequent `var`)    -> VariableDeclarator
  // Babel: violation IS the AssignmentExpression or the redeclared VariableDeclarator.
  // estree-toolkit: violation is the LHS Identifier - walk up through Property/ObjectPattern.
  // depth scales with destructuring nesting
  function violationToAssignment(v) {
    let p = v;
    for (let i = 0; i < MAX_DEPTH && p; i++) {
      const type = babelNodeType(p.node);
      if (type === 'AssignmentExpression' || type === 'VariableDeclarator') return p;
      if (type === 'ExpressionStatement' || type === 'Program') return null;
      p = p.parentPath;
    }
    return null;
  }

  // if `path` is inside a synchronous IIFE within `targetScope`, return the CallExpression
  // path. matches `(() => { x = 1 })()` but NOT `setTimeout(() => { x = 1 })`
  function findEnclosingIIFE(path, targetScope) {
    for (let cur = path; cur; cur = cur.parentPath) {
      if (cur.scope === targetScope) return null;
      if (!t.isFunction(cur.node)) continue;
      if (cur.node.async || cur.node.generator) return null;
      // walk past parens and `(0, fn)` sequence wrappers
      let callee = cur;
      while (callee.parentPath?.node.type === 'ParenthesizedExpression'
        || (callee.parentPath?.node.type === 'SequenceExpression'
          && callee.node === callee.parentPath.node.expressions.at(-1))) {
        callee = callee.parentPath;
      }
      const call = callee.parentPath;
      if (call && (call.node.type === 'CallExpression' || call.node.type === 'OptionalCallExpression')
        && call.node.callee === callee.node) return call;
      return null;
    }
    return null;
  }

  // scope is inside bindingScope's var-scope - same object, or nested through plain blocks
  // without crossing a function/StaticBlock boundary. lets us treat `var` writes in inner
  // BlockStatements as writes to the hoisted function-scope binding
  function isInBindingVarScope(scope, bindingScope) {
    for (let s = scope; s; s = s.parent) {
      if (s === bindingScope) return true;
      const node = scopeNode(s);
      if (t.isFunction(node) || t.isStaticBlock?.(node)) return false;
    }
    return false;
  }

  // every wrapping statement up to varScopeBody is a plain BlockStatement / Program /
  // StaticBlock - reject if / switch / loop / try / etc. that make execution conditional
  function reachesVarScopeStraightLine(startPath, varScopeBody) {
    for (let p = startPath; p; p = p.parentPath) {
      if (p.node === varScopeBody) return true;
      const { type } = p.node;
      if (type !== 'BlockStatement' && type !== 'Program' && type !== 'StaticBlock') return false;
    }
    return false;
  }

  // lazy per-binding cache: valid assignments pre-filtered, sorted by pos; binary-searched per query
  let sortedAssignmentCache = new WeakMap();

  function buildSortedAssignments(binding) {
    const { scope: bindingScope, constantViolations } = binding;
    const bindingScopeNode = scopeNode(bindingScope);
    const varScopeBody = bindingScopeNode.type === 'Program' ? bindingScopeNode : bindingScopeNode.body;
    const out = [];
    for (const v of constantViolations) {
      const ap = violationToAssignment(v);
      if (!ap) continue;
      const isVarDecl = ap.node.type === 'VariableDeclarator';
      // `var x;` without init is a no-op at runtime - binding keeps its previous value
      if (isVarDecl && !ap.node.init) continue;
      if (!ASSIGN_LEFT_TYPES.has(assignLeft(ap.node)?.type)) continue;
      // lift through nested synchronous IIFE wrappers until we land in binding's var-scope
      let effectiveAp = ap;
      while (effectiveAp && !isInBindingVarScope(effectiveAp.scope, bindingScope)) {
        effectiveAp = findEnclosingIIFE(effectiveAp, bindingScope);
      }
      if (!effectiveAp) continue;
      const pos = effectiveAp.node.start;
      if (pos === undefined || pos === null) continue;
      // walk to the directly-wrapping statement:
      //   AssignmentExpression -> ExpressionStatement
      //   VariableDeclarator -> VariableDeclaration (one step up)
      const stmtType = isVarDecl ? 'VariableDeclaration' : 'ExpressionStatement';
      let stmt = effectiveAp;
      while (stmt && stmt.node.type !== stmtType) stmt = stmt.parentPath;
      if (!stmt || !reachesVarScopeStraightLine(stmt.parentPath, varScopeBody)) continue;
      out.push({ ap, pos });
    }
    out.sort((a, b) => a.pos - b.pos);
    return out;
  }

  // find the last straight-line assignment before usagePath:
  // `x = value`, `x += value`, `({ x } = value)`, or a `var x = value` redeclaration -
  // same var-scope (possibly nested through plain blocks / synchronous IIFEs).
  // O(V) build per binding (cached), O(log V) per query
  function findLastStraightLineAssignment(binding, usagePath) {
    const beforePos = usagePath.node.start;
    if (beforePos === undefined || beforePos === null) return null;
    if (!binding.constantViolations?.length) return null;
    if (!isInBindingVarScope(usagePath.scope, binding.scope)) return null;

    let sortedAssigns = sortedAssignmentCache.get(binding);
    if (!sortedAssigns) {
      sortedAssigns = buildSortedAssignments(binding);
      sortedAssignmentCache.set(binding, sortedAssigns);
    }
    if (!sortedAssigns.length) return null;

    // largest entry with pos < beforePos
    let lo = 0;
    let hi = sortedAssigns.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sortedAssigns[mid].pos < beforePos) lo = mid + 1;
      else hi = mid;
    }
    return lo > 0 ? sortedAssigns[lo - 1].ap : null;
  }

  function reset() {
    sortedAssignmentCache = new WeakMap();
  }

  return {
    findLastStraightLineAssignment,
    reset,
  };
}
