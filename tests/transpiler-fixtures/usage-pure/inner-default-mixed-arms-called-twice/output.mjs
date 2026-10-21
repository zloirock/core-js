import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims.
const pick = () => undefined;
function twice([{
  Set: S,
  Array: {
    of
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}]) {
  return [S, of(7)];
}
export const calledTwice = [twice([pick()]), twice([_globalThis])];