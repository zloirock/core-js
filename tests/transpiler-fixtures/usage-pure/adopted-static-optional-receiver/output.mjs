import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
// Reusing an existing pure import does not make it a private receiver capture.
import max from '@core-js/pure/actual/number/max-safe-integer';
// Reusing a pre-existing pure import does not make its live binding a private capture.
var _ref;
let changed;
export const result = null == (_ref = max) ? void 0 : (changed = 1, (_toFixedMaybeNumber(_ref) || 0).call(_ref, (changed = 2, 0)));
export { changed, max };