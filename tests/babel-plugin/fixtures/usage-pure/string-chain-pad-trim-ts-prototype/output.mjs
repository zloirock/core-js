import _trim from "@core-js/pure/actual/instance/trim";
import _padStart from "@core-js/pure/actual/instance/pad-start";
function f(s: string) {
  var _ref;
  _trim(_ref = _padStart(s).call(s, 10, "0")).call(_ref);
}