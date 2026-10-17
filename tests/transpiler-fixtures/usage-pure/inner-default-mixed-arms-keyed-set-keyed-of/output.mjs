import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
const {
  p: {
    Set: keyedSet,
    Array: {
      of: keyedOf
    }
  } = {
    Set: _Set,
    Array: {
      of: _Array$of
    }
  }
} = {};
export { keyedSet };
export { keyedOf };