import "core-js/modules/es.array.at";
function foo(flag: boolean, a: number[], b: number[]) {
  (flag ? a : b).at(-1);
}