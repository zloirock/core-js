import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A static patched through an array slot keeps the user replacement when destructured.
const patched = [Array];
patched[0].from = function () {
  return [];
};
const patchedSlotStaysNative = function () {
  const {
    0: {
      from
    }
  } = patched;
  return from;
}();
export { patchedSlotStaysNative };