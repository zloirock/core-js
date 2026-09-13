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
// A guarded constructor result read through a member owes its full namespace for the file.
// Direct reads and guarded reads of that constructor must use the same imported identity.
function read(enabled) {
  if (enabled) {
    var realm = globalThis;
  }
  const same = realm.Promise === Promise;
  return [same, typeof realm.Promise.allSettled];
}