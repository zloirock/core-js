import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a chain assignment with a pure fallback RHS: the assignment is rescued WHOLE (the binding
// keeps the native value, the fallback short-circuits natively) and the declarator flattens
// to the polyfill binding
let w;
const from = (w = _globalThis || _self, _Array$from);
from([1]);