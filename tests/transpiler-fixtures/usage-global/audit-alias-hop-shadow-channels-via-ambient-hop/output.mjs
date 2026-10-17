import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
// an AMBIENT `declare var` hop carries no known value - the chain stays unresolved
declare var ambientRoot: typeof Promise;
const ambientLink = ambientRoot;
export function viaAmbientHop() {
  const {
    allSettled
  } = ambientLink;
  return allSettled([]);
}