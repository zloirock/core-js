import "core-js/modules/es.array.at";
function foo({
  items = []
}: {
  items: number[];
}) {
  items.at(-1);
}