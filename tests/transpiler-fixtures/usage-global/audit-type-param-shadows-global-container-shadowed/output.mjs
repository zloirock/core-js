import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function shadowed<Array>(x: Array) {
  return x.at(0);
}