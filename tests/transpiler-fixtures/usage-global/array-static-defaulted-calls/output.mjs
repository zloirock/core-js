import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.math.sign";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A proven returned array retains the call, native iteration and static property read.
// An empty element default stays in the native pattern for both call spellings.
const makeMath = () => [Math];
const [{
  sign
} = {}] = makeMath?.();
const makeArray = () => [Array, 0];
const [{
  of
} = {}] = makeArray();
use(sign, of);