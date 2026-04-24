import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// property-access counterpart of `audit-in-symbol-ts-as-double-wrapper` - the computed-key
// unwrapping must peel multiple levels of TS `as` casts to reach `Symbol.iterator`
const iter = _getIteratorMethod(obj);