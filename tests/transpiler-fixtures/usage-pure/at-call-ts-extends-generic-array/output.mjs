import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `class MyArr extends Array<string>` - the type-arg in the extends clause is the array
// element type for instances of `MyArr`, so `arr.at(-1)` rewrites to the array-specific
// instance polyfill rather than the generic one.
class MyArr extends Array<string> {}
declare const arr: MyArr;
_atMaybeArray(arr).call(arr, -1);