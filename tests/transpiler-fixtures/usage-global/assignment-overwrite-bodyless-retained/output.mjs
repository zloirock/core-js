import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The raw keyed default and its overwrite stay inside the unbraced branch.
// A realm rewrite must remain visible to the later receiver read.
let method;
if (enabled) ({
  [(effect(), Symbol.iterator)]: method = fallback()
} = globalThis);