import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const guard = 1;
const {
  Array: {
    from = _Array$from,
    ...rest
  }
} = guard && _globalThis;
typeof from;