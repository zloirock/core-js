import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A user binding resembling a sentinel is not evidence that its property was consumed.
// The unknown Array leaf stays live beside the served constructor sibling.
const {
  Array: {
    missing: _unused
  },
  Promise: P
} = {
  Array: _globalThis.Array,
  Promise: _Promise
};
export { _unused, P };