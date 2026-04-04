import "core-js/modules/es.array.at";
function foo({
  items
}: {
  items: Array<number>
}) {
  items.at(-1);
}