import "core-js/modules/es.array.at";
function foo(items: number[] | null | undefined) {
  items.at(-1);
}