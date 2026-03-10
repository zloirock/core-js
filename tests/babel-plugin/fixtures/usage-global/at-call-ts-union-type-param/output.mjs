import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function foo(x: string | number[]) {
  x.at(-1);
}