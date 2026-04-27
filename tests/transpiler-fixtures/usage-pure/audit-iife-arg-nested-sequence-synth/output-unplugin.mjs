import _Array$from from "@core-js/pure/actual/array/from";
// nested SequenceExpression in IIFE arg `(a, (b, R))` evaluates to R, same as flat
// `(a, b, R)`. unwrapSequenceTail used to peel only the outer sequence, leaving inner
// SE wrapped - findTargetPath bailed -> inline-default fallback. flat form synth-swapped
// (`{from: _Array$from}`); recursive peel makes nested form classify identically
const r = (({ from }) => from([1, 2, 3]))((0, (1, { from: _Array$from })));
export { r };