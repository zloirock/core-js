// A DOUBLE-nested optional-chain reaching the compose path: the inner `.at?.(0)` split is itself folded
// into the outer `.flat?.()` split's prefix half. Both optional-call suffixes must keep their own sourcemap
// columns, so the composed string is partitioned by EVERY split (inner and outer), not just the outermost.
const arr = [1, 2, 3];

export const r = ((arr.flat()).at?.(0)).flat?.();
