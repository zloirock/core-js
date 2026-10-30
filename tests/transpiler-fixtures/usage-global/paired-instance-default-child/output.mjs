import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
// A parameter default keeps its child static read.
// The instance dispatch must still use the supplied or defaulted receiver.
export function read({
  k: {
    includes
  }
} = {
  k: Array.from([4, 9])
}) {
  return includes;
}