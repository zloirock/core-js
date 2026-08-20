import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// A proxy-global receiver wrapped in a transparent value position (array element, object-literal value
// read back through a member) collapses its redundant `.self` hop to the pure global root
// (`globalThis.self.Array.prototype` -> `_globalThis.Array.prototype`), never a raw read off-engine (ie:11).
// the unwrapped receiver is a single concrete Array.prototype, so multi-type methods (includes, at) narrow
// to the array variant - proving the type resolves THROUGH the wrapper. distinct method per line.
const arrayElem = _includesMaybeArray([_globalThis.Array.prototype][0]).call([1], 1);
const objMember = _atMaybeArray({
  box: _globalThis.Array.prototype
}.box).call([1], 0);
export { arrayElem, objMember };