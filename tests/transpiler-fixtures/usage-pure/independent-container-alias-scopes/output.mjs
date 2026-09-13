import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set";
// The escaping box belongs to read. The unrelated hidden binding only reads a static method,
// so pure keeps Map's constructor entry while the returned Set carries its whole family.
function hidden() {
  const box = {
    value: _Map
  };
  return _Map$groupBy([1], x => x);
}
export function read() {
  const box = {
    value: _Set
  };
  return box.value;
}