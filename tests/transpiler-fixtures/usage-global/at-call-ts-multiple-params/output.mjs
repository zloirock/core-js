import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function foo(a: string, b: number[]) {
  a.at(-1);
  b.at(-1);
}