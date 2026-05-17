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
import { IIFE_CALL_PATH_WRAPPERS, NESTED_BINDING_INTRODUCERS, TS_EXPR_WRAPPERS } from '../helpers/ast-patterns.js';

// expression wrappers whose child position is ALWAYS evaluated. used to validate the
// chain from a candidate assignment up to its enclosing statement: any intermediate
// node not in this set (LogicalExpression / ConditionalExpression / OptionalCallExpression
// / `||=`-style AssignmentExpression) means the inner assignment is conditionally
// executed and must NOT be treated as straight-line. IIFE_CALL_PATH_WRAPPERS covers
// `!iife()`, `(0, iife())`, `(iife())`, ChainExpression-wrap; TS_EXPR_WRAPPERS covers
// `(iife() as any)` / `(iife()!)` / `(iife() satisfies T)`. `BinaryExpression` is also
// always-eval but rare in IIFE wrap patterns - omitted to keep the contract minimal
const STRAIGHT_LINE_WRAPPER_TYPES = new Set([...IIFE_CALL_PATH_WRAPPERS, ...TS_EXPR_WRAPPERS]);

// statement-level wrappers that don't introduce conditional control flow - the only
// node types `reachesStraightLine` is willing to walk through from a candidate
// assignment up to the binding's var-scope (outer check) or the IIFE body (inner check).
// LabeledStatement is forward-transparent: a labeled `break`/`continue` targeting it is
// caught by `precedingSiblingsExitFree`'s scan of the labeled body's siblings
const STRAIGHT_LINE_PASSTHROUGH_STMT_TYPES = new Set([
  'BlockStatement',
  'Program',
  'StaticBlock',
  'LabeledStatement',
]);

// control-flow exits that, when reachable in a preceding sibling of the candidate
// assignment, mean the assignment may NOT run: function-exit (`return` / `throw`),
// loop/switch-exit (`break`), iteration-skip (`continue`). nested function / class bodies
// do NOT propagate (their exits escape their OWN scope) - the `NESTED_BINDING_INTRODUCERS`
// boundary in `subtreeContainsExit` stops descent there.
//
// loop/switch shadow unlabeled `break`/`continue`: those forms target the innermost
// enclosing loop/switch, so they don't propagate past it. LabeledStatement adds its label
// to the visible scope so a labeled `break`/`continue` targeting it is also local
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

// walk from `startStmt` up to `endNode` checking that no preceding sibling at any
// statement-list level contains an exit (return / throw / break / continue) reachable
// from outside a nested function. complements `reachesStraightLine`'s ancestor-only
// check - the assignment's ancestor chain may all be straight-line BlockStatements,
// but a preceding `if (c) return;` at the same block level still makes the assignment
// conditionally unreachable
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

// every wrapping statement from startPath up to endNode is in the passthrough set -
// reject if / switch / loop / try / etc. that make execution conditional. endNode is
// either the binding's var-scope body (outer check) or an IIFE function body (inner
// check during the lift loop)
function reachesStraightLine(startPath, endNode) {
  for (let p = startPath; p; p = p.parentPath) {
    if (p.node === endNode) return true;
    if (!STRAIGHT_LINE_PASSTHROUGH_STMT_TYPES.has(p.node.type)) return false;
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
  // callee-side wrapper peel uses the shared `IIFE_CALL_PATH_WRAPPERS` + `TS_EXPR_WRAPPERS`
  // sets so TS-cast IIFEs (`((arrow) as any)()`) and ChainExpression-wrapped optional
  // call sites are recognised in lockstep with detect-usage / synth-swap / findIifeCallSite
  function findEnclosingIIFE(path, targetScope) {
    for (let cur = path; cur; cur = cur.parentPath) {
      if (cur.scope === targetScope) return null;
      if (!t.isFunction(cur.node)) continue;
      if (cur.node.async || cur.node.generator) return null;
      let callee = cur;
      while (callee.parentPath?.node
        && (IIFE_CALL_PATH_WRAPPERS.has(callee.parentPath.node.type)
          || TS_EXPR_WRAPPERS.has(callee.parentPath.node.type))) {
        // SequenceExpression only peels when our callee is the TAIL - preceding elements
        // are side-effect slots that don't carry the invoked value
        if (callee.parentPath.node.type === 'SequenceExpression'
          && callee.node !== callee.parentPath.node.expressions.at(-1)) break;
        callee = callee.parentPath;
      }
      const call = callee.parentPath;
      if (!call || call.node.callee !== callee.node) return null;
      if (call.node.type !== 'CallExpression' && call.node.type !== 'OptionalCallExpression') return null;
      // body-side peel mirrors the callee-side wrapper handling above: `() => ((x = 1) as
      // any)` parses the body as a TSAsExpression around the assignment; without peeling,
      // the assignment-is-the-body trivial case wouldn't recognise the TS-cast shape and
      // would fall through to the inner straight-line check that has no enclosing statement
      let fnBody = cur.node.body;
      while (fnBody && (fnBody.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(fnBody.type))) {
        fnBody = fnBody.expression;
      }
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

  // unified straight-line reachability check from `effectiveAp` up to `endNode`. three
  // layers must all pass:
  //   1. ancestor chain `enclosingStmt.parentPath -> endNode` is all passthrough types
  //   2. expression chain `effectiveAp -> enclosingStmt` is all always-evaluating wrappers
  //   3. no preceding sibling at any block level exits before `enclosingStmt`
  // the sibling check matters at BOTH layers but for different exits:
  //   - inner (IIFE): any preceding return/throw/break/continue inside the IIFE body
  //     skips the assignment, yet the call still returns and `effectiveAp` pretends the
  //     assignment ran at the call's position
  //   - outer (var-scope): labeled break/continue targeting a LabeledStatement that wraps
  //     the assignment but NOT the use can exit the wrapper, skipping the assignment
  //     while the use still runs (`outer: { if (c) break outer; x = "hi"; } x.at(0)`).
  //     return/throw at the outer level fire ONLY when the use also doesn't run, so the
  //     "if the use runs, the assignment ran" implication still holds for those - the
  //     check is conservative but rarely matters since outer-level early-exit patterns
  //     before a binding-mutating prefix are uncommon
  function passesStraightLineCheck(effectiveAp, endNode, wrapStmtType) {
    const stmt = findEnclosingStatement(effectiveAp, wrapStmtType);
    if (!stmt || !reachesStraightLine(stmt.parentPath, endNode)) return false;
    if (!precedingSiblingsExitFree(stmt, endNode)) return false;
    return isStraightLineExpressionChain(effectiveAp, stmt);
  }

  // lift `ap` through nested synchronous IIFE wrappers until it lands in binding's
  // var-scope. arrow-with-expression-body short-circuits since the assignment IS the body
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

      const wrapStmtType = isVarDecl ? 'VariableDeclaration' : 'ExpressionStatement';
      const effectiveAp = liftThroughIIFEs(ap, wrapStmtType, bindingScope);
      if (!effectiveAp) continue;
      const pos = effectiveAp.node.start;
      if (pos === undefined || pos === null) continue;

      // no IIFE lift -> ap is wrapped in its native wrapStmtType. lifted -> effectiveAp is
      // a CallExpression which always lives inside an ExpressionStatement
      const outerWrapType = effectiveAp === ap ? wrapStmtType : 'ExpressionStatement';
      if (!passesStraightLineCheck(effectiveAp, varScopeBody, outerWrapType)) continue;
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
