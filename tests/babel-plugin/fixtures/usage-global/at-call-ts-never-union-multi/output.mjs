import "core-js/modules/es.array.at";
function foo(items: number[] | never | never) {
  items.at(-1);
}