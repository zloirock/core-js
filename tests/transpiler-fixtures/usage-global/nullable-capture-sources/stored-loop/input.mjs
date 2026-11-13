// The loop element keeps its write and nullish rejection.
// Global preserves the source; this row guards the injection surface.
let held;
for (const { resolve } of [(held = globalThis.window)?.Promise]) use(resolve);
