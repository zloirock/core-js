import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A conditional Object.assign store leaves Array reachable when the branch is skipped.
// Global must retain Array.from; pure must preserve the supplied receiver.
const box = {
  value: Array
};
if (flag) Object.assign(box, {
  get value() {
    return {
      from: () => 'custom'
    };
  }
});
function read(held) {
  return held.from([1]);
}
read(box.value);