// babel CJS-interop shape of a pure global-this import: the wrapper itself is not the global,
// its `.default` is - a slot write through it must taint exactly like the bare proxy write
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _g = _interopRequireDefault(require("@core-js/pure/actual/global-this"));
_g.default.Map = Shim;
new Map([[1, 2]]);
