import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
let caughtSet, caughtOf;
try {
  throw [];
} catch ([{
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
  caughtSet = S;
  caughtOf = of;
}
export { caughtSet };
export { caughtOf };