import "core-js/modules/es.array.at";
function foo<T>(x: T): number[] {
  return [];
}
foo('hello').at(-1);