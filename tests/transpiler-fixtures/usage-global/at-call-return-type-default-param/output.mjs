import "core-js/modules/es.string.at";
function identity(x = 42) {
  return x;
}
identity('hello').at(0);