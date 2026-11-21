import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.array.includes";
function f(value = [1]) {
  return value.includes('a');
}
export default Reflect.apply(f, null, []);