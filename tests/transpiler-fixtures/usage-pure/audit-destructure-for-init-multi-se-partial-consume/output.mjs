import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
declare const a: () => void;
declare const b: () => void;
for (const {} = (a(), b(), _globalThis), {
    Array: {},
    ...rest
  } = _globalThis, from = _Array$from; false;) {
  console.log(from, rest);
}