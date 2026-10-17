import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
const pick = () => undefined;
const once = ([{
  Set: S,
  Array: {
    of
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}]) => [S, of(7)];
const spreadArgs = [[pick()]];
export const spread = once(...spreadArgs);