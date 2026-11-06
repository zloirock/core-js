import _Symbol from "@core-js/pure/actual/symbol";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// NEGATIVE: the consumer READS the alias before the aliasing write runs - the capture holds
// undefined and throws natively; a fold would silently rescue it
let LateSymbol;
const viaLate = LateSymbol === _Symbol ? _Symbol$iterator : (_ref = LateSymbol.iterator) === void 0 ? fb : _ref;
LateSymbol = _Symbol;
export const z = [41, 42][viaLate];