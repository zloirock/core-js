import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// explicit grouping around TS as-cast / satisfies operand of UpdateExpression
let m = _Map;
let s = _Set;
((m satisfies Function))++;
((s as any))--;