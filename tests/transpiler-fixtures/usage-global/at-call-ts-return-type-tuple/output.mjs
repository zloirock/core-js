import "core-js/modules/es.array.at";
function getTuple(): [number, string] {
  return [1, 'a'];
}
getTuple().at(-1);