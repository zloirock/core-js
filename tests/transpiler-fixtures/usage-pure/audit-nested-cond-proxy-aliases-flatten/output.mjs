import _Array$from from "@core-js/pure/actual/array/from";
// a PURE ternary over global-proxy ALIASES (`c ? globalThis : self` - the same object either
// way) is wholly discardable: both branches resolve identically, so the declarator flattens
// to the polyfill binding regardless of the selection
let c = true;
const from = _Array$from;
from([1]);