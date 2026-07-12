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
      return node.body.some(stmt => alwaysExitsWithKind(stmt, depth + 1, exitTypes, blockedLabels));
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
        if ($case.consequent.every(stmt => !alwaysExitsWithKind(stmt, depth + 1, FUNCTION_EXIT_STATEMENTS, blockedLabels))) {
          return false;
        }
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

export function canFallThrough($case) {
  const { consequent } = $case;
  for (let i = 0; i < consequent.length; i++) if (nodeAlwaysExits(consequent[i])) return false;
  return true;
}
