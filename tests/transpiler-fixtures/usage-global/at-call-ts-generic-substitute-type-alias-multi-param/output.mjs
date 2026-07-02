import "core-js/modules/es.array.at";
type Wrapper<X, Y> = Array<Y>;
function wrap<T>(x: T): Wrapper<number, T> {
  return [x];
}
wrap('hello').at(-1).toFixed(2);