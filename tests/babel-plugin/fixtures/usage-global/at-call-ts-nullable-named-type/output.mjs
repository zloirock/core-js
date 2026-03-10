import "core-js/modules/es.array.at";
function foo(items: Array<number> | null) {
  items.at(-1);
}