import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// The global method keeps its normal presence injection beside a user-installed mutation.
// A free return resolves at the declaration, outside the caller's shadow.
function pick() {
  return Array;
}
function install(Array) {
  pick.call(null).from = patched;
}
install({});
export const result = Array.from([1]);