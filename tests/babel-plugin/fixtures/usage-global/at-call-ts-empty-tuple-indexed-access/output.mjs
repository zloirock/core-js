import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
type Empty = [];
function f(x: Empty[0]) {
  x.at(0);
}