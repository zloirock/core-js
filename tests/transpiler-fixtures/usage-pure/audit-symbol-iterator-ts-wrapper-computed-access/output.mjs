import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// computed member access with `Symbol.iterator` wrapped in a TS `as any` cast -
// plugin must see through the type cast and recognize the key as `Symbol.iterator`
const iter = _getIteratorMethod(obj);