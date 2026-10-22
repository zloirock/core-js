// destructure emission planning for babel-plugin's per-prop AST-mutation pipeline.
// given a structural classification of the destructure site (parent shape / for-init /
// multi-decl / bodyless / SE / static-vs-instance polyfill / pattern-emptied-after-extraction)
// returns the named mutation strategy. the caller (`destructure-emitter.js`) owns AST mutation;
// this module owns the decision tree.
// Each strategy selects a native NodePath edit and its requeue obligations. The unplugin
// binding drains queued native AST edits after traversal; it does not use these incremental
// strategies. Source decisions and rendered values come from the shared provider.

import { patternBindingCount } from '@core-js/polyfill-provider/helpers/ast-patterns';

// strategy enum. callers (`destructure-emitter.js`) reference via `STRATEGIES.WRAP_BODYLESS_SE`
// rather than the raw string to centralize the literal in one place; a mistyped key reads
// `undefined` (frozen-object miss, no load-time throw) and surfaces as the dispatcher's runtime
// "unhandled strategy" throw
export const STRATEGIES = Object.freeze({
  // bodyless host (`if (...) { /* declaration */ }` form needed) with SE-bearing static
  // init - replace declaration with a block carrying the SE expr + extracted declaration
  WRAP_BODYLESS_SE: 'wrap-bodyless-se',
  // for-init with SE static value - keep SE inline as dummy declarator alongside extracted
  FOR_INIT_SE_STATIC: 'for-init-se-static',
  // for-init with SE instance value - mutate declarator's id/init in place
  FOR_INIT_SE_INSTANCE: 'for-init-se-instance',
  // for-init multi-decl, no SE - mutate parent declarator's id/init (extracted spliced)
  FOR_INIT_MUTATE_DECL: 'for-init-mutate-decl',
  // for-init single-decl, no SE - replace whole declaration with extracted
  FOR_INIT_REPLACE: 'for-init-replace',
  // block-level multi-decl + static value - SE lifts INLINE as a statement between the
  // split halves, splice extracted in
  LIFT_SE_AND_SPLICE: 'lift-se-and-splice',
  // block-level single-decl + static value - SE lifts ahead of the host, replace declaration
  LIFT_SE_AND_REPLACE: 'lift-se-and-replace',
  // block-level multi-decl, instance value - replace the consumed declarator in place
  // (the post-traverse drain renders the statement-per-declarator split)
  SPLICE_AND_SPLIT: 'splice-and-split',
  // block-level single-decl - replace declaration with extracted
  REPLACE_DECL: 'replace-decl',
  // non-empty multi-decl / for-init - splice extracted as a sibling declarator
  INSERT_BEFORE_DECLARATOR: 'insert-before-declarator',
  // non-empty export-wrapped declaration - insert extracted before the export wrapper
  INSERT_BEFORE_EXPORT: 'insert-before-export',
  // non-empty single-decl - insert extracted before the declaration
  INSERT_BEFORE_DECLARATION: 'insert-before-declaration',
  // empty AssignmentExpression - replace expression-statement with new assignment
  REPLACE_ASSIGNMENT: 'replace-assignment',
  // empty AssignmentExpression with static value - SE lifts ahead of the host, replace
  LIFT_SE_AND_REPLACE_ASSIGN: 'lift-se-and-replace-assign',
  // bodyless host + empty AssignmentExpression with SE-bearing static value - block-wrap
  // so the SE stays conditional on the host. AE counterpart of `WRAP_BODYLESS_SE`
  WRAP_BODYLESS_SE_ASSIGN: 'wrap-bodyless-se-assign',
  // non-empty AssignmentExpression - insert new assignment before
  INSERT_BEFORE_ASSIGNMENT: 'insert-before-assignment',
});

export function planDestructureEmission({
  parentType,
  isEmpty,
  isExport,
  isMultiDecl,
  isForInit,
  isBodyless,
  isStaticValue,
  hasSideEffects,
}) {
  if (parentType === 'VariableDeclarator') return planVariableDeclarator({
    isEmpty, isExport, isMultiDecl, isForInit, isBodyless, isStaticValue, hasSideEffects,
  });
  // AssignmentExpression is the only other shape callers reach here with -
  // function-param destructure / catch / nested-proxy go through other emit paths
  return planAssignmentExpression({ isEmpty, isBodyless, isStaticValue, hasSideEffects });
}

// VariableDeclarator branch dispatcher. extracted as a sub-function to keep the top-level
// planner under the lint statement-cap; logic and traversal order otherwise unchanged
function planVariableDeclarator({
  isEmpty, isExport, isMultiDecl, isForInit, isBodyless, isStaticValue, hasSideEffects,
}) {
  if (!isEmpty) {
    if (isMultiDecl || isForInit) return STRATEGIES.INSERT_BEFORE_DECLARATOR;
    return isExport ? STRATEGIES.INSERT_BEFORE_EXPORT : STRATEGIES.INSERT_BEFORE_DECLARATION;
  }
  // empty pattern after extraction - decide based on host shape
  if (isBodyless && isStaticValue && hasSideEffects) return STRATEGIES.WRAP_BODYLESS_SE;
  if (isForInit) {
    if (hasSideEffects) return isStaticValue ? STRATEGIES.FOR_INIT_SE_STATIC : STRATEGIES.FOR_INIT_SE_INSTANCE;
    return isMultiDecl ? STRATEGIES.FOR_INIT_MUTATE_DECL : STRATEGIES.FOR_INIT_REPLACE;
  }
  // block-level or bodyless-without-SE empty (babel auto-block-wraps the bodyless slot) -
  // the SE handling applies only to static values (instance call consumes init)
  if (isStaticValue) return isMultiDecl ? STRATEGIES.LIFT_SE_AND_SPLICE : STRATEGIES.LIFT_SE_AND_REPLACE;
  return isMultiDecl ? STRATEGIES.SPLICE_AND_SPLIT : STRATEGIES.REPLACE_DECL;
}

// AssignmentExpression branch dispatcher. mirrors `planVariableDeclarator`'s shape:
// non-empty short-circuits to insertBefore; empty falls through host-shape decisions.
// bodyless host gate sits ABOVE the SE-lift branch because `plantSideEffect` would
// hoist the SE past the unbraced slot to the enclosing array-bodied parent
function planAssignmentExpression({ isEmpty, isBodyless, isStaticValue, hasSideEffects }) {
  if (!isEmpty) return STRATEGIES.INSERT_BEFORE_ASSIGNMENT;
  if (isBodyless && isStaticValue && hasSideEffects) return STRATEGIES.WRAP_BODYLESS_SE_ASSIGN;
  return isStaticValue ? STRATEGIES.LIFT_SE_AND_REPLACE_ASSIGN : STRATEGIES.REPLACE_ASSIGNMENT;
}

// Restore declaration adjacency after Babel's per-property insertions have finished. These
// identity tables describe live paths, private declarations and insertAfter attachments;
// they do not decide receiver capture, read order or residual placement. Before that boundary,
// a surviving pattern keeps its siblings attached for queued child visits. The shared renderer
// receives the resulting groups unchanged and owns their statement/export spelling.
export function groupNativeDeclarators(
  declarations,
  { keepPatterns = false, memos = null, attached = null, wholeInit = null, slotHost = null, pruned = null } = {},
) {
  if (keepPatterns && declarations.some(item => item.id.type === 'ObjectPattern')) return [declarations];
  const memoHost = declarations.some(item => wholeInit?.has(item));
  const slotJoin = slotHost && (declarations.includes(slotHost) || slotHost === pruned) && patternBindingCount(slotHost.id) > 0;
  const groups = [];
  for (const item of declarations) {
    const previous = groups.at(-1);
    const joins = previous && (attached?.has(item) && !(pruned && memos?.has(previous[0]))
      || !memos?.has(item) && !memos?.has(previous[0]) && (slotJoin || memoHost && !wholeInit.has(item)));
    if (joins) previous.push(item);
    else groups.push([item]);
  }
  return groups;
}
