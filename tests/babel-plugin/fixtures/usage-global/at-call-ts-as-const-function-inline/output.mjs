import "core-js/modules/es.array.at";
function getItems(): string[] {
  return ['a', 'b'];
}
(getItems as () => string[])().at(-1);