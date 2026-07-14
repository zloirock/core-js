import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// the reassignment gates and the hop-scope rule compose: the gate decides WHETHER the captured init
// is still live, the scope rule decides WHERE that init's names resolve. a shadow must not tip either

// the source is reassigned AFTER the alias captured it - the capture stays live, and the param
// shadow of the hop must not swallow it (usage-global keeps the non-dominating reassignment)
let liveRoot = Array;
const liveLink = liveRoot;
liveRoot = Object;
export function viaReassignAfterCapture(liveRoot) {
  const {
    of
  } = liveLink;
  return of(1);
}

// the reassignment DOMINATES the capture - the init is dead, so nothing folds
let deadRoot = Array;
deadRoot = Object;
const deadLink = deadRoot;
export function viaDominatingReassign(deadRoot) {
  const {
    from
  } = deadLink;
  return from([1]);
}

// the SHADOW itself is reassigned locally - a mutation of the inner binding cannot reach the
// outer hop the alias actually captured
const outerRoot = _Promise;
const outerLink = outerRoot;
export function viaShadowReassignedLocally(outerRoot) {
  outerRoot = {};
  const allSettled = _Promise$allSettled;
  return allSettled([]);
}