import _Array$from from "@core-js/pure/actual/array/from";
// for-init `const { Array: { from } } = (logCall(), globalThis)` with every property
// extracted: `Array.from` becomes a polyfill binding and the side-effecting `logCall()`
// is preserved exactly once inside the for-init declaration.
declare const logCall: () => any;
for (const {
  Array: {
    from
  }
} = (logCall(), {
  Array: {
    from: _Array$from
  }
}); false;) {
  console.log(from);
}