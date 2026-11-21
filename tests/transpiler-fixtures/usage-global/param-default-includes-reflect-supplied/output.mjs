import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
function f(value = [1]) {
  return value.includes('a');
}
export default Reflect.apply(f, null, ['ab']);