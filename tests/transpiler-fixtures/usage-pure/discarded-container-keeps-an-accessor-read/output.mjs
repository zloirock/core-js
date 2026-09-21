import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Accessor reads inside a receiver literal run once even when their values are discarded.
// Unclaimed sibling slots retain their effects beside the mirrored static.
const log = [];
const {
  w: {
    from: besideSibling
  }
} = {
  w: {
    from: _Array$from
  },
  s: {
    get g() {
      _pushMaybeArray(log).call(log, 'sibling');
      return 1;
    }
  }.g
};
// NEGATIVE: a plain data slot answers without running anything, so nothing is replayed for it
const {
  w: {
    from: plainSlot
  }
} = {
  w: {
    from: _Array$from
  }
};
export { besideSibling, plainSlot, log };