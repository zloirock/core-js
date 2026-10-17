import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// A claimed element followed by another keeps the whole array wrapper: an effectful neighbour still
// runs after the claimed element's own prefix and a pure one is carried along, while the static is
// served by a literal in the claimed slot.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const [{
  Object: {
    fromEntries
  }
}] = [(eff('e'), {
  Object: {
    fromEntries: _Object$fromEntries
  }
}), eff('f')];
const [{
  Promise: {
    allSettled
  }
}] = [(eff('g'), {
  Promise: {
    allSettled: _Promise$allSettled
  }
}), 7];
export { fromEntries, allSettled, seen };