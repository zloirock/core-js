import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// optional call on a non-polyfilled method, followed by TWO+ polyfilled instance methods:
// `recv.m?.().at(0).at(1)`. one transform must own the whole optional chain and thread the poly
// hops onto a single memoized inner result; queuing each trailing poly separately overlaps
// ranges and crashes. a side-effecting receiver (`getList()`) is memoized and evaluated once.
null == (_ref = obj.m) ? void 0 : _at(_ref2 = _at(_ref3 = _ref.call(obj)).call(_ref3, 0)).call(_ref2, 1);
null == (_ref4 = getList(), _ref5 = _ref4.fetch) ? void 0 : _findLastMaybeArray(_ref6 = _flatMaybeArray(_ref7 = _ref5.call(_ref4)).call(_ref7)).call(_ref6, p);