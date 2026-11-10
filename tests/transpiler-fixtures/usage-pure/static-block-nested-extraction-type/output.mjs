import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The nested pattern reads the computed array slot in the same static block.
class Box {
  static {
    const key = 'items';
    const at = _atMaybeArray([1, 2]);
    at.call([3, 4], -1);
  }
}