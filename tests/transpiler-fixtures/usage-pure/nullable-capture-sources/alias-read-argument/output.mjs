import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Both synth bindings retain the throwing alias read.
const held = _globalThis.window;
export const result = (({
  resolve
}) => resolve)((held.Promise, {
  resolve: _Promise$resolve
}));