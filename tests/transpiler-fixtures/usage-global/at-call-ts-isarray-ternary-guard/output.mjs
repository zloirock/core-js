import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function foo(x: string | number[]) {
  return Array.isArray(x) ? x.at(-1) : x.at(0);
}