import "core-js/modules/es.array.at";
const items: number[] = getData();
function foo(x: typeof items) {
  x.at(-1);
}