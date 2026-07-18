// transform-runtime shape: the interop helper is IMPORTED (here under an alias) instead of
// inlined - recognition is helper-SOURCE-based, so the write still taints
import iop from "@babel/runtime/helpers/esm/interopRequireDefault";
var _g = iop(require("@core-js/pure/actual/global-this"));
_g.default.Map = Shim;
new Map([[1, 2]]);
