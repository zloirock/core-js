import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
import _trimMaybeString from "@core-js/pure/actual/string/instance/trim";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
null == (_ref = null == (_ref2 = arr == null ? void 0 : _at(arr).call(arr, -1)) ? void 0 : _trimMaybeString(_ref2).call(_ref2)) ? void 0 : _padStartMaybeString(_ref).call(_ref, 2);