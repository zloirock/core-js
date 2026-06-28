import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// A computed key that folds to a polyfilled method / static name is DROPPED entirely. When a proxy-global is
// buried in a `+`-concat or template fold (not a flat `(globalThis, "x")` sequence prefix) the outer-sequence
// peel never sees it, so the whole-key descent must skip it - otherwise its `globalThis -> _globalThis` rewrite
// strands against the eliminated key (compose crash). An observable effect in the fold (`n++`) is still
// preserved. Distinct methods per line and a second proxy alias (`self`) keep the paths honest.
const arr = [[1]];
let n = 0;
const binaryFold = _flatMaybeArray(arr).call(arr);
const templateFold = _flatMapMaybeArray(arr).call(arr, x => [x]);
const staticFold = _Array$from([1, 2]);
const seFold = (n++, _includesMaybeArray(arr).call(arr, [1]));
export { binaryFold, templateFold, staticFold, seFold, n };