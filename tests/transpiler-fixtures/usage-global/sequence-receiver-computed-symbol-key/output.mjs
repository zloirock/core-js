import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Nested receiver prefixes evaluate before its tail is captured.
// A later computed symbol-key write cannot replace the selected iterator receiver.
let arr;
const log = [];
export const result = (log.push('first'), log.push('second'), arr = ['held'], arr)[Symbol[log.push('key'), arr = ['swapped'], 'iterator']]().next().value;