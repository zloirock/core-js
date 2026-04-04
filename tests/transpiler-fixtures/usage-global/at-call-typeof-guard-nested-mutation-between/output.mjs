import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function foo() {
  let x = bar();
  if (typeof x === 'string') {
    if (cond) {
      x = baz();
    }
    x.at(-1);
  }
}