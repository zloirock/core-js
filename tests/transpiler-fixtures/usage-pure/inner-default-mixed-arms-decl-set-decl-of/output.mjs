import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
const [{
  Set: declSet,
  Array: {
    of: declOf
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}] = [];
export { declSet };
export { declOf };