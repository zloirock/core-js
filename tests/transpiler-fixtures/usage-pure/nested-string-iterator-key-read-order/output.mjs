import _at from "@core-js/pure/actual/instance/at";
// A computed string resembling a symbol label names an ordinary property.
// The outer receiver and its nested getters are read once in source order.
// An open nested receiver retains its instance polyfill.
export function read(input) {
  const {
      ['[@@iterator]']: _ref
    } = input,
    {
      other
    } = _ref,
    at = _at(_ref);
  return [other, at];
}