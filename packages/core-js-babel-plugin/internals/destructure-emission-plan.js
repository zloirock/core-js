// destructure emission planning for babel-plugin's per-prop AST-mutation pipeline.
// given a structural classification of the destructure site (parent shape / for-init /
// multi-decl / bodyless / SE / static-vs-instance polyfill / pattern-emptied-after-extraction)
// returns the named mutation strategy. the caller (`babel-compat.js`) owns AST mutation;
// this module owns the decision tree.
// strategies are babel-specific by design: each names a per-prop AST mutation primitive
// (`replaceWith`, `insertBefore`, `splice`, ...). unplugin uses a batched text-rewrite
// model (one transforms.add per declaration after accumulating every prop) and makes
// different decisions (final-text shape, not per-prop placement), so reusing this enum
// there would force-fit the wrong abstraction. the planner has no babel imports - it
// just sits in `babel-plugin/internals/` because that's the actual consumer.

// strategy enum. callers (`babel-compat.js`) reference via `STRATEGIES.WRAP_BODYLESS_SE`
// rather than the raw string so a typo trips ReferenceError at module load instead of
// silently defaulting to the dispatcher's "unhandled strategy" throw at runtime
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
  // block-level multi-decl + static value - defer SE to programExit, splice extracted in
  DEFER_SE_AND_SPLICE: 'defer-se-and-splice',
  // block-level single-decl + static value - defer SE to programExit, replace declaration
  DEFER_SE_AND_REPLACE: 'defer-se-and-replace',
  // block-level multi-decl, instance value - splice extracted + split mixed export runs
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
  // empty AssignmentExpression with static value - defer SE, replace
  DEFER_SE_AND_REPLACE_ASSIGN: 'defer-se-and-replace-assign',
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
  // AssignmentExpression branch is the only other shape callers reach here with -
  // function-param destructure / catch / nested-proxy go through other emit paths
  if (isEmpty) return isStaticValue ? STRATEGIES.DEFER_SE_AND_REPLACE_ASSIGN : STRATEGIES.REPLACE_ASSIGNMENT;
  return STRATEGIES.INSERT_BEFORE_ASSIGNMENT;
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
  // block-level empty - SE deferral applies only to static values (instance call consumes init)
  if (isStaticValue) return isMultiDecl ? STRATEGIES.DEFER_SE_AND_SPLICE : STRATEGIES.DEFER_SE_AND_REPLACE;
  return isMultiDecl ? STRATEGIES.SPLICE_AND_SPLIT : STRATEGIES.REPLACE_DECL;
}
