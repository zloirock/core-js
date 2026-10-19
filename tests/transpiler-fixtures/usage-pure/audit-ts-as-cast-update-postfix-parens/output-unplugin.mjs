// explicit grouping around TS as-cast / satisfies operand of an increment/decrement
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";

let m = _Map;
let s = _Set;

// @ts-expect-error an update through a cast, which tsc refuses, is the shape under test
(m satisfies Function)++;

(s as any)--;