import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function foo<T>(x: T) {
  x.at(-1);
}