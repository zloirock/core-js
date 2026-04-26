// CommonJS computed-key `module['exports'] = ...`: the assignment LHS is preserved,
// but the RHS expression `[].at(-1)` is still scanned and polyfilled.
module['exports'] = { items: [].at(-1) };
