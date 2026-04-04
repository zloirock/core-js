import "core-js/modules/es.array.at";
function getData(x, ...rest) {
  return x;
}
getData([1, 2, 3], 'a', 'b').at(-1);