import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
function foo(a: string, b: number[]) {
  a.at(-1);
  b.includes(3);
}