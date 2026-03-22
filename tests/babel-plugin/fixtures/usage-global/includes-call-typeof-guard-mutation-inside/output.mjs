import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
function foo() {
  let x = bar();
  if (typeof x === 'string') {
    x = baz();
    x.includes('a');
  }
}