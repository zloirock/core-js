import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A stored optional receiver preserves the stored value and the guarded member read.
// Exclusion must not turn the native leaf into an unconditional constructor import.
let held;
const {
  Map: {
    missing = fallback()
  }
} = held = (record(), globalThis.window?.self);
use(held, missing);