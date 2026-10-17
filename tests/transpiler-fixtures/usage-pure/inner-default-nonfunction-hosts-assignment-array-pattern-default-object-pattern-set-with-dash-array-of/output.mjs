import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
let S, M, alias, of, rest, race, d;
[{
  Set: S,
  'with-dash': d,
  Array: {
    of
  }
} = {
  Set: _Set,
  "with-dash": _globalThis["with-dash"],
  Array: {
    of: _Array$of
  }
}] = [];
export const r = [S, of, d];