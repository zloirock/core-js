import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A transparent type assertion leaves the excluded receiver's guard and prefix intact.
// The native residual read remains on the selected realm slot.
const {
  Map: {
    missing = fallback()
  }
} = (record(), (globalThis.window as any)?.self);
use(missing);