import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Receiver writes remain observable; a direct pure import is a native-read control.
import max from '@core-js/pure/actual/number/max-safe-integer';
// A direct pure import stays native; a mutable receiver keeps its capture across key and argument writes.
var _ref;
const imported = max?.toFixed(0);
let receiver = [1, 2];
const result = null == (_ref = receiver) ? void 0 : (receiver = [3], (_includesMaybeArray(_ref) || 0).call(_ref, (receiver = [4], 2)));
const later = receiver;