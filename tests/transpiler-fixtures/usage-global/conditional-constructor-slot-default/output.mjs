import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A well-known symbol must be present before the user's leaf default is considered.
let S;
if (true) ({
  Symbol: S
} = globalThis);
const {
  iterator: value = 'fallback'
} = S;
export const result = typeof value;