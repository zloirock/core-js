// The mirror of a loop element keeps its alias-rooted source read.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window;
for (const { resolve } of [held.Promise]) use(resolve);
