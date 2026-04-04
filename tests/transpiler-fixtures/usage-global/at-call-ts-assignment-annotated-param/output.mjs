import "core-js/modules/es.array.at";
function foo(a: number[]) {
  let x;
  (x = a).at(-1);
}