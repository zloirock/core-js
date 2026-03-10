import "core-js/modules/es.array.at";
function foo({
  items: arr
}: {
  items: number[];
}) {
  arr.at(-1);
}