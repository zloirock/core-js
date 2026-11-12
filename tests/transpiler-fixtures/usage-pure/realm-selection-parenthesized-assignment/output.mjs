import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// A consumed assignment keeps its realm identity and serves both nested statics.
// Parentheses around the realm choice do not change either claim.
const G = _globalThis;
let a, g;
const held = (a = _Promise$allSettled, {
  Map: {
    groupBy: g
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
}, _globalThis);
use(a, g, held === G);