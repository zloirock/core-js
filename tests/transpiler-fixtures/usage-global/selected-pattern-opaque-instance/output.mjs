import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.entries";
// An unreadable selected arm leaves the receiver set open.
// Global injection must retain instance entries; pure keeps the unknown presence test native.
function read(flag, factory) {
  let O = null;
  [O] = flag ? [Object] : factory();
  return 'entries' in O;
}
export const result = [read(true, () => [[]]), read(false, () => [[]])];