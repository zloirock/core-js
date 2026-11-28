import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
function foo(x: string | number[]) {
  return Array.isArray(x) ? x.at(-1) : x.includes('a');
}