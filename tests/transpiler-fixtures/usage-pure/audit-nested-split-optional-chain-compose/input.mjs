// A nested optional-chain split reaching the compose path: the inner `arr.flat()` polyfill folds into the
// outer `.at?.(0)` split's prefix half, so they compose as one needle-substituted string. The optional-
// chain suffix stays the trailing slice and is emitted as its own overwrite (keeps fine sourcemap columns).
const arr = [1, 2, 3];

export const r = (arr.flat()).at?.(0);
