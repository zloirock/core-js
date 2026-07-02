import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol$match from "@core-js/pure/actual/symbol/match";
// `Symbol.iterator in obj` - polyfillable well-known symbol. plugin rewrites the
// whole expression to the `isIterable` helper; outer `Symbol` identifier is subsumed
const a = _isIterable(obj);
// `Symbol.match in obj2` - not rewritable to a single helper, so plugin keeps the
// expression shape but still needs to polyfill the `Symbol.match` member access
const b = _Symbol$match in obj2;