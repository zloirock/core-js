import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// an instance synth slot may spell an OBSERVABLE receiver once - a sole-prop pattern does
export const b1 = (() => {
  function f(_ref = Array.prototype) {
    let at = _atMaybeArray(_ref);
    return at;
  }
  return typeof f();
})();
export const r = [b1];