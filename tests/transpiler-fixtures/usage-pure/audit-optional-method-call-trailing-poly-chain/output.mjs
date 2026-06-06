import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// optional call on a non-polyfilled method, followed by TWO+ polyfilled instance methods:
// `recv.m?.().at(0).at(1)`. each trailing poly used to queue its own standalone transform over
// the shared `recv.m?.()` optional call - overlapping ranges crashed the transform queue. the
// combine now owns the whole optional chain and threads the poly hops onto one memoized inner
// result. a side-effecting receiver (`getList()`) is memoized once; babel comma-splits the
// receiver / method memo while unplugin nests it (output-unplugin), both evaluate it once
null == (_ref = obj.m) ? void 0 : _at(_ref2 = _at(_ref3 = _ref.call(obj)).call(_ref3, 0)).call(_ref2, 1);
null == (_ref4 = getList(), _ref5 = _ref4.fetch) ? void 0 : _findLastMaybeArray(_ref6 = _flatMaybeArray(_ref7 = _ref5.call(_ref4)).call(_ref7)).call(_ref6, p);