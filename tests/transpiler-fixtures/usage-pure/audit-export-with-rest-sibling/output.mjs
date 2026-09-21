import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
export const from = _Array$from;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
export const {
  Array: _unused,
  ...rest
} = _globalThis;
[from, rest];