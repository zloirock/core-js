import "core-js/modules/es.array.at";
function foo(x: Exclude<number[] | null, null>) {
  x.at(-1);
}