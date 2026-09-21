import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Closed callers prove the native constructor through the supplied value.
// Only the selected static is required.
const box = {
  value: Array
};
function read(held) {
  return held.from([1]);
}
read(box.value);