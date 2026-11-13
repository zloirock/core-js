// The mirror of a loop element keeps its alias-rooted source read.
const held = globalThis.window;
for (const { resolve } of [held.Promise]) use(resolve);
