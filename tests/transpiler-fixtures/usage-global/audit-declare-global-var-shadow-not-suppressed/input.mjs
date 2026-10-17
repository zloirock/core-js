// ambient `var` inside a `declare global` block is namespace-scoped and tsc-elided,
// so it must not suppress the polyfill for the real global used outside the block
declare global { var Map: any }
new Map();
