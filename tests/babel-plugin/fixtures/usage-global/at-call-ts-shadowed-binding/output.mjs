import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function foo(x: string) {
  {
    const x = [1, 2, 3];
    x.at(-1);
  }
  x.at(-1);
}