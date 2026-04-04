import "core-js/modules/es.array.at";
type Items = number[];
function foo(x: Items) {
  x.at(-1);
}