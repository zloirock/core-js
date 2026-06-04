import _Array$from from "@core-js/pure/actual/array/from";
// The wrapper is reassigned only AFTER the destructuring read, so the read still sees the original
// `[Array]` snapshot and resolves the static method; the later write doesn't poison it
let w = [Array];
const from = _Array$from;
from([1]);
w = [];