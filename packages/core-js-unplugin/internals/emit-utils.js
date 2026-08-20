// helpers shared by the polyfill emission pipeline (and the main visitor, for outermost-
// optional-chain detection): the pure AST/path questions, plus the emit-string idioms both
// emitters spell the same way. no file-scope deps - callers pass their nodes, paths or
// rendered fragments directly
import { unwrapRuntimeExpr, TS_EXPR_WRAPPERS } from '@core-js/polyfill-provider/helpers/ast-patterns';
import { isOptionalChainAt, skipGap } from './text-scan.js';

// peel parens, chain expressions, AND TS wrappers - for AST identity checks (e.g. matching
// `node` against `parent.callee` through `arr.includes!(1)`). delegates to shared
// `unwrapRuntimeExpr` (`SKIPPABLE_WRAPPER_TYPES` covers all three categories)
export const unwrapNode = unwrapRuntimeExpr;

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

// `((X)<T>)?.(a)` hides the callee from any later optional-chaining lowering: babel's
// `isTransparentExprWrapper` does not list `TSInstantiationExpression` the way our own
// `TS_EXPR_WRAPPERS` does, so it memoizes no receiver and emits a bare `_ref(a)` - the call loses
// its `this`. `(X)?.<T>(a)` is the same TS spelling with no instantiation node left between the
// call and its callee. returns the two POINT edits that spell it, or null: never a rebuilt span,
// so the author's parens and any trivia between the operand and the type arguments survive
export function optionalCallTypeArgumentEdits(node, code) {
  if (node?.type !== 'CallExpression' || !node.optional) return null;
  let { callee } = node;
  while (callee?.type === 'ParenthesizedExpression') callee = callee.expression;
  if (callee?.type !== 'TSInstantiationExpression') return null;
  const typeArgs = callee.typeArguments ?? callee.typeParameters;
  if (!typeArgs) return null;
  // the `?.` token is the first thing PAST the gap after the callee, and the gap can hold comments
  // - a comment carrying `?.` of its own would swallow a scan that just searched for the characters
  const optionalAt = skipGap(code, node.callee.end);
  if (!isOptionalChainAt(code, optionalAt)) return null;
  return {
    remove: { start: typeArgs.start, end: typeArgs.end },
    insert: { pos: optionalAt + 2, content: code.slice(typeArgs.start, typeArgs.end) },
    // the recognized instantiation node itself - the AST engine applies the same decision
    // as node surgery instead of the two point edits
    instantiation: callee,
  };
}

// the chain root whose nullability a queued OUTER guard (a trailing instance dispatch that memoized
// it) already owns, or null. descends the member receiver toward the root, probing the transform
// queue at EVERY hop - the guard may memoize a MID-chain hop (a collapsed proxy-hop prefix, `call()
// ?.hop`), not the chain root itself. one descent for both consumers: the static emit needs the
// owned ROOT to split effects on, the standalone guard-bail only needs to know one exists
export function outerGuardOwnedRoot(node, transforms) {
  let root = node.object;
  while (root && (root.type === 'MemberExpression' || root.type === 'OptionalMemberExpression')) {
    if (transforms.findOuterGuardRef(root)) return root;
    root = root.object;
  }
  return transforms.findOuterGuardRef(root) ? root : null;
}

// prefix an emitted leaf with source-text side effects as a sequence (`(se1, se2, leaf)`), and with
// nothing at all when there are none. every render that replays effects ahead of its binding spells
// this the same way, so the paren-and-comma form lives here rather than once per render
export function withSeSrcs(seSrcs, leaf) {
  return seSrcs.length ? `(${ [...seSrcs, leaf].join(', ') })` : leaf;
}
