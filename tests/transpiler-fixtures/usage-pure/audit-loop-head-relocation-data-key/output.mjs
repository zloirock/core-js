import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// NEGATIVE: where the element types and the key names no polyfill, relocating would only cost the
// binding its own type - the pattern stays where the source wrote it
const dataKey = function () {
  let seen;
  for (const {
    name
  } of [{
    name: [1, 2, 3]
  }]) seen = _atMaybeArray(name).call(name, -1);
  return seen;
}();
export { dataKey };