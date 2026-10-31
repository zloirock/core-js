import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A discarded keyed assignment keeps its default in the raw slot.
// The overwrite follows it inside the sequence and reads the substituted realm.
let method;
const after = ({
  [(effect(), Symbol.iterator)]: method = fallback()
} = globalThis, finish());