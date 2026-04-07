import _includes from "@core-js/pure/actual/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
function f() {
  var _ref;
  return (_ref = _at(this).call(this, 0)) == null ? void 0 : _includes(_ref).call(_ref, 'x');
}