import _globalThis from "@core-js/pure/actual/global-this";
// A used assignment retains a native unknown static and the whole receiver.
let unknown;
const keptUnknown = ({
  Array: {
    unknown
  }
} = _globalThis, _globalThis);
use(typeof unknown);