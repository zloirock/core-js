import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
// A pattern hop through an object literal can reach a built-in surface. A sole consumed hop may
// dispatch directly on that surface. With an outer sibling, capture the complete literal first,
// dispatch through its nested property, then read the sibling. A user value keeps its own receiver
// type.
const at = _atMaybeArray(_globalThis.Array.prototype);
const includes = _includesMaybeArray(_globalThis.Array.prototype);
const _ref = {
  w: _globalThis,
  z: 1
};
const map = _mapMaybeArray(_ref.w.Array.prototype);
const {
  z
} = _ref;
const find = _findMaybeArray([1, 2]);
export default [at, includes, map, z, find];