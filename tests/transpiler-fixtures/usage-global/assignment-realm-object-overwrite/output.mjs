import "core-js/modules/es.global-this";
// An unconditional write replaces the initial realm with an opaque supplied value.
// Its constructor and static stay native; the overwritten initializer adds no guard.
function read(source) {
  let realm = globalThis;
  ({
    value: realm
  } = source);
  return realm.Map.groupBy([1, 2], value => value % 2);
}