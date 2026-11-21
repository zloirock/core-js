import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// The global method keeps its normal presence injection beside a user-installed mutation.
// Unknown apply arguments do not hide a return independent of those arguments.
const patched = () => 'abc';
const args = [];
function pick(ignored) {
  return Array;
}
pick.apply(null, args).from = patched;
export const result = Array.from([1]).at(0);