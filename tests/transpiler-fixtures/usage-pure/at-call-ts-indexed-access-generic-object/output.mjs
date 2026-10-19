import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// @ts-expect-error an index into a type parameter tsc cannot key is the shape under test
function g<T extends object>(obj: T): T['key'] {
  return (obj as any).key;
}
const arr = g({
  key: [1, 2, 3]
});
_atMaybeArray(arr).call(arr, 0);