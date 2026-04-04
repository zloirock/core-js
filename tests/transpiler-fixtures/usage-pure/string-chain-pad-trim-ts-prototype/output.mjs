import _trimMaybeString from "@core-js/pure/actual/string/instance/trim";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
function f(s: string) {
  var _ref;
  _trimMaybeString(_ref = _padStartMaybeString(s).call(s, 10, "0")).call(_ref);
}