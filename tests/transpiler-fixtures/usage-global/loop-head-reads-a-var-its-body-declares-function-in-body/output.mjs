import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
export function functionInBody() {
  for (var i = f().includes(5); !i;) {
    function f() {
      return [5];
    }
    i = f;
  }
  return i;
}