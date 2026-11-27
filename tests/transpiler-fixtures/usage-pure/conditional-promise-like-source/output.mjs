import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A thenable has an awaited value but need not implement all Promise methods.
type Content<T> = T extends Promise<infer V> ? string : number[];
function read(value: Content<PromiseLike<number>>) {
  return _atMaybeArray(value).call(value, 0);
}
export const result = read([42]);