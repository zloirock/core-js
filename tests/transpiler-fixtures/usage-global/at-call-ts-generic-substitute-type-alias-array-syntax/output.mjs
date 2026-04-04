import "core-js/modules/es.array.at";
type Items<T> = T[];
function wrap<T>(x: T): Items<T> {
  return [x];
}
wrap('hello').at(-1).toFixed(2);