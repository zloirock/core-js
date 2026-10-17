import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested constructor slot from a conditional realm alias keeps the outer identity guard.
// Its child pattern reads static properties from that constructor's complete pure namespace.
function read(enabled) {
  if (enabled) {
    var realm = globalThis;
  }
  const {
    Promise: {
      allSettled
    }
  } = realm;
  return typeof allSettled;
}