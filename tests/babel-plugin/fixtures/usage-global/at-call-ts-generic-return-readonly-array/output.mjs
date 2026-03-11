import "core-js/modules/es.array.at";
function foo<T>(x: T): readonly T[] {
  return [x];
}
foo('x').at(-1);