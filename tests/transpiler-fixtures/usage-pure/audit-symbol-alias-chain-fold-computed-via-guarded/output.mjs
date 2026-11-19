import _Symbol from "@core-js/pure/actual/symbol";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// NEGATIVE: a guarded aliasing write is flow-refused at registration - no fold
let GuardedSymbol;
if (cond) GuardedSymbol = _Symbol;
const viaGuarded = GuardedSymbol === _Symbol ? _Symbol$iterator : (_ref = GuardedSymbol.iterator) === void 0 ? fb : _ref;
export const ab = [45, 46][viaGuarded];