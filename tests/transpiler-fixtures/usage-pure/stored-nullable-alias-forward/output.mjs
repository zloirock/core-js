import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Forwarding a nullable alias through a store preserves the later read exception.
const held = _globalThis.window;
let saved;
const alias = saved = held;
(alias.self.Array.of, _Array$of)(3);