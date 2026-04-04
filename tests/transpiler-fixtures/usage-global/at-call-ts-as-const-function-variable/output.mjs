import "core-js/modules/es.array.at";
function getItems(): string[] {
  return ['a', 'b'];
}
const fn = getItems as () => string[];
fn().at(-1);