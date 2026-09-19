import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// The global method keeps its normal presence injection beside a user-installed mutation.
// A literal return container retains the scope of its free value.
function pick() {
  return [Array];
}
pick.apply(null, [])[0].from = patched;
export const result = Array.from([1]);