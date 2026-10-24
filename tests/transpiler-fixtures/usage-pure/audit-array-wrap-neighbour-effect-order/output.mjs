import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const anchor = [1, 2];
export { anchor };
const [, _ref] = [arr, effect()];
const at = _at(arr);
const keys = _keys(arr);
const viaCall = _ref;
export { at, keys, viaCall };
const [{
  Set: PureSet
}, viaSpread] = [_globalThis, ...tail];
export { PureSet, viaSpread };
const at2 = _at(arr);
const keys2 = _keys(arr);
const [{}, plain] = [arr, 7];
export { at2, keys2, plain };
const [{
  Array: {
    from
  }
}, plain2] = [_globalThis, 1];
export { from, plain2 };