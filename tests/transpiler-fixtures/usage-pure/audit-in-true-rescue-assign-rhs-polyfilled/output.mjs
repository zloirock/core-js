import _Map from "@core-js/pure/actual/map/constructor";
// `'key' in (y = Map)` rescue: RHS AssignmentExpression is preserved verbatim into the
// replacement `(y = Map, true)`. the inner `Map` Identifier inside the AE-RHS must still
// reach the proxy-global rewrite - a blanket skip of the LHS subtree would suppress it
// and raw `Map` would strand into the output (IE11 ReferenceError)
let y;
const x = (y = _Map, true);