import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// A sole instance read takes the complete selection; shared reads keep one receiver.
function whole(flag, left, right) {
  const {
    at
  } = flag ? left : right;
  return at;
}
function partial(flag, left, right) {
  const {
    includes,
    length
  } = flag ? left : right;
  return [includes, length];
}