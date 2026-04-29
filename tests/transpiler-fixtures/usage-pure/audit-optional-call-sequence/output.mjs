import _at from "@core-js/pure/actual/instance/at";
// optional call on a SequenceExpression callee: `(0, fn)?.(arr.at(0))`. the callee form
// must stay intact - stripping the sequence would drop the `?.` semantic guard. only the
// inner argument `arr.at(0)` gets polyfilled, the outer call shape is preserved
(0, fn)?.(_at(arr).call(arr, 0));