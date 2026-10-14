import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// An iterator claim keyed by an effect beside a plain slot, in a for-init over a realm selection: the
// iterator key loads its symbol beside both realm roots.
for (const {
  [(e(), Symbol.iterator)]: it,
  z
} = c ? globalThis : self;;) break;