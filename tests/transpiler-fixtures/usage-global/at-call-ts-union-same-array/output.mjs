import "core-js/modules/es.array.at";
function foo(x: number[] | string[]) {
  x.at(-1);
}