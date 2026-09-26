import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function getFirst<T>(arr: T[]): T | undefined {
  return <span>{_atMaybeArray(arr).call(arr, 0)}</span> as any;
}