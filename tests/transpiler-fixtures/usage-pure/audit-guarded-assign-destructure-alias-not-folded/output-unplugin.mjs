import _Array$from from "@core-js/pure/actual/array/from";
import _Object$entries from "@core-js/pure/actual/object/entries";
// a conditionally-run assignment-form destructure binds a static alias only on the guard's taken
// path (`if (c) ({ from = f0 } = Array)`), so the aliased CALL must stay dynamic - folding it to the
// receiver-less polyfill would mask the native TypeError on the untaken path (the alias is undefined
// there). the destructure's own static still resolves to the pure import; only the later call is kept
// raw. both the defaulted shorthand (AssignmentPattern) and the array-pattern slot (ArrayPattern) are
// covered - the two LHS shapes an estree violation climbs through. distinct constructor per line
let from;
if (c) from = _Array$from === void 0 ? f0 : _Array$from;
export const r = from("x");
let entries;
if (d) ([entries] = [_Object$entries]);
export const s = entries({});