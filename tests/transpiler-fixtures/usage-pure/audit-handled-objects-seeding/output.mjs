import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol$match from "@core-js/pure/actual/symbol/match";
// polyfillable Symbol.X - seed handledObjects so outer rewrite subsumes the Symbol identifier
const a = _isIterable(obj);
// unpolyfillable key (Symbol.match stage) - leave Symbol in place; identifier visitor must fire separately
const b = _Symbol$match in obj2;