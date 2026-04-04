import "core-js/modules/es.array.at";
function foo(x: [name: string, items: number[]][1]) {
  x.at(-1);
}