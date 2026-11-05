import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// The served constructor sibling leaves the user-named unknown leaf in its native pattern.
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