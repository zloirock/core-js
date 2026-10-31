import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A loop initializer keeps the excluded receiver guard before its residual default.
// No body or update runs when the initializer throws.
for (const {
  Map: {
    missing = fallback()
  }
} = (record(), globalThis.window?.self); test(missing); next()) use(missing);

// A stored receiver uses the same guarded value in the loop header.
let held;
for (const {
  Map: {
    missing = fallback()
  }
} = held = (record(), globalThis.window?.self); running();) {
  use(held, missing);
}