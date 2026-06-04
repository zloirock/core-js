// known divergence: computed-key SequenceExpression on an optional inner produces
// double-evaluation of the SE in unplugin's chain emit. babel's AST mutation folds the
// SE into ONE prepend slot (`_ref = (eff(), _flatMaybeArray(arr))`) - the inner call
// reuses _ref via `_ref.call(arr)`, binding `this`. unplugin's text-rewrite emits two transforms (outer
// optional-root memo + inner addInstanceTransform with SE-prepend) that compose with the
// SE inserted in both slots. output-unplugin.mjs documents the current divergent shape;
// a faithful fix needs recursive chain-emit composition for SE-bearing computed keys
declare const arr: { flat?: () => number[] };
declare const eff: () => 'flat';
arr[(eff(), 'flat')]?.().map((x: number) => x);
