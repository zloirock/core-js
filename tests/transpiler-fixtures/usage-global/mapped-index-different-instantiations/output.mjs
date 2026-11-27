import "core-js/modules/es.array.at";
// Only the length key of the source is mapped, although the value comes from an array.
type Box<T> = T;
type View = { [K in keyof Box<{
  length: unknown;
}>]: Box<string[]>[K] };
type Content = View extends unknown[] ? string : number[];
function read(value: Content) {
  return value.at(0);
}
export const result = read([42]);