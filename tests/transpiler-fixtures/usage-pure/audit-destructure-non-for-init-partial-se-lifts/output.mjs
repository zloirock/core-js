import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Statement-scope `const { Array: { from }, ...rest } = (logCall(), globalThis)`:
// `Array.from` is extracted as a polyfill, the side-effecting `logCall()` runs exactly
// once as a lifted statement before the preserved rest-destructure.
declare const logCall: () => any;
logCall();
const from = _Array$from;
const {
  Array: _unused,
  ...rest
} = _globalThis;
console.log(from, rest);