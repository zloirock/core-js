import "core-js/modules/es.array.at";
function foo(a: number[], b: number[]) {
  (a || b).at(-1);
}