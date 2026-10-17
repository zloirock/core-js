import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A re-readable built-in surface serves several default slots; a sole slot over a call receiver
// evaluates the call once inside the mirror. Supplied arguments keep their own properties.
export const b2 = (() => {
  function f(_ref = Array.prototype) {
    let at = _atMaybeArray(_ref);
    let flat = _flatMaybeArray(_ref);
    return [at, flat];
  }
  return f().length;
})();
export const r = [b2];