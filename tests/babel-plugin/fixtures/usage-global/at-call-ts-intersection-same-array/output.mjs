import "core-js/modules/es.array.at";
function foo(x: number[] & ReadonlyArray<number>) {
  x.at(-1);
}