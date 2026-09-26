import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const from = _Array$from;
const {
  Array: {
    from: _unused,
    ...arrRest
  }
} = _globalThis;
export { from, arrRest };