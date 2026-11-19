import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A retained store in a declaration still owes the source coercion.
let held;
export const {
  resolve: {
    length
  }
} = ((null == (held = _globalThis.window) ? void 0 : _Promise).resolve, {
  resolve: _Promise$resolve
});