import "core-js/modules/es.string.at";
function foo<T extends string>(x: T) {
  x.at(-1);
}