import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// for-init `const { Array: { from } } = (logCall(), globalThis)` with every property
// extracted: `Array.from` becomes a polyfill binding and the side-effecting `logCall()`
// is preserved exactly once inside the for-init declaration.
declare const logCall: () => any;
for (const from = _Array$from, _unused = (logCall(), _globalThis); false;) {
  console.log(from);
}