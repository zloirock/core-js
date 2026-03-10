import "core-js/modules/es.array.at";
function foo(items: number[] | never | null) {
  items.at(-1);
}