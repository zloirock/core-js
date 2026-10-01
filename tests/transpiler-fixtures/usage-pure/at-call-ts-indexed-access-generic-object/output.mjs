import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function g<T extends object>(obj: T): T['key'] {
  return (obj as any).key;
}
const arr = g({
  key: [1, 2, 3]
});
_atMaybeArray(arr).call(arr, 0);