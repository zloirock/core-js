import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// the container-slot record is owed by EVERY member write, whatever statement hosts it - a for-x
// head and a destructuring target replace the slot exactly like the flat assignment does, and the
// read after each stops trusting the literal. the clean sibling keeps its substitution, which is
// what says the record is per slot rather than per container
const forHead = {
  Array,
  Map: _Map
};
for (forHead.Array of xs) {
  void 0;
}
forHead.Array.from(src);
_Map$groupBy(src, it => it);
const patternTarget = {
  Array
};
({
  a: patternTarget.Array
} = src);
patternTarget.Array.from(src);