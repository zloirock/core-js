import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// nested-proxy declaration flatten with multiple polyfillable props inside an unbraced
// if body. each prop becomes a `binding = polyfill` declarator of the one `var` the slot
// holds; as separate statements only the first would stay gated, the rest hoisted out of the if
if (cond) var from = _Array$from,
  fromEntries = _Object$fromEntries;