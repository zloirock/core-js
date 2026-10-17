import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
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
export const calledTwice = [twice([pick()]), twice([{
  Set: _Set,
  Array: {
    of: _Array$of
  }
}])];