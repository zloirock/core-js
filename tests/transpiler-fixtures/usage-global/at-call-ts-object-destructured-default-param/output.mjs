import "core-js/modules/es.array.at";
function f({
  items
}: {
  items: string[];
} = {}) {
  items.at(-1);
}