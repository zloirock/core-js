import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
function eff() {}
// NEGATIVE: the store holding the PROBE keeps its `?.` - the sequence hands that value on, so the
// optional guards a read that genuinely short-circuits and nothing above it folds
let g5;
export const overProbeStore = null == (eff(), g5 = _globalThis.window) ? void 0 : _atMaybeArray(g5.Array.prototype);