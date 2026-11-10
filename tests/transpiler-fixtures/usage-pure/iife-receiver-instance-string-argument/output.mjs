import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  const text = "ab";
  return function (_ref = []) {
    let at = _atMaybeString(_ref);
    return [at.call(text, -1), arguments[0] === text];
  }(text);
})();