import _Object$assign from "@core-js/pure/actual/object/assign";
// A definite Object.assign store replaces the initial constructor with a custom receiver.
const box = {
  value: Array
};
_Object$assign(box, {
  value: {
    from: () => 'custom'
  }
});
function read(held) {
  return held.from([1]);
}
read(box.value);