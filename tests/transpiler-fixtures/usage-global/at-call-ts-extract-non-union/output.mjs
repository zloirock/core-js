import "core-js/modules/es.array.at";
function foo(x: Extract<number[], number[]>) {
  x.at(-1);
}