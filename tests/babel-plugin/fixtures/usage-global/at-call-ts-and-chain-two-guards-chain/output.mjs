import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function foo(x: string | number | number[]) {
  if (typeof x !== 'string' && !Array.isArray(x)) {
    x.at(-1);
  }
}