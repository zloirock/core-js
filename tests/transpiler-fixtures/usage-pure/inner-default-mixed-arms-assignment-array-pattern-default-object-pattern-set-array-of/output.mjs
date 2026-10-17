import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
let assignedSet, assignedOf;
[{
  Set: assignedSet,
  Array: {
    of: assignedOf
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}] = [];
export { assignedSet };
export { assignedOf };