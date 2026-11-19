import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A literal host keeps its static Array.from read and captures the instance flat receiver.
// The two sibling branches retain their original source bindings and order.
const arr = [1, [2]];
const _ref = {
  x: Array,
  y: arr
};
const {
  x: {
    from: f
  }
} = _ref;
const m = _flatMaybeArray(_ref.y);