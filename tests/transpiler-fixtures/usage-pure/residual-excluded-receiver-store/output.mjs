import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// A stored optional receiver preserves the stored value and the guarded member read.
// Exclusion must not turn the native leaf into an unconditional constructor import.
let held;
const {
  missing = fallback()
} = (held = (record(), _globalThis.window?.self), held === _globalThis ? _Map : held.Map);
use(held, missing);