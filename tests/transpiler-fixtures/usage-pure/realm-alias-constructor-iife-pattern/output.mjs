import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A nested IIFE pattern mirrors the static and keeps the nullable alias read.
const w = _globalThis.window;
(({
  resolve: {
    length
  }
}) => length)((w.Promise, {
  resolve: _Promise$resolve
}));