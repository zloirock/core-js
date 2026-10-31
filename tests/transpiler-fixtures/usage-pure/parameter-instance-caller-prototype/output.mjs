import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A sole known caller supplies the prototype receiver at parameter consumption.
// The method keeps its string receiver family.
export const result = ((_ref, _unused = void 0) => {
  let at = _atMaybeString(_ref.prototype);
  return at.call('az', -1);
})(String);