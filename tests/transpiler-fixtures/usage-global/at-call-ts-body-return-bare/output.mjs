import "core-js/modules/es.array.at";
function getData(x) {
  if (x) return [1, 2, 3];
  return;
}
getData(true).at(-1);