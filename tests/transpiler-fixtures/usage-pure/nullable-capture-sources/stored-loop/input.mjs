// The loop element keeps its write and nullish rejection.
let held;
for (const { resolve } of [(held = globalThis.window)?.Promise]) use(resolve);
