import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
const of = _Array$of;
// flat destructure off a NESTED proxy-global member (`globalThis.self.Array`) with one
// polyfilled key (`of`) and one retained unpolyfilled key (`other`). the residual destructure
// keeps the receiver, so the intermediate `self` proxy hop must COLLAPSE to the polyfilled
// root (`_globalThis.Array`) - `_globalThis.self` is undefined on ie:11 pure / Node
const {
  other
} = _globalThis.Array;
of(1, 2);
console.log(other);