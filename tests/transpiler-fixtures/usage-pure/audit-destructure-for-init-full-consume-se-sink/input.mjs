// for-init `const { Array: { from } } = (logCall(), globalThis)` with every property
// extracted: `Array.from` becomes a polyfill binding and the side-effecting `logCall()`
// is preserved exactly once inside the for-init declaration.
declare const logCall: () => any;
for (const { Array: { from } } = (logCall(), globalThis); false; ) {
  console.log(from);
}
