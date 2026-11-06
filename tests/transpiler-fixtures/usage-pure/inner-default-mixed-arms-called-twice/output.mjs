import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
// A parameter element can come from its realm default or a supplied realm on separate calls.
// The mixed constructor/static capture serves both branches without sharing their runtime state.
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