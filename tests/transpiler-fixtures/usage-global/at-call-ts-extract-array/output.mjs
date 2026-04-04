import "core-js/modules/es.array.at";
function foo(x: Extract<string | number[], number[]>) {
  x.at(-1);
}