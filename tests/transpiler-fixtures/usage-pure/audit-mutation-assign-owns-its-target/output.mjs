import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
// `Object.assign` is the one call whose writes this census can NAME, so handing it a container is
// not the blanket escape every other call is: the keys it installs are recorded one by one and
// every OTHER slot of that container stays readable. ownership needs every source readable - an
// opaque source or a key the walk cannot fold puts the target back under the generic wildcard
const owned = {
  a: Object,
  b: _Map
};
_Object$assign(owned, {
  a: 1
});
_Map$groupBy(src, it => it);
const opaqueSource = {
  a: Object,
  b: _Set
};
_Object$assign(opaqueSource, src);
opaqueSource.b.union(other);
const opaqueKey = {
  a: Object,
  b: _WeakMap
};
_Object$assign(opaqueKey, {
  [k]: 1
});
opaqueKey.b.of(src);