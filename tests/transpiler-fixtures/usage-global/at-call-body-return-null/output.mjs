import "core-js/modules/es.array.at";
function getData(x) {
  if (!x) return null;
  return [1, 2, 3];
}
getData(x).at(-1);