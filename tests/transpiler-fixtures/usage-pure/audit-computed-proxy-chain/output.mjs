import _Array$from from "@core-js/pure/actual/array/from";
// computed proxy-global access `globalThis['Array'].from` - the computed receiver
// with a string literal key should still be recognized as `Array`, so the call
// polyfills to Array.from
_Array$from([1, 2, 3]);
// nested computed form via proxy chain: globalThis['self']['Array'].from
_Array$from([1, 2, 3]);