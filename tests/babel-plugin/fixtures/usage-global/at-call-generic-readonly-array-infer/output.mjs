import "core-js/modules/es.string.at";
function first<T>(items: ReadonlyArray<T>): T {
  return items[0];
}
first(['hello', 'world']).at(0);