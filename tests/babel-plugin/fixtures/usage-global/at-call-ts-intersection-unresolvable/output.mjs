import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function foo(x: Foo & Bar) {
  x.at(-1);
}