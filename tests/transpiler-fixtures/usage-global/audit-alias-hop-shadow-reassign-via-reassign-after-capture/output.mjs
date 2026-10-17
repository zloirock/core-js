import "core-js/modules/es.array.of";
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