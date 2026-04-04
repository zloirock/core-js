import "core-js/modules/es.array.at";
function foo(x: readonly number[]) {
  x.at(-1);
}