// pure AST/path helpers used by the polyfill emission pipeline (and the main visitor
// for outermost-optional-chain detection). no file-scope deps - callers pass node /
// path arguments directly
import { TS_EXPR_WRAPPERS } from '@core-js/polyfill-provider/helpers/ast-patterns';

// peel parens, chain expressions, AND TS wrappers - for AST identity checks
// (e.g. matching `node` against `parent.callee` through `arr.includes!(1)`)
export function unwrapNode(n) {
  while (n && (n.type === 'ParenthesizedExpression' || n.type === 'ChainExpression'
      || TS_EXPR_WRAPPERS.has(n.type))) n = n.expression;
  return n;
}

// peel parens / chain expressions only - kept separate from `unwrapNode` so
// memoization decisions stay aligned with babel's `isSafeToReuse`
export function unwrapNodeForMemoize(n) {
  while (n && (n.type === 'ParenthesizedExpression' || n.type === 'ChainExpression')) n = n.expression;
  return n;
}

// check if parent is a call/new expression with node as callee
export function isCallee(node, parent) {
  if (!parent || (parent.type !== 'CallExpression' && parent.type !== 'NewExpression')) return false;
  return unwrapNode(parent.callee) === node;
}

// outermost optional-chain member: useful for the deep-chain generic-fallback heuristic.
// matching that scope keeps unplugin's output shape aligned with babel: e.g. 5-deep chain
// polyfills M5 via generic fallback, leaves M4 raw the same way babel does
export function isOutermostOptionalChainMember(path) {
  // skip past the wrapping call (for instance calls) before checking the chain boundary
  let current = path?.parentPath;
  if (current?.node?.type === 'CallExpression' && current.node.callee === path.node) {
    current = current.parentPath;
  }
  // peel wrappers (parens / TS) - they're expression-transparent
  while (current?.node && (current.node.type === 'ParenthesizedExpression'
    || TS_EXPR_WRAPPERS.has(current.node.type))) {
    current = current.parentPath;
  }
  return current?.node?.type === 'ChainExpression';
}
