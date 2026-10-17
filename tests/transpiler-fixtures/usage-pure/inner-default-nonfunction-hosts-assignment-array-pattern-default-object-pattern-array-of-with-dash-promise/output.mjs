import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$race from "@core-js/pure/actual/promise/race";
let S, M, alias, of, rest, race, d;
[{
  Array: {
    of
  },
  'with-dash': d,
  Promise: {
    race
  }
} = {
  Array: {
    of: _Array$of
  },
  "with-dash": _globalThis["with-dash"],
  Promise: {
    race: _Promise$race
  }
}] = [];
export const r = [of, race, d];