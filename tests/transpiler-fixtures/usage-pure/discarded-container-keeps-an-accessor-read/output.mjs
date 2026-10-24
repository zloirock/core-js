import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
const log = [];
const {
  w: {
    from: besideSibling
  }
} = {
  w: Array,
  s: {
    get g() {
      _pushMaybeArray(log).call(log, 'sibling');
      return 1;
    }
  }.g
};
const {
  w: {
    from: plainSlot
  }
} = {
  w: {
    w: Array
  }.w
};
export { besideSibling, plainSlot, log };