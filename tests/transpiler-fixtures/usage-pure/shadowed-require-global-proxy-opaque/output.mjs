import _Map from "@core-js/pure/actual/map/constructor";
// an in-file `require` binding is NOT the CJS import: the alias stays opaque, nothing
// taints, and the bare read substitutes as usual
function require(x) {
  return {};
}
var g = require("@core-js/pure/actual/global-this");
g.Map = Shim;
new _Map([[1, 2]]);