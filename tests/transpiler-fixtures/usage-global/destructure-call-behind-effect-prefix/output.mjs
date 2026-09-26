import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.math.cbrt";
import "core-js/modules/es.math.sign";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A call standing behind a sequence prefix runs after that prefix, which a lifted extraction would
// reorder, so the destructure keeps its native read; an OPTIONAL call to a proven callee is stepped
// like a plain one, whichever parser spells it. The prefixed literal twin mirrors its element in
// place, the prefix still first.
const log = [];
const make = () => (log.push('make'), [Math]);
const [{
  trunc: viaPrefixed
} = {}] = (log.push('prefix'), make());
const [{
  sign: viaOptional
} = {}] = make?.();
const [{
  cbrt: viaLiteral
} = {}] = (log.push('literal'), [Math]);
export { viaPrefixed, viaOptional, viaLiteral, log };