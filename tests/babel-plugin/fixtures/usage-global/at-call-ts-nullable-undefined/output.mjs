import "core-js/modules/es.array.at";
function foo(items: number[] | undefined) {
  items.at(-1);
}