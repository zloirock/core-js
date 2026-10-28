import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import max from '@core-js/pure/actual/number/max-safe-integer';
// Adopted imports and mutable receivers keep their capture across key and argument writes.
var _ref;
const imported = max?.toFixed(0);
let receiver = [1, 2];
const result = null == (_ref = receiver) ? void 0 : (receiver = [3], (_includesMaybeArray(_ref) || 0).call(_ref, (receiver = [4], 2)));
const later = receiver;