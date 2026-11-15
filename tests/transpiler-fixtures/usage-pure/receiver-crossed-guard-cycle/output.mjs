import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Mutually guarded writes keep the same decision whichever alias is queried first.
let a = Array;
let b = _Map;
let c = _Promise;
if (!b) if (!c) a = other;
if (!a) b = another;
if (!b) c = last;
export const result = _Array$from([7]);