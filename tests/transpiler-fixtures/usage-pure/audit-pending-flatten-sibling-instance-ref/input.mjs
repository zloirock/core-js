// Nested-proxy flatten on declarator [0] runs alongside an instance-polyfill on declarator [1].
// Pending-ref splices inside the preserved declarator's range must merge cleanly with the flatten overwrite.
let { Array: { from } } = globalThis, x = (sideEffect(), [1, 2, 3]).at(-1);
let { Array: { of } } = globalThis, y = (sideEffect(), [4, 5, 6]).findLast(v => v > 0);
export { from, x, of, y };
