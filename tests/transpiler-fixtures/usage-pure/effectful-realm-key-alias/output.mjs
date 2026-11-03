import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A realm alias behind an effectful prefix keeps its effectful hop native in pure.
const realm = _globalThis;
export const value = (_ref = (prefix(), realm)[key(), 'self'].Array, _ref === Array ? _Array$from([1]) : _ref.from([1]));