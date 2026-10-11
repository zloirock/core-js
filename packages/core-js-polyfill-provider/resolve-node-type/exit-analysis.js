// Pure control-flow analysis: detect whether a node / block / switch-case unconditionally
// exits (returns, throws, breaks, continues). consumed by guard-machinery to identify
// preceding-exit narrowing sites (`if (X) return;` -> the rest of the block sees the
// negated guard) and switch fall-through detection.
//
// No closure deps - pure AST walk over `node.type` strings. extracted to keep the resolver
// factory focused on the type-resolution path; `MAX_DEPTH` is the shared recursion budget
import { MAX_DEPTH } from './base.js';

export const EXIT_STATEMENTS = new Set([
  'BreakStatement',
  'ContinueStatement',
  'ReturnStatement',
  'ThrowStatement',
]);

// SwitchStatement bridges exit semantics: `break` inside a case exits the SWITCH but
// control continues to the statement after the switch. for the switch-as-a-whole to
// be an unconditional exit, every case must reach a function-level exit (return /
// throw) rather than a switch-level exit (break / continue)
const FUNCTION_EXIT_STATEMENTS = new Set([
  'ReturnStatement',
  'ThrowStatement',
]);

// iteration statements: `continue <label>` can target a label on one of these, and value flow has
// a back-edge here. `t.isLoop` is a babel-types alias the hand-written estree adapter doesn't
// expose, so this shared classifier owns the predicate - imported by the resolver's flow analysis
// (class-fields / narrow-by-guards / discriminant-narrow) and read by the exit walk below
const LOOP_STATEMENT_TYPES = new Set([
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
]);

export function isLoopStatement(node) {
  return LOOP_STATEMENT_TYPES.has(node?.type);
}

// does an exit statement end the question `exitTypes` asks? a labeled break / continue to an
// enclosing LabeledStatement the walk blocked exits only the labeled wrapper, not the surrounding
// case / function. the check matters on the full EXIT_STATEMENTS walk (`canFallThrough` via
// `nodeAlwaysExits`): without it `case A: outer: { break outer; }` would count as a case exit and
// wrongly mark the case non-falling-through. the FUNCTION_EXIT_STATEMENTS set never matches
// break / continue
function exitCounts(node, exitTypes, blockedLabels) {
  return exitTypes.has(node.type) && !(node.label && blockedLabels?.has(node.label.name));
}

// scan a statement list IN ORDER and stop at the first statement that always exits. a statement
// that MAY leave the list through an exit the question does not count ends the scan without one:
// that path never reaches a later exit. only a break / continue can be one - any of them under the
// function-level set (`{ if (c) break; return; }` is no unconditional return), one to a blocked
// label under the full set (`outer: { if (c) break outer; return; }` completes the label on one
// path). under the full set with no blocked label every exit counts, and the probe is skipped
function statementsExit(body, depth, exitTypes, blockedLabels) {
  const mayLeaveUncounted = uncountedExitProbe(exitTypes, blockedLabels);
  for (let i = 0; i < body.length; i++) {
    if (alwaysExitsWithKind(body[i], depth + 1, exitTypes, blockedLabels)) return true;
    if (mayLeaveUncounted?.(body[i])) return false;
  }
  return false;
}

// ... the probe itself, or null where every exit counts. the function-level set leaves exactly the
// jumps uncounted, whatever labels it blocks - a fact of the statement alone, asked by every scan
function uncountedExitProbe(exitTypes, blockedLabels) {
  if (exitTypes === FUNCTION_EXIT_STATEMENTS) return subtreeLeavesThroughJump;
  if (!blockedLabels?.size) return null;
  return node => subtreeContainsExit(node, exit => !exitCounts(exit, exitTypes, blockedLabels));
}

function alwaysExitsWithKind(node, depth, exitTypes, blockedLabels) {
  while (true) {
    if (depth > MAX_DEPTH) return false;
    if (EXIT_STATEMENTS.has(node.type)) return exitCounts(node, exitTypes, blockedLabels);
    if (node.type === 'BlockStatement') {
      return statementsExit(node.body, depth, exitTypes, blockedLabels);
    }
    if (node.type === 'IfStatement') {
      // both arms must exit for the `if` to always exit; a missing `else` cannot -> return a real
      // boolean, not the nullish `node.alternate` (this helper's contract is boolean)
      return Boolean(node.alternate)
        && alwaysExitsWithKind(node.consequent, depth + 1, exitTypes, blockedLabels)
        && alwaysExitsWithKind(node.alternate, depth + 1, exitTypes, blockedLabels);
    }
    // finally exit overrides; otherwise need both try and catch (if any) to exit
    if (node.type === 'TryStatement') {
      if (node.finalizer && alwaysExitsWithKind(node.finalizer, depth + 1, exitTypes, blockedLabels)) return true;
      if (!alwaysExitsWithKind(node.block, depth + 1, exitTypes, blockedLabels)) return false;
      return !node.handler || alwaysExitsWithKind(node.handler.body, depth + 1, exitTypes, blockedLabels);
    }
    // `outer: { return; }` - the label is a no-op wrapper for break/continue targeting;
    // exit behavior follows the labeled body. but `outer: { break outer; }` is NOT an exit:
    // the labeled-break only escapes the labeled scope, control resumes after the wrapper.
    // thread the label name through `blockedLabels` so the BreakStatement/ContinueStatement
    // check above can disqualify the matching label
    if (node.type === 'LabeledStatement') {
      const labelName = node.label?.name;
      const nextBlocked = labelName ? new Set(blockedLabels).add(labelName) : blockedLabels;
      node = node.body;
      depth += 1;
      blockedLabels = nextBlocked;
      continue;
    }
    // `switch (X) { case 1: return; default: return; }` - every case body must end in
    // function-level exit AND there must be a default. break / continue inside a case
    // exit the switch (or loop) but control still reaches the statement after the switch -
    // those don't count for switch-as-a-whole exit. recurse with FUNCTION_EXIT_STATEMENTS
    // so the case-body analysis correctly excludes break / continue regardless of the
    // outer `exitTypes` set
    if (node.type === 'SwitchStatement') {
      let hasDefault = false;
      const { cases } = node;
      for (let i = 0; i < cases.length; i++) {
        const $case = cases[i];
        if ($case.test === null) hasDefault = true;
        // empty consequent falls through to the next case - defer its exit status (a stacked
        // `case 1: case 2: return;` exits via case 2). only the trailing case can't fall through
        // past the switch, so an empty consequent there is a real non-exit
        if (!$case.consequent.length && i < cases.length - 1) continue;
        if (!statementsExit($case.consequent, depth, FUNCTION_EXIT_STATEMENTS, blockedLabels)) return false;
      }
      return hasDefault;
    }
    return false;
  }
}

export function nodeAlwaysExits(node, depth = 0, blockedLabels = null) {
  return alwaysExitsWithKind(node, depth, EXIT_STATEMENTS, blockedLabels);
}

export function blockAlwaysExits(block, depth = 0, blockedLabels = null) {
  return nodeAlwaysExits(block.node, depth, blockedLabels);
}

// does the node unconditionally reach a FUNCTION-level exit (return / throw)? break /
// continue - even labeled - resume somewhere in the surrounding function, so they never
// count here: consumers use this to prove statements AFTER a construct are unreachable
// through it, and a resumed break could land exactly on those statements
export function nodeAlwaysHardExits(node, depth = 0) {
  return alwaysExitsWithKind(node, depth, FUNCTION_EXIT_STATEMENTS, null);
}

// the DUAL of the exit walk: does every path THROUGH `node` satisfy `hit` - a statement-level
// predicate - before control leaves it? the completeness rules are the exit walk's own, because they
// are facts of control flow rather than of exits: an `if` needs its `alternate`, a `switch` its
// `default` (with the same empty-consequent fall-through deferral), a `try` its block and handler.
// an arm that unconditionally HARD-exits satisfies the question vacuously - control reaching the
// statement after `node` did not come through it. a loop never qualifies (zero iterations) and a
// labelled block is not summarised at all: `break label` skips the rest of its body. false for
// everything else, which is the refusing direction every caller wants
export function nodeAlwaysReaches(node, hit, depth = 0) {
  if (!node || depth > MAX_DEPTH) return false;
  if (hit(node) || nodeAlwaysHardExits(node, depth)) return true;
  if (node.type === 'BlockStatement') return statementsReach(node.body, hit, depth);
  if (node.type === 'IfStatement') {
    return Boolean(node.alternate) && nodeAlwaysReaches(node.consequent, hit, depth + 1)
      && nodeAlwaysReaches(node.alternate, hit, depth + 1);
  }
  if (node.type === 'TryStatement') {
    if (node.finalizer && nodeAlwaysReaches(node.finalizer, hit, depth + 1)) return true;
    if (!nodeAlwaysReaches(node.block, hit, depth + 1)) return false;
    return !node.handler || nodeAlwaysReaches(node.handler.body, hit, depth + 1);
  }
  if (node.type !== 'SwitchStatement') return false;
  let hasDefault = false;
  const { cases } = node;
  for (let i = 0; i < cases.length; i++) {
    const branch = cases[i];
    if (branch.test === null) hasDefault = true;
    if (!branch.consequent.length && i < cases.length - 1) continue;
    if (!statementsReach(branch.consequent, hit, depth)) return false;
  }
  return hasDefault;
}

// nodes that introduce their own scope and may shadow outer bindings - subtree walkers
// stop at these boundaries: `bodyHasParamReference` (ast-patterns) treats them as opaque (can't
// reason about inner bindings statically), `subtreeContainsExit` below as bodies an exit inside
// cannot leave
export const NESTED_BINDING_INTRODUCERS = new Set([
  'ArrowFunctionExpression',
  'FunctionExpression',
  'FunctionDeclaration',
  'ClassExpression',
  'ClassDeclaration',
  // babel-only AST node for `{ foo() {} }` shorthand methods. carries its own scope and
  // body; descent into the inline-literal must stop here so an inner `return` doesn't
  // get treated as a propagating exit. estree-toolkit normalises to Property + FnExpr,
  // which already terminate via FunctionExpression. ClassMethod / ClassPrivateMethod live
  // inside ClassExpression / ClassDeclaration which already terminate descent above
  'ObjectMethod',
]);

// the jumps resuming inside the statements a walk has descended through: a loop captures an
// unlabeled `break` and `continue`, a `switch` an unlabeled `break` alone, a label every jump naming it
const NOTHING_CAPTURED = { breaks: false, continues: false, labels: null };

function capturesBelow(node, captured) {
  if (isLoopStatement(node)) return { ...captured, breaks: true, continues: true };
  if (node.type === 'SwitchStatement') return { ...captured, breaks: true };
  if (node.type === 'LabeledStatement' && node.label) return { ...captured, labels: new Set(captured.labels).add(node.label.name) };
  return captured;
}

function everyExit() {
  return true;
}

function isJump(exit) {
  return exit.type === 'BreakStatement' || exit.type === 'ContinueStatement';
}

// the two questions the statement scans repeat across queries, memoized per node: may `node` be left
// through any exit, and through a jump. the answer depends only on the node (the captured jumps vary
// only INSIDE the walk). same per-node staleness contract as the resolver caches
const exitLeavesCache = new WeakMap();
const jumpLeavesCache = new WeakMap();

export function subtreeLeavesThroughExit(node) {
  return memoizedSubtreeExit(exitLeavesCache, node, everyExit);
}

function subtreeLeavesThroughJump(node) {
  return memoizedSubtreeExit(jumpLeavesCache, node, isJump);
}

function memoizedSubtreeExit(cache, node, counts) {
  let result = cache.get(node);
  if (result === undefined) cache.set(node, result = subtreeContainsExit(node, counts));
  return result;
}

// does `node` hold an exit statement that LEAVES it and that `counts` accepts: a return or a throw, a
// break or a continue no loop, switch or label inside `node` captures? an exit in a nested function or
// class body leaves only that body
function subtreeContainsExit(node, counts, captured = NOTHING_CAPTURED) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return false;
  if (isJump(node)) {
    const label = node.label?.name;
    if (label ? captured.labels?.has(label) : captured[node.type === 'BreakStatement' ? 'breaks' : 'continues']) return false;
    return counts(node);
  }
  if (node.type === 'ReturnStatement' || node.type === 'ThrowStatement') return counts(node);
  if (NESTED_BINDING_INTRODUCERS.has(node.type)) return false;
  const below = capturesBelow(node, captured);
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) {
    const value = node[key];
    if (Array.isArray(value)) {
      for (const item of value) if (subtreeContainsExit(item, counts, below)) return true;
    } else if (subtreeContainsExit(value, counts, below)) return true;
  }
  return false;
}

// the statement-list half: scan IN ORDER and answer at the first statement that satisfies `hit`; a
// statement a divert can leave the list through ends it without one - whatever follows is unreachable
// through that path. the question is whether a divert is POSSIBLE, never whether it is certain:
// `if (c) break;` neither satisfies `hit` nor always exits, and a scan that walks past it credits the
// write after it to a path that never runs it - which is how a receiver the source leaves `undefined`
// became a receiver-less polyfill and the native TypeError went missing
function statementsReach(body, hit, depth) {
  for (let i = 0; i < body.length; i++) {
    if (nodeAlwaysReaches(body[i], hit, depth + 1)) return true;
    if (subtreeLeavesThroughExit(body[i])) return false;
  }
  return false;
}

export function canFallThrough($case) {
  return !statementsExit($case.consequent, 0, EXIT_STATEMENTS, null);
}
