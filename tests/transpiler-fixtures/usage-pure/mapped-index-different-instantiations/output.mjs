import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Only the length key of the source is mapped, although the value comes from an array.
type Box<T> = T;
type View = { [K in keyof Box<{
  length: unknown;
}>]: Box<string[]>[K] };
type Content = View extends unknown[] ? string : number[];
function read(value: Content) {
  return _atMaybeArray(value).call(value, 0);
}
export const result = read([42]);