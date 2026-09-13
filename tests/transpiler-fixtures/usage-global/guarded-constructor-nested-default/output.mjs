import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
// A conditional realm feeds a nested constructor pattern with a live default.
// The constructor and the default's Array.of each need their own polyfill.
function read(enabled) {
  if (enabled) {
    var realm = globalThis;
  }
  const {
    Promise: {
      missing = Array.of(7)
    }
  } = realm;
  return missing;
}
export const value = read(true);