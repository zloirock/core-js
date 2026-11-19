import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set/constructor";
// The prefix must still see the first binding before its own write.
let a, b;
export const result = (inspect(a), a = _Map, b = _Set, done());