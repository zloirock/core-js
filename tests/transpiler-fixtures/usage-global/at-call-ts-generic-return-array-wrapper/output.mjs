import "core-js/modules/es.array.at";
function foo<T>(x: T): Array<T> {
  return [x];
}
foo('x').at(-1);