import "core-js/modules/es.array.at";
// A direct IIFE argument that yields undefined activates the Array prototype default.
// The closed undefined source keeps the default's Array instance import exact.
function source() {
  return undefined;
}
export const result = (({
  at
} = Array.prototype) => at.call([4], 0))(source());