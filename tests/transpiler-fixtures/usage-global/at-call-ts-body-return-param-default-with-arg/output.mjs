import "core-js/modules/es.string.at";
function getData(x = "fallback") {
  return x;
}
getData([1, 2, 3]).at(-1);