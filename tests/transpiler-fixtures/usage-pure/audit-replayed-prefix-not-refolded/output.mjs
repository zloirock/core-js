import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// An assignment buried in a receiver prefix keeps its own polyfill and effects.
// Declaration, assignment and loop-header hosts preserve the prefix's evaluation order.
function eff() {
  return 0;
}
let cf, cf2, cf3, outFR;
// RE-ANCHORED residual: the prefix rides the rebuilt init, and the buried host folds inside it
const {
  customFR: fr
} = ({
  onoffline: cf
} = _globalThis, _Promise);
// FULL consume: the prefix lifts as its own statement and the buried host folds there
const {
  Map: {
    groupBy: gb
  }
} = ({
  onoffline: cf2
} = _globalThis, {
  Map: {
    groupBy: _Map$groupBy
  }
});
// ... and the same re-anchor inside a for-init sink keeps one declarator
for (const {
  customFR: fr2
} = ({
  onoffline: cf3
} = _globalThis, _Promise); !outFR;) outFR = fr2;
// a plain SE prefix over a surviving residual keeps its own init too (no buried host)
const {
  Promise: {
    try: tryFn,
    customP
  }
} = (eff(), {
  Promise: {
    try: _Promise$try,
    customP: _Promise.customP
  }
});
export { cf, cf2, cf3, fr, gb, outFR, tryFn, customP };