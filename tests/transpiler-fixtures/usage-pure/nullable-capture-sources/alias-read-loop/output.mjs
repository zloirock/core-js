import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// The mirror of a loop element keeps its alias-rooted source read.
const held = _globalThis.window;
for (const {
  resolve
} of [(held.Promise, {
  resolve: _Promise$resolve
})]) use(resolve);