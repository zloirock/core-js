import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
declare const logCall: () => any;
for (const from = (logCall(), _Array$from), {
    Array: _unused,
    ...rest
  } = _globalThis; false;) {
  console.log(from, rest);
}