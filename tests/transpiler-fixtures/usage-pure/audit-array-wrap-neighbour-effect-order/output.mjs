import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// Call and spread neighbours run before the destructure reads any array element.
// Instance leaves share their captured element; constructor and static wrapper reads remain native.
const anchor = [1, 2];
export { anchor };

// An effectful neighbour evaluates before the extracted property reads.
// Both extractions follow the original RHS; the unchanged receiver needs no capture.
const [, _ref] = [arr, effect()];
const at = _at(arr);
const keys = _keys(arr);
const viaCall = _ref;
export { at, keys, viaCall };

// A realm constructor beside a spread keeps its native property read and iteration.
const [{
  Set: PureSet
}, viaSpread] = [_globalThis, ...tail];
export { PureSet, viaSpread };

// a PURE neighbour pins nothing: the consumed props leave the residual (their extractions bind
// them, and a residual re-reading the same keys would fire their getters a second time)
const at2 = _at(arr);
const keys2 = _keys(arr);
const [{}, plain] = [arr, 7];
export { at2, keys2, plain };

// A static-only element with a neighbour retains its native property read.
const [{
  Array: {
    from
  }
}, plain2] = [_globalThis, 1];
export { from, plain2 };