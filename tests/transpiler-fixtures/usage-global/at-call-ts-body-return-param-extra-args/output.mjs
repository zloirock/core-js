import "core-js/modules/es.array.at";
function getData(x) {
  return x;
}
getData([1, 2, 3], "extra", true).at(-1);