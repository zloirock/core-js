import _at from "@core-js/pure/actual/instance/at";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includes from "@core-js/pure/actual/instance/includes";
// adjacent block comments between `?.` and the call/bracket: the helper must consume
// each comment in turn and look at the structural next token. each line uses a
// different polyfilled method to make the per-line resolution visible: at / flatMap /
// includes
const a = arr == null ? void 0 : _at(arr).call(arr, 0);
const b = arr == null ? void 0 : _flatMapMaybeArray(arr).call(arr, _ => [_]);
const c = arr == null ? void 0 : _includes(arr).call(arr, 1);