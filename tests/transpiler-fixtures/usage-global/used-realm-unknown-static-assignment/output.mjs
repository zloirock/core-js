import "core-js/modules/es.global-this";
// A used assignment retains a native unknown static and the whole receiver.
let unknown;
const keptUnknown = {
  globalThis: {
    Array: {
      unknown
    }
  }
} = globalThis;
use(typeof unknown);