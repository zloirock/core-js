import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A trailing array element keeps the whole wrapper and its native static property read.
// The selected element's prefix runs before the effectful or quiet neighbour.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const [{
  Object: {
    fromEntries
  }
}] = [(eff('e'), _globalThis), eff('f')];
const [{
  Promise: {
    allSettled
  }
}] = [(eff('g'), _globalThis), 7];
export { fromEntries, allSettled, seen };