// Straight-line predecessor-assignment finder. given a binding + usage position, returns
// the last `<binding> = <value>` / destructure / compound / `var` redecl whose execution
// is GUARANTEED to precede the usage in the same var-scope (possibly nested through plain
// blocks / synchronous IIFEs). consumers use the captured value to type-narrow `let`
// mutated in a deterministic prefix.
//
// O(V) cache build per binding (sorted by source position), O(log V) per query.
import { ASSIGN_LEFT_TYPES, MAX_DEPTH } from './base.js';
import { IIFE_CALL_PATH_WRAPPERS, NESTED_BINDING_INTRODUCERS, TS_EXPR_WRAPPERS } from '../helpers/ast-patterns.js';

// expression wrappers whose child position is ALWAYS evaluated. used to validate the
// chain from a candidate assignment up to its enclosing statement; anything outside this
// set (LogicalExpression / ConditionalExpression / OptionalCallExpression / `||=`-style
// AssignmentExpression) is conditional and disqualifies the assignment
const STRAIGHT_LINE_WRAPPER_TYPES = new Set([...IIFE_CALL_PATH_WRAPPERS, ...TS_EXPR_WRAPPERS]);

// statement wrappers `reachesStraightLine` walks from a candidate assignment up to the
// binding's var-scope (outer check) or IIFE body (inner check). LabeledStatement is
// forward-transparent - labeled `break`/`continue` targeting it caught by sibling scan
const STRAIGHT_LINE_PASSTHROUGH_STMT_TYPES = new Set([
  'BlockStatement',
  'Program',
  'StaticBlock',
  'LabeledStatement',
]);

// control-flow exits in a preceding sibling of the candidate that mean the assignment may
// NOT run: function-exit (`return` / `throw`), loop/switch-exit (`break`), iteration-skip
// (`continue`). nested function / class bodies don't propagate - their exits stay in their
// own scope (gated by `NESTED_BINDING_INTRODUCERS` in `subtreeContainsExit`). loop/switch
// shadow unlabeled `break`/`continue`; LabeledStatement scopes its label locally
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

// walk from `startStmt` up to `endNode` checking no preceding sibling at any statement-
// list level contains an exit reachable from outside a nested function. complements
// `reachesStraightLine`'s ancestor-only check - the chain may be all-straight-line yet
// a preceding `if (c) return;` at the same block level still disqualifies the assignment
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
  // walk a constant-violation up to the enclosing assignment node:
  //   `x = y` / `({x} = y)`                  -> AssignmentExpression
  //   `var x = y` redeclaration (subsequent) -> VariableDeclarator
  // babel: violation IS the AE / VariableDeclarator. estree-toolkit: violation is the LHS
  // Identifier; walk up through Property / ObjectPattern. depth scales with destructure nesting
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

  // if `path` is inside a synchronous IIFE within `targetScope`, return `{ call, fnBody }` -
  // the wrapping CallExpression path + the IIFE body AST node. matches `(() => { x = 1 })()`
  // not `setTimeout(() => { x = 1 })`. body is BlockStatement for block-bodied functions; for
  // arrow-with-expression-body it's the expression (paren-wrapped bodies peeled so identity
  // comparison vs the assignment node works under oxc which preserves `() => (expr)`'s outer
  // ParenthesizedExpression). callers need both: call continues lift, body bounds the inner
  // straight-line check. wrapper-peel sets match findIifeCallSite for parser symmetry
  function findEnclosingIIFE(path, targetScope) {
    for (let cur = path; cur; cur = cur.parentPath) {
      if (cur.scope === targetScope) return null;
      if (!t.isFunction(cur.node)) continue;
      if (cur.node.async || cur.node.generator) return null;
      let callee = cur;
      while (callee.parentPath?.node
        && (IIFE_CALL_PATH_WRAPPERS.has(callee.parentPath.node.type)
          || TS_EXPR_WRAPPERS.has(callee.parentPath.node.type))) {
        // SequenceExpression peels only when callee is the TAIL - preceding elements are
        // side-effect slots that don't carry the invoked value
        if (callee.parentPath.node.type === 'SequenceExpression'
          && callee.node !== callee.parentPath.node.expressions.at(-1)) break;
        callee = callee.parentPath;
      }
      const call = callee.parentPath;
      if (!call || call.node.callee !== callee.node) return null;
      if (call.node.type !== 'CallExpression' && call.node.type !== 'OptionalCallExpression') return null;
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

  // walk from `path` UP to `stmt` (exclusive); every intermediate node must be an always-
  // evaluating wrapper. catches IIFE-lifted (`false && iife()`, `cond ? iife() : 0`) and
  // bare-assignment shapes (`false && (x = 'hello')`, `cond ? (x = 'hello') : 0`, `flag
  // ||= (x = 'hello', flag)`)
  function isStraightLineExpressionChain(path, stmt) {
    for (let cur = path.parentPath; cur && cur.node !== stmt.node; cur = cur.parentPath) {
      if (!isAlwaysEvaluatingWrapper(cur.node)) return false;
    }
    return true;
  }

  // unified reachability check from `effectiveAp` up to `endNode`. three layers, all must pass:
  //   1. ancestor chain enclosingStmt.parentPath -> endNode is all passthrough types
  //   2. expression chain effectiveAp -> enclosingStmt is all always-evaluating wrappers
  //   3. no preceding sibling at any block level exits before enclosingStmt
  // sibling check matters at BOTH layers for different exit kinds:
  //   - inner (IIFE body): preceding return / throw / break / continue inside the IIFE
  //     skips the assignment while the call still returns
  //   - outer (var-scope): labeled break / continue targeting a LabeledStatement wrapping
  //     the assignment-but-not-the-use can skip the assignment while the use runs (e.g.
  //     `outer: { if (c) break outer; x = "hi"; } x.at(0)`). return / throw at the outer
  //     level fire only when the use also doesn't run, so the implication still holds for
  //     those - conservative but rare in practice
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
    // Program / BlockStatement / StaticBlock host statements directly at `.body`; only
    // function-like scopes wrap statements in a BlockStatement node. since the ancestor
    // walk compares `p.node === endNode`, array-bodied scopes must compare against the
    // scope node itself, not its `.body` array
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

      // no lift -> ap wrapped in its native wrapStmtType. lifted -> effectiveAp is a
      // CallExpression which always sits inside an ExpressionStatement
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
