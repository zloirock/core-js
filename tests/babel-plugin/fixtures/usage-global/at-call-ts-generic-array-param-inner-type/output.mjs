import "core-js/modules/es.object.keys";
import "core-js/modules/es.string.at";
function first<T>(arr: T[]): T {
  return arr[0];
}
first(Object.keys(x)).at(0);