import _Map from "@core-js/pure/actual/map/constructor";
// a LOCAL `babelHelpers` binding shadows the external-helpers global: the member callee is
// NOT the interop helper, nothing taints, and the bare read substitutes as usual
var babelHelpers = {
  interopRequireDefault: function (e) {
    return {
      default: e
    };
  }
};
var _g = babelHelpers.interopRequireDefault(require("@core-js/pure/actual/global-this"));
_g.default.Map = Shim;
new _Map([[1, 2]]);