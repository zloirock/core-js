import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
import _Set from "@core-js/pure/actual/set";
// an untouched leading statement anchors the comments below
const anchor = [1, 2];
export { anchor };

// An effectful neighbour evaluates before the extracted property reads.
// Both extractions follow the original RHS; the unchanged receiver needs no capture.
const [, _ref] = [arr, effect()];
const at = _at(arr);
const keys = _keys(arr);
const viaCall = _ref;
export { at, keys, viaCall };

// ... a receiver-LESS static neither reads the element nor reorders anything, so the same
// neighbour leaves it free to extract
const [{
  Set: PureSet
}, viaSpread] = [{
  Set: _Set
}, ...tail];
export { PureSet, viaSpread };

// a PURE neighbour pins nothing: the consumed props leave the residual (their extractions bind
// them, and a residual re-reading the same keys would fire their getters a second time)
const at2 = _at(arr);
const keys2 = _keys(arr);
const [{}, plain] = [arr, 7];
export { at2, keys2, plain };

// ... while a receiver-less static keeps its sentinel there - it reads nothing to re-read
const [{
  Array: {
    from
  }
}, plain2] = [{
  Array: {
    from: _Array$from
  }
}, 1];
export { from, plain2 };