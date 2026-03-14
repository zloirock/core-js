import "core-js/modules/es.array.at";
function getItems(): string[] {
  return ['a', 'b'];
}
const fn = getItems as () => string[];
function process(x: ReturnType<typeof fn>) {
  x.at(-1);
}