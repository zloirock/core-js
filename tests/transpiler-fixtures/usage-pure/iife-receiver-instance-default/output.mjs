import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  return function (_ref = []) {
    let at = _atMaybeArray(_ref);
    return [at.call([4, 15], -1), arguments[0] === undefined];
  }();
})();