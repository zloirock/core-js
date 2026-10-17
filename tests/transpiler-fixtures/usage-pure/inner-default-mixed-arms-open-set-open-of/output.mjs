import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
const pick = () => undefined;
const [{
  Set: openSet,
  Array: {
    of: openOf
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}] = [pick()];
export { openSet };
export { openOf };