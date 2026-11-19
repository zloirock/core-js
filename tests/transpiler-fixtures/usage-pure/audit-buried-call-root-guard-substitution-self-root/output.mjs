import _self from "@core-js/pure/actual/self";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
var _ref;
export const selfRoot = null == (() => _self)()?.window ? void 0 : _padStartMaybeString(_ref = _String$fromCodePoint(97, 98)).call(_ref, 4, '-');