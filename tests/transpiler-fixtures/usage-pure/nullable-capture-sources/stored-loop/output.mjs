import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// The loop element keeps its write and nullish rejection.
let held;
for (const {
  resolve
} of [((null == (held = _globalThis.window) ? void 0 : _Promise).resolve, {
  resolve: _Promise$resolve
})]) use(resolve);