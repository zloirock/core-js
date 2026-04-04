import "core-js/modules/es.array.at";
import "core-js/modules/es.string.trim";
function pair<T>(a: T, b: T): [T, T] {
  return [a, b];
}
pair('x', 'y').at(0).trim();