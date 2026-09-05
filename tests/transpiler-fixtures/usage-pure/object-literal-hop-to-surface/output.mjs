import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
// a hop the pattern descends through an object LITERAL reaches the same built-in surface its
// identifier-init twin does, so the claim dispatches on the nav those hops NAME (`_globalThis
// .Array.prototype`) rather than on the literal they start in. a sibling key beside the hop
// changes nothing about what the hop reads; a hop landing on a user value keeps the receiver's
// own type, which is the read the source performs
const at = _atMaybeArray(_globalThis.Array.prototype);
const includes = _includesMaybeArray(_globalThis.Array.prototype);
const map = _mapMaybeArray(_globalThis.Array.prototype);
const {
  z
} = {
  w: _globalThis,
  z: 1
};
const find = _findMaybeArray([1, 2]);
export default [at, includes, map, z, find];