import "core-js/modules/es.array.at";
function foo<T extends string, U extends number[]>(x: U) {
  x.at(-1);
}