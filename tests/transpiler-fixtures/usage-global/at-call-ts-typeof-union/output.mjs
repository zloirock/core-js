import "core-js/modules/es.array.at";
const arr = [1, 2, 3];
function foo(items: typeof arr | null) {
  items.at(-1);
}