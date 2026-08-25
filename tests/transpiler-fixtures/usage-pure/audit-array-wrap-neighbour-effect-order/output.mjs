import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
import _Set from "@core-js/pure/actual/set/constructor";
// an untouched leading statement anchors the comments below
const anchor = [1, 2];
export { anchor };

// NEGATIVE: an effect-bearing NEIGHBOUR element pins the order - native evaluates every element
// of the array literal before reading a property off any of them, while an extraction hoisted
// ahead of the declaration reads first. a receiver-reading claim therefore stays native
const [{}, viaCall] = [arr, effect()];
const at = _at(arr);
const keys = _keys(arr);
export { at, keys, viaCall };

// ... a receiver-LESS static neither reads the element nor reorders anything, so the same
// neighbour leaves it free to extract
const PureSet = _Set;
const [{
  Set: _unused
}, viaSpread] = [_globalThis, ...tail];
export { PureSet, viaSpread };

// a PURE neighbour pins nothing: the consumed props leave the residual (their extractions bind
// them, and a residual re-reading the same keys would fire their getters a second time)
const at2 = _at(arr);
const keys2 = _keys(arr);
const [{}, plain] = [arr, 7];
export { at2, keys2, plain };

// ... while a receiver-less static keeps its sentinel there - it reads nothing to re-read
const from = _Array$from;
const [{
  Array: {
    from: _unused2
  }
}, plain2] = [_globalThis, 1];
export { from, plain2 };