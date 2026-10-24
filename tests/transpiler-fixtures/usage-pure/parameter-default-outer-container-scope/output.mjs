import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set/constructor";
// A default argument reads the outer box before the body var exists. The returned constructor
// carries Map's family; the unrelated Set in the body needs only its constructor.
const box = {
  value: _Map
};
export function read(arg = box) {
  var box = {
    value: _Set
  };
  return arg.value;
}