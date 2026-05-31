// an optional CALL on a polyfillable static (`Array.from?.(...)`) followed by a polyfillable
// instance method (`.at`). the polyfilled callee is always defined, so the `?.` is dead - both
// plugins deopt it rather than guard an always-defined binding (for unplugin a guard over the
// bare callee would also overlap the static rewrite range and crash the compose). regression lock
Array.from?.([1]).at(-1);
