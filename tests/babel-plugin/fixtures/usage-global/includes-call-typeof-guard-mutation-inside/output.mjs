import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
function foo() {
  let x = bar();
  if (typeof x === 'string') {
    x = baz();
    x.includes('a');
  }
}