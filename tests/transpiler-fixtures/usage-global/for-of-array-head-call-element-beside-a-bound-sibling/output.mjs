import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.math.clz32";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A call element beside a BOUND sibling runs the call once: the head mirrors the claim's slot in a literal
// of its own, and the sibling reads its slot off that one call where the source read it.
const pairing = () => [Math, 1];
for (const [{
  clz32: viaCallSibling
}, next] of [pairing()]) use(viaCallSibling(1), next);