import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// hops naming USER keys resolve the leaf through the receiver's own TYPE, so the dispatch reads
// the hop the source reads (`src.y`). hops that merely REACH a built-in namespace are a name
// match instead, and there the leaf keeps its slot read
const src = {
  y: [1, [2]]
};
const sole = function () {
  const at = _atMaybeArray(src.y);
  return at;
}();
const deep = function () {
  const nest = {
    a: {
      b: [1, [2]]
    }
  };
  const flat = _flatMaybeArray(nest.a.b);
  return flat;
}();
const nameMatch = function () {
  const {
    keys
  } = _globalThis.Array;
  return keys;
}();
export { sole, deep, nameMatch };