// nested-proxy flatten in declarator [0] runs DURING traverse (skip-marking +
// pure-import inject); sibling declarator [1] holds an instance-method polyfill on
// a SequenceExpression init (scope-tracker queues `var _ref;` inside the preserved
// declarator's range during the sibling subtree visit). flushPendingFlatten in
// applyDestructuringTransforms must consume those splices via consumeRefBindingsInRange
// before the overwrite is queued, otherwise MagicString chunk-split throws on the
// nested edit. distinct methods (Array.from / Array.of / [].at / [].findLast)
// surface per-statement dispatch
let { Array: { from } } = globalThis, x = (sideEffect(), [1, 2, 3]).at(-1);
let { Array: { of } } = globalThis, y = (sideEffect(), [4, 5, 6]).findLast(v => v > 0);
export { from, x, of, y };
