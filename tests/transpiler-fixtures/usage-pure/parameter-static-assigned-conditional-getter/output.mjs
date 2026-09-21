import _Object$assign from "@core-js/pure/actual/object/assign";
// A conditional Object.assign store leaves Array reachable when the branch is skipped.
// Global must retain Array.from; pure must preserve the supplied receiver.
const box = {
  value: Array
};
if (flag) _Object$assign(box, {
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