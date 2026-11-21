import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// The global method keeps its normal presence injection beside a user-installed mutation.
// A free return resolves at the declaration, outside the caller's shadow.
const patched = () => 'abc';
function pick() {
  return Array;
}
function install(Array) {
  pick.call(null).from = patched;
}
install({});
export const result = Array.from([1]).at(0);