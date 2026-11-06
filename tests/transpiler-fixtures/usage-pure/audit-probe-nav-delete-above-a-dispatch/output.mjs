import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// the deleted member sits ABOVE an instance dispatch, so the members below it keep their claims and
// the collapse stops at the dispatch: the delete applies to the dispatched value, and over a probe the
// guard takes the whole operator, so the absent branch answers `true` and deletes nothing.
_globalThis.box = {
  list: [[1]]
};
export const deleteAboveDispatch = delete _at(_self.box.list).name;
export const deleteAboveDispatchProbe = null == (_ref = _globalThis.window) ? true : delete _includes(_ref.box.list).name;
export const deleteAboveDispatchPlainTail = null == (_ref2 = _globalThis.window) ? true : delete _concatMaybeArray(_ref2.box.list).customUserKey;