import "core-js/modules/es.array.at";
interface StringList extends Array<string> {}
function toList<T>(x: T): StringList {
  return [String(x)] as StringList;
}
toList(42).at(-1).toFixed(2);