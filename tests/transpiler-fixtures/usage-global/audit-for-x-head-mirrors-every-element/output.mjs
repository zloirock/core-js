import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// Global also needs Array.from for loop syntax; the separate of twin observes this claim.
// Each realm element supplies its own nested pattern on every iteration.
for (const {
  Array: {
    from
  },
  JSON: J
} of [globalThis, self]) from([J]);