import "core-js/modules/es.array.at";
function foo(x: Exclude<number[], string>) {
  x.at(-1);
}