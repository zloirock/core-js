import _Object$assign from "@core-js/pure/actual/object/assign";
// The argument receives the original object after the destructured static is assigned.
export function read(shim, consume) {
  var _ref;
  let assign;
  return consume((_ref = shim || Object, assign = _ref === Object ? _Object$assign : _ref.assign, _ref), assign);
}