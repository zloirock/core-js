import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
export const iifeBlock = (([{
  Set: S,
  Array: {
    of
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}]) => {
  return [S, of(7)];
})([]);