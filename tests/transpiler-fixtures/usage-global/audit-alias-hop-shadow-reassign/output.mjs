import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
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
const outerRoot = Promise;
const outerLink = outerRoot;
export function viaShadowReassignedLocally(outerRoot) {
  outerRoot = {};
  const {
    allSettled
  } = outerLink;
  return allSettled([]);
}