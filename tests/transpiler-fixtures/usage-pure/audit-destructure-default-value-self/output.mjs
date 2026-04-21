import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _isIterable from "@core-js/pure/actual/is-iterable";
// proxy-global alias via `self` (not `globalThis`). `resolveObjectName` treats both as
// proxy-globals; the alias registration path must cover every receiver in
// `POSSIBLE_GLOBAL_OBJECTS`, not just `globalThis`
const S = _Symbol === void 0 ? null : _Symbol;
_isIterable(obj);