import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A capture belongs to one invocation; a later call may capture another receiver family.
// Rebinding after the capture cannot change the saved value of the current invocation.
let value = [0, 2];
function read() {
  const [saved] = [value];
  value = '02';
  return [saved.at(-1), saved.includes('02')];
}
use(read(), read());