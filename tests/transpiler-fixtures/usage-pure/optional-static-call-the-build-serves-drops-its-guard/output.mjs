import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _Object$entries from "@core-js/pure/actual/object/entries";
var _ref, _ref2, _ref4, _ref5;
// an optional call of a static the build serves reads a pure import, defined on every engine, so its guard
// is dead - whether the read runs ahead of every write of its global or no write of the global ever runs,
// spelled off the global or inherited in a static method. a static the file deletes keeps its guard
export const last = _at(_ref = _Array$from(list)).call(_ref, -1);
if (isBrowser) window.Array = ArrayShim;
if (typeof Object == 'undefined') window.Object = ObjectShim;
export const lastEntry = _atMaybeArray(_ref2 = _Object$entries(dict)).call(_ref2, -1);
export class Bag extends Object {
  static lastEntry(dict) {
    var _ref3;
    return _at(_ref3 = _Object$entries.call(this, dict)).call(_ref3, -1);
  }
}
delete String.raw;
export const lastChar = null == (_ref4 = String.raw) ? void 0 : _at(_ref5 = _ref4.call(String, template)).call(_ref5, -1);