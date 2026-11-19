// Forwarding a nullable alias through a store preserves the later read exception.
const held = globalThis.window;
let saved;
const alias = saved = held;
alias.self.Array.of(3);
