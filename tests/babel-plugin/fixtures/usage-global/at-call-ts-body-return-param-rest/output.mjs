import "core-js/modules/es.array.at";
function getData(...args) {
  return args;
}
getData(1, 2, 3).at(-1);