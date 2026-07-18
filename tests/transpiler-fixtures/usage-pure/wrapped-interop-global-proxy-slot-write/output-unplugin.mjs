// transparent wrappers around the interop hop: oxc keeps the parens babel strips and both
// parsers keep TS casts - the peel must land both emitters on the same taint decision
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _g = _interopRequireDefault(require("@core-js/pure/actual/global-this"));
(_g as any).default.Map = Shim;
(_g).default.Set = Shim;
new Map([[1, 2]]);
new Set([1, 2]);