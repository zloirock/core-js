import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The array slot is captured once inside the conditional body.
// Its residual length read and method extraction keep their shared receiver.
const events = [];
const values = [4, 5];
function source() {
  events.push('source');
  return values;
}
if (enabled) var [{
  at: method,
  length: size
}] = [source()];
export { method, size, events };