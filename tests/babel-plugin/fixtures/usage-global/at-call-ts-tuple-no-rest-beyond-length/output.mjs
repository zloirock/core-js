import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
type T = [number, string];
function f(x: T[2]) {
  x.at(0);
}