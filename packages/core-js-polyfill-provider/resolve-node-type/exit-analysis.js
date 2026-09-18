// Pure control-flow analysis: detect whether a node / block / switch-case unconditionally
// exits (returns, throws, breaks, continues). consumed by guard-machinery to identify
// preceding-exit narrowing sites (`if (X) return;` -> the rest of the block sees the
// negated guard) and switch fall-through detection.
//
// No closure deps - pure AST walk over `node.type` strings. extracted to keep the resolver
// factory focused on the type-resolution path; `MAX_DEPTH` is the shared recursion budget
import { MAX_DEPTH } from './base.js';

const EXIT_STATEMENTS = new Set([
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

// scan a statement list IN ORDER and stop at the first statement that diverts control - a
// later exit is unreachable through it. the divert probe runs on the FULL exit set and with
// no blocked labels, because any break / continue / return / throw leaves the current list no
// matter which construct it targets. it can only disagree with the exit question above when
// that question is narrower - the function-level set, where `break` diverts without matching
// (`{ break; return; }` is not an unconditional return) - or when a blocked label suppresses
// the match (`outer: { break outer; return; }` leaves the label, so the return is dead too).
// otherwise both questions read the same statement the same way and the probe is skipped
function statementsExit(body, depth, exitTypes, blockedLabels) {
  const divertMayDiffer = exitTypes !== EXIT_STATEMENTS || Boolean(blockedLabels?.size);
  for (let i = 0; i < body.length; i++) {
    if (alwaysExitsWithKind(body[i], depth + 1, exitTypes, blockedLabels)) return true;
    if (divertMayDiffer && alwaysExitsWithKind(body[i], depth + 1, EXIT_STATEMENTS, null)) return false;
  }
  return false;
}

function alwaysExitsWithKind(node, depth, exitTypes, blockedLabels) {
  while (true) {
    if (depth > MAX_DEPTH) return false;
    if (exitTypes.has(node.type)) {
      // labeled break/continue to an enclosing LabeledStatement exits only the labeled
      // wrapper, not the surrounding case/function. the check matters on the full
      // EXIT_STATEMENTS walk (`canFallThrough` via `nodeAlwaysExits`): without it
      // `case A: outer: { break outer; }` would count as a case exit and wrongly mark
      // the case non-falling-through. the switch-exit recursion is immune - its
      // FUNCTION_EXIT_STATEMENTS set never matches break/continue
      const isLabeled = (node.type === 'BreakStatement' || node.type === 'ContinueStatement')
        && node.label && blockedLabels?.has(node.label.name);
      return !isLabeled;
    }
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

// a statement a divert can leave through: the reach walk below asks whether EVERY path through a
// list satisfies `hit`, and a path that leaves early satisfies nothing - so the question there is
// whether a divert is POSSIBLE, never whether it is certain. `alwaysExits` is the wrong strength for
// it: `if (c) break;` neither satisfies `hit` nor always exits, and a scan that walks past it credits
// the write after it to a path that never runs it - which is how a receiver the source leaves
// `undefined` became a receiver-less polyfill and the native TypeError went missing.
// deliberately COARSE: any break / continue / return / throw the statement carries outside a nested
// function counts, one a loop or switch inside it would have captured included. refusing is the
// direction every caller of the reach walk wants, and a narrower answer here would have to model
// which construct each divert targets - the exit walk's own question, asked the other way round
const DIVERT_OPAQUE_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ClassDeclaration',
  'ClassExpression',
]);

function nodeMayDivert(node, depth) {
  if (!node || typeof node !== 'object' || depth > MAX_DEPTH) return true;
  if (EXIT_STATEMENTS.has(node.type)) return true;
  if (DIVERT_OPAQUE_TYPES.has(node.type)) return false;
  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc' || key === 'leadingComments' || key === 'trailingComments') continue;
    if (Array.isArray(value)) {
      if (value.some(item => item && typeof item === 'object' && nodeMayDivert(item, depth + 1))) return true;
    } else if (value && typeof value === 'object' && typeof value.type === 'string'
      && nodeMayDivert(value, depth + 1)) return true;
  }
  return false;
}

// the statement-list half: scan IN ORDER and answer at the first statement that satisfies `hit`; a
// statement a divert can leave the list through ends it without one - whatever follows is unreachable
// through that path
function statementsReach(body, hit, depth) {
  for (let i = 0; i < body.length; i++) {
    if (nodeAlwaysReaches(body[i], hit, depth + 1)) return true;
    if (nodeMayDivert(body[i], depth + 1)) return false;
  }
  return false;
}

export function canFallThrough($case) {
  return !statementsExit($case.consequent, 0, EXIT_STATEMENTS, null);
}
