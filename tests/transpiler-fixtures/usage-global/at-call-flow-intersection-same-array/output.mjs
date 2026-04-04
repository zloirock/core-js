import "core-js/modules/es.array.at";
function foo(x: number[] & Array<string>) {
  x.at(-1);
}