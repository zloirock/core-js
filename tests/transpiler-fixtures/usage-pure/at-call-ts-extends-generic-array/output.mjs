import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `class MyArr extends Array<string>` - super's type arg is the element type for instances.
// resolveClassInheritance now threads `getSuperTypeArgs` through resolveKnownContainerType
// so the inner hint reaches polyfill dispatch. `.at(-1)` lands on `_atMaybeArray` instead of
// bare Array with no inner
class MyArr extends Array<string> {}
declare const arr: MyArr;
_atMaybeArray(arr).call(arr, -1);