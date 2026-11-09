import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// Forwarding a nullable alias through a store preserves the later read exception.
const held = globalThis.window;
let saved;
const alias = saved = held;
alias.self.Array.of(3);