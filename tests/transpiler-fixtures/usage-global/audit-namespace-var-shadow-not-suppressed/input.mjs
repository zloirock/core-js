// an ambient `var` inside a named `namespace` block is namespace-scoped and tsc-elided,
// so it must not suppress the polyfill for the real global constructor used outside the block
namespace N { var Set: any }
new Set();
