import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
const box = {};
let S, M, alias, of, rest, race, d;
[{
  Set: S,
  Array: {
    of: box.of
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}] = [];
export const r = [S, box];