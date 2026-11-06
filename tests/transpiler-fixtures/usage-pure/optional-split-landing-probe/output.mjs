import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$values from "@core-js/pure/actual/object/values";
var _ref, _ref2;
// Optional static and instance claims keep the first live realm probe and stored receiver.
// Repeated window hops, constructor guards and parentheses retain their distinct short-circuit boundaries.
const log = [];
const value = null == _globalThis.window ? void 0 : _atMaybeArray(_ref = (_pushMaybeArray(log).call(log, 'key'), _Object$values)({
  a: 5
})).call(_ref, 0);
const claimed = null == _globalThis.window ? void 0 : _Map.prototype.has.call(new _Map([[1, 3]]), 1);
const sealed = _atMaybeArray((_globalThis.window?.Array).prototype).call([4], 0);
let held;
const repeatedStatic = null == (held = _globalThis.window)?.window ? void 0 : _atMaybeArray(_ref2 = _Array$from([7])).call(_ref2, 0);
const repeatedPrototype = null == (held = _globalThis.window)?.window ? void 0 : _Map.prototype.has.call(new _Map(), 1);
const guardedPrototype = null == _globalThis.window ? void 0 : _Map.prototype.has.call(new _Map(), 1);
const heldPrototype = null == (held = _globalThis.window) ? void 0 : _Map.prototype.has.call(new _Map(), 1);