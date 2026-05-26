// Straight-line predecessor-assignment finder. given a binding + usage position, returns
// the last `<binding> = <value>` / destructure / compound / `var` redecl whose execution
// is GUARANTEED to precede the usage in the same var-scope (possibly nested through plain
// blocks / synchronous IIFEs). consumers use the captured value to type-narrow `let`
// mutated in a deterministic prefix.
//
// O(V) cache build per binding (sorted by source position), O(log V) per query.
import { ASSIGN_LEFT_TYPES, MAX_DEPTH } from './base.js';
import {
  IIFE_CALL_PATH_WRAPPERS,
  IIFE_CALL_CALLEE_WRAPPERS,
  NESTED_BINDING_INTRODUCERS,
  TS_EXPR_WRAPPERS,
  isIifeCallNode,
} from '../helpers/ast-patterns.js';

// always-evaluated wrappers between assignment and its enclosing statement.
// conditional-evaluation forms (Logical / Conditional / OptionalCall / short-circuit
// AssignmentExpression) excluded by omission - their non-default branches do not
// unconditionally run the inner assignment
const STRAIGHT_LINE_WRAPPER_TYPES = new Set([...IIFE_CALL_PATH_WRAPPERS, ...TS_EXPR_WRAPPERS]);

// statement wrappers `reachesStraightLine` treats as forward-transparent.
// LabeledStatement included - targeted break / continue caught by sibling scan
const STRAIGHT_LINE_PASSTHROUGH_STMT_TYPES = new Set([
  'BlockStatement',
  'Program',
  'StaticBlock',
  'LabeledStatement',
]);

// shadow unlabeled `break` / `continue` - subtree walker tracks whether we're inside one
const LOOP_LIKE_TYPES = new Set([
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'SwitchStatement',
]);

function subtreeContainsExit(node, inLoopOrSwitch = false, labels = null) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return false;
  if (node.type === 'BreakStatement' || node.type === 'ContinueStatement') {
    // unlabeled inside loop/switch is local; labeled targets a scope above - local
    // when the label is in our descent path (LabeledStatement we walked through)
    if (!node.label) return !inLoopOrSwitch;
    return !labels?.has(node.label.name);
  }
  if (node.type === 'ReturnStatement' || node.type === 'ThrowStatement') return true;
  if (NESTED_BINDING_INTRODUCERS.has(node.type)) return false;
  const nextInLoop = inLoopOrSwitch || LOOP_LIKE_TYPES.has(node.type);
  let nextLabels = labels;
  if (node.type === 'LabeledStatement' && node.label) {
    nextLabels = new Set(labels);
    nextLabels.add(node.label.name);
  }
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (Array.isArray(value)) {
      if (value.some(v => subtreeContainsExit(v, nextInLoop, nextLabels))) return true;
    } else if (subtreeContainsExit(value, nextInLoop, nextLabels)) return true;
  }
  return false;
}

// no preceding sibling at any statement-list level exits before reaching `endNode`.
// catches `if (c) return; x = 1` shapes that an ancestor-only check would miss
function precedingSiblingsExitFree(startStmt, endNode) {
  for (let cur = startStmt; cur && cur.node !== endNode; cur = cur.parentPath) {
    const parentNode = cur.parentPath?.node;
    if (!parentNode || !Array.isArray(parentNode.body)) continue;
    const idx = parentNode.body.indexOf(cur.node);
    for (let i = 0; i < idx; i++) {
      if (subtreeContainsExit(parentNode.body[i])) return false;
    }
  }
  return true;
}

// `||=` / `&&=` / `??=` conditionally evaluate RHS. `=` + arithmetic compounds are
// unconditional. inverse-list since the safe set has 10+ entries, the unsafe set 3
const SHORT_CIRCUITING_ASSIGN_OPS = new Set(['||=', '&&=', '??=']);

function isAlwaysEvaluatingWrapper(node) {
  if (STRAIGHT_LINE_WRAPPER_TYPES.has(node.type)) return true;
  if (node.type === 'AssignmentExpression') return !SHORT_CIRCUITING_ASSIGN_OPS.has(node.operator);
  return false;
}

// AssignmentExpression vs VariableDeclarator slot adapters; reused on the returned node
// by `findLastStraightLineAssignment` callers to read LHS / RHS without re-switching
export function assignLeft(n) {
  return n.type === 'VariableDeclarator' ? n.id : n.left;
}
export function assignRightKey(n) {
  return n.type === 'VariableDeclarator' ? 'init' : 'right';
}
// scope-anchor AST node: babel exposes `.block`, estree-toolkit `.path.node`
export function scopeNode(s) {
  return s.block ?? s.path?.node;
}

// nearest ancestor (inclusive) of `stmtType`; shared by inner/outer checks
function findEnclosingStatement(path, stmtType) {
  let p = path;
  while (p && p.node.type !== stmtType) p = p.parentPath;
  return p;
}

// every wrapping statement from startPath up to endNode is in the passthrough set -
// rejects if / switch / loop / try / etc. endNode is the binding's var-scope body (outer)
// or an IIFE function body (inner during lift)
function reachesStraightLine(startPath, endNode) {
  for (let p = startPath; p; p = p.parentPath) {
    if (p.node === endNode) return true;
    if (!STRAIGHT_LINE_PASSTHROUGH_STMT_TYPES.has(p.node.type)) return false;
  }
  return false;
}

export function createStraightLineFlow({ t, babelNodeType }) {
  // walk constant-violation up to AssignmentExpression / VariableDeclarator.
  // babel: violation IS the AE / VD. estree-toolkit: violation is LHS Identifier,
  // walk up through Property / ObjectPattern - depth scales with destructure nesting
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

  // synchronous IIFE wrapping `path` within `targetScope` -> { call, fnBody }.
  // matches `(() => {x=1})()`, `(() => {x=1})?.()`, `new function () { x = 1 }()`.
  // body peeled through ParenthesizedExpression / TS wrappers so the identity check
  // `effectiveAp.node === fnBody` works under oxc which keeps `() => (expr)` parens
  function findEnclosingIIFE(path, targetScope) {
    for (let cur = path; cur; cur = cur.parentPath) {
      if (cur.scope === targetScope) return null;
      if (!t.isFunction(cur.node)) continue;
      if (cur.node.async || cur.node.generator) return null;
      let callee = cur;
      // walk only through wrappers that don't change the invoked value. UnaryExpression on
      // the callee path (`(!fn)(...)`) invokes the BOOLEAN, not fn - body writes never run,
      // narrowing against them is unsound. IIFE_CALL_CALLEE_WRAPPERS excludes UnaryExpression;
      // the broader IIFE_CALL_PATH_WRAPPERS still applies to wrappers ABOVE the call
      while (callee.parentPath?.node
        && (IIFE_CALL_CALLEE_WRAPPERS.has(callee.parentPath.node.type)
          || TS_EXPR_WRAPPERS.has(callee.parentPath.node.type))) {
        // SequenceExpression peels only when callee is the TAIL - preceding elements are
        // side-effect slots that don't carry the invoked value
        if (callee.parentPath.node.type === 'SequenceExpression'
          && callee.node !== callee.parentPath.node.expressions.at(-1)) break;
        callee = callee.parentPath;
      }
      const call = callee.parentPath;
      if (!call || call.node.callee !== callee.node) return null;
      if (!isIifeCallNode(call.node)) return null;
      // `new (() => {})()` throws TypeError at runtime - arrow body never runs,
      // writes aren't reachable from post-call usage. require constructible callee
      if (call.node.type === 'NewExpression' && cur.node.type !== 'FunctionExpression') return null;
      // body-side peel mirrors callee-side: `() => ((x = 1) as any)` parses as TSAsExpression
      // wrapping the assignment; without peel, the assignment-is-body trivial case misses
      let fnBody = cur.node.body;
      while (fnBody && (fnBody.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(fnBody.type))) {
        fnBody = fnBody.expression;
      }
      return { call, fnBody };
    }
    return null;
  }

  // scope is inside bindingScope's var-scope - same object, or nested through plain blocks
  // without crossing a function / StaticBlock boundary. so `var` writes in inner blocks
  // count as writes to the hoisted function-scope binding
  function isInBindingVarScope(scope, bindingScope) {
    for (let s = scope; s; s = s.parent) {
      if (s === bindingScope) return true;
      const node = scopeNode(s);
      if (t.isFunction(node) || t.isStaticBlock?.(node)) return false;
    }
    return false;
  }

  // every wrapper from `path` up to `stmt` (exclusive) is always-evaluating.
  // catches `false && (x = 'hi')`, `cond ? (x = 'hi') : 0`, `flag ||= (x = 'hi', flag)`
  function isStraightLineExpressionChain(path, stmt) {
    for (let cur = path.parentPath; cur && cur.node !== stmt.node; cur = cur.parentPath) {
      if (!isAlwaysEvaluatingWrapper(cur.node)) return false;
    }
    return true;
  }

  // reachability from `effectiveAp` to `endNode`: ancestor chain passthrough, expression
  // chain always-evaluating, and no preceding sibling at any block level exits before
  // the enclosing statement. sibling layer catches labeled break / continue at outer
  // var-scope and return / throw / break / continue inside IIFE body
  function passesStraightLineCheck(effectiveAp, endNode, wrapStmtType) {
    const stmt = findEnclosingStatement(effectiveAp, wrapStmtType);
    if (!stmt || !reachesStraightLine(stmt.parentPath, endNode)) return false;
    if (!precedingSiblingsExitFree(stmt, endNode)) return false;
    return isStraightLineExpressionChain(effectiveAp, stmt);
  }

  // lift `ap` through nested synchronous IIFE wrappers until it lands in binding's
  // var-scope. arrow-with-expression-body short-circuits when the assignment IS the body
  function liftThroughIIFEs(ap, wrapStmtType, bindingScope) {
    let effectiveAp = ap;
    while (effectiveAp && !isInBindingVarScope(effectiveAp.scope, bindingScope)) {
      const { call, fnBody } = findEnclosingIIFE(effectiveAp, bindingScope) ?? {};
      if (!call) return null;
      if (effectiveAp.node !== fnBody
        && !passesStraightLineCheck(effectiveAp, fnBody, wrapStmtType)) return null;
      effectiveAp = call;
    }
    return effectiveAp;
  }

  // lazy per-binding cache: valid assignments pre-filtered, sorted by pos; binary-searched
  let sortedAssignmentCache = new WeakMap();

  function buildSortedAssignments(binding) {
    const { scope: bindingScope, constantViolations } = binding;
    const bindingScopeNode = scopeNode(bindingScope);
    // Program / Block / StaticBlock host statements at `.body` directly; functions wrap in
    // BlockStatement. ancestor walk compares `p.node === endNode` - array-bodied scopes
    // must compare against the scope node itself, not its `.body` array
    const varScopeBody = Array.isArray(bindingScopeNode.body) ? bindingScopeNode : bindingScopeNode.body;
    const out = [];
    for (const v of constantViolations) {
      const ap = violationToAssignment(v);
      if (!ap) continue;
      const isVarDecl = ap.node.type === 'VariableDeclarator';
      // `var x;` without init is a runtime no-op - binding keeps its previous value
      if (isVarDecl && !ap.node.init) continue;
      if (!ASSIGN_LEFT_TYPES.has(assignLeft(ap.node)?.type)) continue;

      const wrapStmtType = isVarDecl ? 'VariableDeclaration' : 'ExpressionStatement';
      const effectiveAp = liftThroughIIFEs(ap, wrapStmtType, bindingScope);
      if (!effectiveAp) continue;
      const pos = effectiveAp.node.start;
      if (pos === undefined || pos === null) continue;

      // lifted effectiveAp is the IIFE call - sits inside an ExpressionStatement
      const outerWrapType = effectiveAp === ap ? wrapStmtType : 'ExpressionStatement';
      if (!passesStraightLineCheck(effectiveAp, varScopeBody, outerWrapType)) continue;
      out.push({ ap, pos });
    }
    out.sort((a, b) => a.pos - b.pos);
    return out;
  }

  // last straight-line assignment before usagePath: `x = v`, `x += v`, `({x} = v)`, or a
  // `var x = v` redecl in the same var-scope (possibly through plain blocks / sync IIFEs).
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
