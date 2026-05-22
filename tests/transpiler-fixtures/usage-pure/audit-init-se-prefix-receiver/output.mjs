import _Array$from from "@core-js/pure/actual/array/from";
logCall();
// `const { from } = (logCall(), Array)`: the destructure resolves `Array.from` to a
// polyfill binding and the side-effecting `logCall()` is preserved exactly once.
const from = _Array$from;
from;