// control / broader shape: a COMPOUND assignment (`+=`) to a static on a polyfillable global ctor
// reads AND writes the slot, so both the compound and the later plain read must stay on the global -
// rewriting any to the pure import would desync the monkey-patched slot. no polyfill import emitted.
Map.foo = 0;
Map.foo += 1;
export const result = Map.foo;