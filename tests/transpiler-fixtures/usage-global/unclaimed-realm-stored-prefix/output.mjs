import "core-js/modules/es.global-this";
// Importing the realm does not activate a raw anchor or remove source effects.
let held;
const {
  Array: {
    unknown
  }
} = (effect(), held = globalThis);
use(held, unknown);