import "core-js/modules/es.array.at";
interface Base<T> extends Array<T> {}
interface Derived<U> extends Base<U> {}
function wrap<T>(x: T): Derived<T> {
  return [x] as Derived<T>;
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
wrap('hello').at(-1).toFixed(2);