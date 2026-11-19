import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$values from "@core-js/pure/actual/object/values";
var _ref;
// TS wrappers retain the stored receiver, source prefix and computed-key order.
// Pure optional splitting preserves the live window guard around the prototype claim.
const realm = _globalThis;
let held: typeof globalThis;
const log: string[] = [];
const value = _atMaybeArray(_ref = (_pushMaybeArray(log).call(log, 'root'), held = realm, _pushMaybeArray(log).call(log, 'key'), _Object$values)({
  a: 5
})).call(_ref, 0);
const claimed = null == _globalThis.window ? void 0 : _Map.prototype.has.call(new _Map([[1, 3]]), 1);