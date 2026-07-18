// the TS require-import shape of the RUNTIME interop helper: the helper binding is
// recognized by its module source, so the write through its wrapper still taints
import iop = require("@babel/runtime/helpers/interopRequireDefault");
var _g = iop(require("@core-js/pure/actual/global-this"));
_g.default.Map = Shim;
new Map([[1, 2]]);
