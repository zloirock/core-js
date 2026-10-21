import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2;
// Nested key claims stay inside the source optional branches of repeated realm navigation.
const log = [];
const v = null == (_ref = _globalThis.window?.window?.[_pushMaybeArray(log).call(log, "k"), "self"]) ? void 0 : _atMaybeArray(_ref2 = _ref.Array.of(7)).call(_ref2, 0);
use(v, log);