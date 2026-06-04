import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A flatten-declaration sibling whose instance entry carries a default: the polyfilled receiver is
// memoized into a ref so the default-guard evaluates it once, matching the standalone byStatement emit
const from = _Array$from;
const at = (_ref = _at(getArr())) === void 0 ? fallback : _ref;
from([1]);
console.log(at);