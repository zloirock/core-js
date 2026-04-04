import "core-js/modules/es.array.at";
function first<T extends string[]>(arr: T): T {
  return arr;
}
first(['a', 'b']).at(0);