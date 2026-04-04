import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
const result = function f(n) {
  return n <= 0 ? [] : f(n - 1);
}(5);
result.at(0);