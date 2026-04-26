import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `[...iter]` array spread: the iteration protocol must be polyfilled because spread
// consumes the iterator at runtime.
const a = [...arr];