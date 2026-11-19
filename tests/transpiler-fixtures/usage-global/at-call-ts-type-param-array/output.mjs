import "core-js/modules/es.array.at";
function foo<T extends number[]>(x: T) {
  x.at(-1);
}