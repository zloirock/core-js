import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
const pick = () => undefined;
export const iifeOpen = (([{
  Set: S,
  Array: {
    of
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}]) => [S, of(7)])([pick()]);