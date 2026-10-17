import "core-js/modules/es.array.at";
// A local type alias named String shadows the built-in container type.
// Its Array body selects the Array family for the shared at method.
type String = number[];
declare const source: String;
export function read({
  at
}: String = source) {
  return at;
}