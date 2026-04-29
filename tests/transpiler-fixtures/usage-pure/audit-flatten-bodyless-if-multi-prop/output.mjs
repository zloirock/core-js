import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// nested-proxy declaration flatten with multiple polyfillable props inside an unbraced
// if body. each prop becomes a separate `var binding = polyfill;` statement; without
// block-wrapping only the first stays gated, the rest are hoisted out of the if
if (cond) {
  var from = _Array$from;
  var fromEntries = _Object$fromEntries;
}