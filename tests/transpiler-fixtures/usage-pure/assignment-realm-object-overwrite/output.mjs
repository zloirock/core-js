import _globalThis from "@core-js/pure/actual/global-this";
// An unconditional write replaces the initial realm with an opaque supplied value.
// Its constructor and static stay native; the overwritten initializer adds no guard.
function read(source) {
  let realm = _globalThis;
  ({
    value: realm
  } = source);
  return realm.Map.groupBy([1, 2], value => value % 2);
}