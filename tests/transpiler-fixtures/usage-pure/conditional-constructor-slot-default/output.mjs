import _Symbol from "@core-js/pure/actual/symbol";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// A well-known symbol must be present before the user's leaf default is considered.
let S;
if (true) S = _Symbol;
const value = S === _Symbol ? _Symbol$iterator : (_ref = S.iterator) === void 0 ? 'fallback' : _ref;
export const result = typeof value;