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

function alwaysExitsWithKind(node, depth, exitTypes) {
  if (depth > MAX_DEPTH) return false;
  if (exitTypes.has(node.type)) return true;
  if (node.type === 'BlockStatement') {
    const { body } = node;
    for (let i = 0; i < body.length; i++) if (alwaysExitsWithKind(body[i], depth + 1, exitTypes)) return true;
    return false;
  }
  if (node.type === 'IfStatement') {
    return node.alternate
      && alwaysExitsWithKind(node.consequent, depth + 1, exitTypes)
      && alwaysExitsWithKind(node.alternate, depth + 1, exitTypes);
  }
  // finally exit overrides; otherwise need both try and catch (if any) to exit
  if (node.type === 'TryStatement') {
    if (node.finalizer && alwaysExitsWithKind(node.finalizer, depth + 1, exitTypes)) return true;
    if (!alwaysExitsWithKind(node.block, depth + 1, exitTypes)) return false;
    return !node.handler || alwaysExitsWithKind(node.handler.body, depth + 1, exitTypes);
  }
  // `outer: { return; }` - the label is a no-op wrapper for break/continue targeting;
  // exit behavior follows the labeled body. without this, `if (X) outer: { return; }; ...rest...`
  // would not register the post-statement narrow because the LabeledStatement wrap masks
  // the inner exit
  if (node.type === 'LabeledStatement') return alwaysExitsWithKind(node.body, depth + 1, exitTypes);
  // `switch (X) { case 1: return; default: return; }` - every case body must end in
  // function-level exit AND there must be a default. break / continue inside a case
  // exit the switch (or loop) but control still reaches the statement after the switch -
  // those don't count for switch-as-a-whole exit. recurse with FUNCTION_EXIT_STATEMENTS
  // so the case-body analysis correctly excludes break / continue regardless of the
  // outer `exitTypes` set
  if (node.type === 'SwitchStatement') {
    let hasDefault = false;
    for (const $case of node.cases) {
      if ($case.test === null) hasDefault = true;
      if (!$case.consequent.some(stmt => alwaysExitsWithKind(stmt, depth + 1, FUNCTION_EXIT_STATEMENTS))) {
        return false;
      }
    }
    return hasDefault;
  }
  return false;
}

export function nodeAlwaysExits(node, depth = 0) {
  return alwaysExitsWithKind(node, depth, EXIT_STATEMENTS);
}

export function blockAlwaysExits(block, depth = 0) {
  return nodeAlwaysExits(block.node, depth);
}

export function canFallThrough($case) {
  const { consequent } = $case;
  for (let i = 0; i < consequent.length; i++) if (nodeAlwaysExits(consequent[i])) return false;
  return true;
}
