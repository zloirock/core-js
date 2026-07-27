// pure AST/path helpers used by the polyfill emission pipeline (and the main visitor
// for outermost-optional-chain detection). no file-scope deps - callers pass node /
// path arguments directly
import { peelSkippableWrappers, TS_EXPR_WRAPPERS } from '@core-js/polyfill-provider/helpers/ast-patterns';

// peel parens, chain expressions, AND TS wrappers - for AST identity checks (e.g. matching
// `node` against `parent.callee` through `arr.includes!(1)`). delegates to shared
// `peelSkippableWrappers` (`SKIPPABLE_WRAPPER_TYPES` covers all three categories)
export const unwrapNode = peelSkippableWrappers;

// classifies `node`'s role under `parent`: 'call' / 'new' when node is the (wrapper-peeled)
// callee of that invocation, null otherwise. the single source of the invocation-kind answer -
// deriving kind from `parent.type` alone misclassifies ARGUMENT positions (`new Tag(base.name)`:
// the member's parent is the NewExpression, but its callee is `Tag`)
export function calleeKind(node, parent) {
  if (!parent || (parent.type !== 'CallExpression' && parent.type !== 'NewExpression')) return null;
  if (unwrapNode(parent.callee) !== node) return null;
  return parent.type === 'NewExpression' ? 'new' : 'call';
}

// check if parent is a call/new expression with node as callee
export function isCallee(node, parent) {
  return calleeKind(node, parent) !== null;
}

// `(arr?.includes)(1)` / `((arr?.includes) as any)(1)` - parenLookupOnly emit form gates
// on a ParenthesizedExpression somewhere between `parent.callee` and `node`. walks down
// through ChainExpression / TS wrappers (`as`/`satisfies`/`!`) so a TS cast wrapping the
// inner paren still triggers throw-on-nullish parenLookupOnly emit. mirrors babel-side
// `isWrappedInParens` parent-walk
export function isCalleeWrappedInParens(parent, node) {
  let cur = parent?.callee;
  while (cur && cur !== node) {
    if (cur.type === 'ParenthesizedExpression') return true;
    if (cur.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(cur.type)) {
      cur = cur.expression;
      continue;
    }
    return false;
  }
  return false;
}

