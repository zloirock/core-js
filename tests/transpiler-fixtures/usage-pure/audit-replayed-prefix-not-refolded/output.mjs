import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// Where an SE prefix ends up decides where the host buried in it LANDS, not what it may claim: the
// buried host is a discarded sequence element either way, so it folds its proxy hop and reads off
// the substituted root wherever it sits. What differs is the slot the render owns - a residual that
// RE-ANCHORS onto the hop's own pure carries the prefix inside its rebuilt init and the fold happens
// in place there; a FULL consume LIFTS the prefix into a statement of its own and the fold happens
// there. The for-init sink asks the same question, and its re-anchored residual keeps the ONE
// declarator with the prefix in its value instead of a discard slot beside it.
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
({
  onoffline: cf2
} = _globalThis);
const gb = _Map$groupBy; // ... and the same re-anchor inside a for-init sink keeps one declarator
for (const {
  customFR: fr2
} = ({
  onoffline: cf3
} = _globalThis, _Promise); !outFR;) outFR = fr2;
// a plain SE prefix over a surviving residual keeps its own init too (no buried host)
const tryFn = _Promise$try;
const {
  customP
} = (eff(), _Promise);
export { cf, cf2, cf3, fr, gb, outFR, tryFn, customP };