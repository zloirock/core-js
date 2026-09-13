import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A well-known symbol read above a guarded realm alias uses the constructor's full namespace.
// The false branch still reads the source receiver and preserves an absent-alias throw.
function read(enabled, value) {
  if (enabled) {
    var realm = globalThis;
  }
  return realm.Symbol.iterator in value;
}