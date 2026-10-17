import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
export const iifeRealm = (([{
  Set: S,
  Array: {
    of
  }
} = _globalThis]) => [S, of(7)])([{
  Set: _Set,
  Array: {
    of: _Array$of
  }
}]);