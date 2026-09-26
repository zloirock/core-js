import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Capture each element once, then evaluate its computed key before the method read.
// The sibling binding keeps its position after that read.
const log = [];
function mark(tag, value) {
  log.push(tag);
  return value;
}
let viaMulti, tail, viaSole;
[{
  [(mark('k'), 'at')]: viaMulti
}, tail] = [mark('r', Array.prototype), 7];
[{
  [(mark('s'), 'flat')]: viaSole
}] = [mark('e', Array.prototype)];
export { viaMulti, tail, viaSole, log };