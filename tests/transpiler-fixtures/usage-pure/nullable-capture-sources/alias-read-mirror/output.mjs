import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A plain read through an absent realm alias must still throw.
const held = _globalThis.window;
export const {
  resolve,
  unknown: {
    value
  } = {}
} = (held.Promise, {
  resolve: _Promise$resolve,
  unknown: _Promise.unknown
});