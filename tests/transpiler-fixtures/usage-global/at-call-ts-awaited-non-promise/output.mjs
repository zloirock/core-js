import "core-js/modules/es.array.at";
function foo(items: Awaited<number[]>) {
  items.at(-1);
}