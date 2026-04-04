import "core-js/modules/es.string.at";
function foo<T: string>(x: T) {
  x.at(-1);
}