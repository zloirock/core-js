// external-helpers shape: the interop helper lives on the `babelHelpers` global - the
// member callee must taint like the inline helper name
var _g = babelHelpers.interopRequireDefault(require("@core-js/pure/actual/global-this"));
_g.default.Map = Shim;
new Map([[1, 2]]);