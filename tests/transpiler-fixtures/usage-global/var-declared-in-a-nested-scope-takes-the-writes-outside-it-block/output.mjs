import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A var declared in this nested host belongs to its function.
// A closure write reaches the later read, so dispatch includes both receiver families.
export function f(c) {
  {
    var b = 'abc';
    w();
    use(b.includes('a'));
  }
  function w() {
    b = [1];
  }
}