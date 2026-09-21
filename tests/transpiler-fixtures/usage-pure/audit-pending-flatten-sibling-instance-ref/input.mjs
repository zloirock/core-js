// A nested static and an instance call share a declaration.
// The instance receiver temporary remains declared in the enclosing scope.
let { Array: { from } } = globalThis, x = (sideEffect(), [1, 2, 3]).at(-1);
let { Array: { of } } = globalThis, y = (sideEffect(), [4, 5, 6]).findLast(v => v > 0);
export { from, x, of, y };
