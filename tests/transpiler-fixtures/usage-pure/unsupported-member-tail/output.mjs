import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
var _ref;
// An unsupported member tail keeps its receiver and independently visited children.
// Known nested globals, statics and instance calls still request their own entries.
export const ctor = _Map.unrelatedField;
export const staticLength = _Array$from([1, 2]).length;
export const instanceLength = _flatMaybeArray(_ref = [1, [2]]).call(_ref).length;
export const optional = box?.unrelatedField?.(new _Set());
export const keyed = (box, effect(), _getIteratorMethod(box));
export const callResult = callable.call(receiver, _Object$entries({
  x: 1
}));
export const bindResult = callable.bind(receiver, _String$fromCodePoint(65));
const C = _Promise;
export const prototype = C.prototype;
export const constructor = C.prototype.constructor;