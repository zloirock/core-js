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

export function nodeAlwaysExits(node, depth = 0) {
  if (depth > MAX_DEPTH) return false;
  if (EXIT_STATEMENTS.has(node.type)) return true;
  if (node.type === 'BlockStatement') {
    const { body } = node;
    for (let i = 0; i < body.length; i++) if (nodeAlwaysExits(body[i], depth + 1)) return true;
    return false;
  }
  if (node.type === 'IfStatement') {
    return node.alternate
      && nodeAlwaysExits(node.consequent, depth + 1)
      && nodeAlwaysExits(node.alternate, depth + 1);
  }
  // finally exit overrides; otherwise need both try and catch (if any) to exit
  if (node.type === 'TryStatement') {
    if (node.finalizer && nodeAlwaysExits(node.finalizer, depth + 1)) return true;
    if (!nodeAlwaysExits(node.block, depth + 1)) return false;
    return !node.handler || nodeAlwaysExits(node.handler.body, depth + 1);
  }
  return false;
}

export function blockAlwaysExits(block, depth = 0) {
  return nodeAlwaysExits(block.node, depth);
}

export function canFallThrough($case) {
  const { consequent } = $case;
  for (let i = 0; i < consequent.length; i++) if (nodeAlwaysExits(consequent[i])) return false;
  return true;
}
