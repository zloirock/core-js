import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A sealed optional iterator lookup skips its key only for a nullish receiver.
// A source assignment in that key must not be mistaken for a generated receiver capture.
let arr = ['held'];
export const result = (arr?.[arr = ['swapped'], Symbol.iterator])().next().value;