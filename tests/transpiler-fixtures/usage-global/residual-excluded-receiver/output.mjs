import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Excluding the realm leaf keeps its native property read behind the window guard.
// The prefix runs once; a nullish receiver throws before the nested default.
const {
  Map: {
    missing = fallback()
  }
} = (record(), globalThis.window?.self);
use(missing);