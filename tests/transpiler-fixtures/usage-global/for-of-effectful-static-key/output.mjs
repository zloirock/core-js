import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Global also needs Array.from for loop syntax; the separate of twin observes this claim.
// An effectful computed static key runs once in the for-of head.
for (const {
  [(eff(), 'from')]: viaSeKey
} of [Array]) viaSeKey([]);