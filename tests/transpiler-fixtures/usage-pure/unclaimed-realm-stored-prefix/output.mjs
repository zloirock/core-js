import _globalThis from "@core-js/pure/actual/global-this";
// Importing the realm does not activate a raw anchor or remove source effects.
let held;
const {
  Array: {
    unknown
  }
} = (effect(), held = _globalThis);
use(held, unknown);