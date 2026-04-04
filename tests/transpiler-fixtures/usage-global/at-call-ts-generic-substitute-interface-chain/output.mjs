import "core-js/modules/es.array.at";
interface Base<T> extends Array<T> {}
interface Derived<U> extends Base<U> {}
function wrap<T>(x: T): Derived<T> {
  return [x] as Derived<T>;
}
wrap('hello').at(-1).toFixed(2);