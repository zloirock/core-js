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
import { IIFE_CALL_PATH_WRAPPERS, TS_EXPR_WRAPPERS } from '../helpers/ast-patterns.js';

// expression wrappers whose child position is ALWAYS evaluated. used to validate the
// chain from a candidate assignment up to its enclosing statement: any intermediate
// node not in this set (LogicalExpression / ConditionalExpression / OptionalCallExpression
// / `||=`-style AssignmentExpression) means the inner assignment is conditionally
// executed and must NOT be treated as straight-line. IIFE_CALL_PATH_WRAPPERS covers
// `!iife()`, `(0, iife())`, `(iife())`, ChainExpression-wrap; TS_EXPR_WRAPPERS covers
// `(iife() as any)` / `(iife()!)` / `(iife() satisfies T)`. `BinaryExpression` is also
// always-eval but rare in IIFE wrap patterns - omitted to keep the contract minimal
const STRAIGHT_LINE_WRAPPER_TYPES = new Set([...IIFE_CALL_PATH_WRAPPERS, ...TS_EXPR_WRAPPERS]);

// short-circuit AssignmentExpression operators: `||=` / `&&=` / `??=` conditionally
// evaluate RHS. plain `=` and arithmetic compounds (`+=`/`*=`/...) evaluate RHS
// unconditionally so they don't break straight-line. inverse-list because the safe set
// has more entries (10+ arithmetic compounds) than the unsafe set (3 logical compounds)
const SHORT_CIRCUITING_ASSIGN_OPS = new Set(['||=', '&&=', '??=']);

function isAlwaysEvaluatingWrapper(node) {
  if (STRAIGHT_LINE_WRAPPER_TYPES.has(node.type)) return true;
  if (node.type === 'AssignmentExpression') return !SHORT_CIRCUITING_ASSIGN_OPS.has(node.operator);
  return false;
}

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

// climb to the nearest ancestor (inclusive) whose AST type matches `stmtType`.
// shared by inner/outer straight-line checks - same walk-up shape with different targets
function findEnclosingStatement(path, stmtType) {
  let p = path;
  while (p && p.node.type !== stmtType) p = p.parentPath;
  return p;
}

// every wrapping statement from startPath up to endNode is a plain BlockStatement /
// Program / StaticBlock - reject if / switch / loop / try / etc. that make execution
// conditional. endNode is either the binding's var-scope body (outer check) or an
// IIFE function body (inner check during the lift loop)
function reachesStraightLine(startPath, endNode) {
  for (let p = startPath; p; p = p.parentPath) {
    if (p.node === endNode) return true;
    const { type } = p.node;
    if (type !== 'BlockStatement' && type !== 'Program' && type !== 'StaticBlock') return false;
  }
  return false;
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

  // if `path` is inside a synchronous IIFE within `targetScope`, return `{ call, fnBody }`
  // - the wrapping CallExpression path plus the IIFE's body AST node. matches
  // `(() => { x = 1 })()` but NOT `setTimeout(() => { x = 1 })`. `fnBody` is BlockStatement
  // for block-bodied functions; for arrow-with-expression-body it's the expression itself
  // (paren-wrapped expression bodies are peeled so identity comparison works with the
  // assignment node - oxc preserves `() => (expr)`'s outer ParenthesizedExpression).
  // callers need both: the call to continue the lift loop, the body to bound the inner
  // straight-line check (so inner if / switch / loop / try inside the IIFE blocks lifting).
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
      if (!call || call.node.callee !== callee.node) return null;
      if (call.node.type !== 'CallExpression' && call.node.type !== 'OptionalCallExpression') return null;
      let fnBody = cur.node.body;
      while (fnBody?.type === 'ParenthesizedExpression') fnBody = fnBody.expression;
      return { call, fnBody };
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

  // lift `ap` through nested synchronous IIFE wrappers until it lands in binding's
  // var-scope. each lift step also verifies the inner path (assignment -> IIFE function
  // body) is straight-line, so inner if / switch / loop / try inside the IIFE blocks
  // the narrow lift instead of slipping past the outer check (which would only see the
  // always-running CallExpression). returns the lifted path on success, null on bail
  function liftThroughIIFEs(ap, wrapStmtType, bindingScope) {
    let effectiveAp = ap;
    while (effectiveAp && !isInBindingVarScope(effectiveAp.scope, bindingScope)) {
      const { call, fnBody } = findEnclosingIIFE(effectiveAp, bindingScope) ?? {};
      if (!call) return null;
      // arrow-with-expression-body: assignment IS the body, trivially straight-line
      if (effectiveAp.node !== fnBody) {
        const innerStmt = findEnclosingStatement(effectiveAp, wrapStmtType);
        if (!innerStmt || !reachesStraightLine(innerStmt.parentPath, fnBody)) return null;
      }
      effectiveAp = call;
    }
    return effectiveAp;
  }

  // lazy per-binding cache: valid assignments pre-filtered, sorted by pos; binary-searched per query
  let sortedAssignmentCache = new WeakMap();

  // walk from `path` UP to `stmt` (exclusive), requiring every intermediate node to be
  // an always-evaluating wrapper. catches both IIFE-lifted shapes (`false && iife()`,
  // `cond ? iife() : 0`) and bare assignment shapes (`false && (x = 'hello')`,
  // `cond ? (x = 'hello') : 0`, `flag ||= (x = 'hello', flag)`). previous gate restricted
  // to `effectiveAp !== ap`, missing bare-conditional-assignment cases entirely
  function isStraightLineExpressionChain(path, stmt) {
    for (let cur = path.parentPath; cur && cur.node !== stmt.node; cur = cur.parentPath) {
      if (!isAlwaysEvaluatingWrapper(cur.node)) return false;
    }
    return true;
  }

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

      const wrapStmtType = isVarDecl ? 'VariableDeclaration' : 'ExpressionStatement';
      const effectiveAp = liftThroughIIFEs(ap, wrapStmtType, bindingScope);
      if (!effectiveAp) continue;
      const pos = effectiveAp.node.start;
      if (pos === undefined || pos === null) continue;

      // no IIFE lift -> ap is wrapped in its native wrapStmtType. lifted -> effectiveAp is
      // a CallExpression which always lives inside an ExpressionStatement
      const outerWrapType = effectiveAp === ap ? wrapStmtType : 'ExpressionStatement';
      const stmt = findEnclosingStatement(effectiveAp, outerWrapType);
      if (!stmt || !reachesStraightLine(stmt.parentPath, varScopeBody)) continue;
      // validate the expression chain from the assignment (or lifted-IIFE call) up to
      // its enclosing statement. statement-level `reachesStraightLine` above only checks
      // BlockStatement / Program / StaticBlock ancestors of `stmt`; the chain BELOW
      // `stmt` may pass through LogicalExpression / ConditionalExpression / `||=`-style
      // AssignmentExpression that make the inner write conditional. covers both
      // `false && (x = 'hello')` (bare) and `false && (() => { x = 'hello' })()` (IIFE)
      if (!isStraightLineExpressionChain(effectiveAp, stmt)) continue;
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
