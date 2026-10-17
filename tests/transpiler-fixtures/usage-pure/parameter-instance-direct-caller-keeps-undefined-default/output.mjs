import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A direct IIFE argument that yields undefined activates the Array prototype default.
function source() {
  return undefined;
}
export const result = ((_ref = Array.prototype) => {
  let at = _atMaybeArray(_ref);
  return at.call([4], 0);
})(source());