import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/esnext.iterator.includes";
function foo(x) {
  if (typeof x === 'string' || typeof x === 'number') return;
  x.includes(y);
}