var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
// A simple duplicate parameter list is legal in sloppy code and keeps that loading mode.
function pick(a, a) {
  var _ref;
  return _atMaybeArray(_ref = [a]).call(_ref, 0);
}
var result = pick(1, 3);