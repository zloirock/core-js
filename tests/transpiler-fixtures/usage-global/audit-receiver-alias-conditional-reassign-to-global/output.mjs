import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// receiver alias M is conditionally reassigned to a global; the init `{}` is not polyfillable, but on
// the branch-taken path M is Array, so usage-global over-injects es.array.from for the reachable
// receiver. the `{}` fall-through path needs nothing.
function f(flag) {
  var M = {};
  if (flag) {
    M = Array;
  }
  return M.from([1, 2, 3]);
}