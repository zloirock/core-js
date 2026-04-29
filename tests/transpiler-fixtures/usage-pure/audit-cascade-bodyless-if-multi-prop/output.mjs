import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// nested-proxy assignment cascade with multiple polyfillable props inside an unbraced
// if body. without block-wrapping the second polyfill assignment escapes the gate
// and runs unconditionally, breaking the if's runtime semantics
let from, fromEntries;
if (cond) {
  from = _Array$from;
  fromEntries = _Object$fromEntries;
}