import "core-js/modules/es.array.at";
type Items<T> = T[];
function wrap<T>(x: T): Items<T> {
  return [x];
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
wrap('hello').at(-1).toFixed(2);