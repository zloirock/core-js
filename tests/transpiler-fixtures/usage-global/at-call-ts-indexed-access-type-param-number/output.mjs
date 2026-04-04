import "core-js/modules/es.string.at";
function getFirst<T extends string[]>(arr: T): T[number] {
  return arr[0];
}
getFirst(["a", "b"]).at(0);