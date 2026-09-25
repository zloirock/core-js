import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
// A zero-arg IIFE computed method key folds to its returned name. usage-pure drops an observably-pure
// IIFE (first line); one whose key runs an effect - a sequence in the body (second line) or the IIFE's
// own argument (third line) - is replayed ahead of the polyfilled dispatch, so the effect still runs
// once, before the call. distinct method per line.
const arr = [1, 2, 3];
let log = 0;
export const pure = _flatMaybeArray(arr).call(arr);
export const bail = ((() => (log++, 'flatMap'))(), _flatMapMaybeArray(arr).call(arr, x => [x]));
export const argBail = ((x => 'at')(log++), _atMaybeArray(arr).call(arr, 0));
export { log };