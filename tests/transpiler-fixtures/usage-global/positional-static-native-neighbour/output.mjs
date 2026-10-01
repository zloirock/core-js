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
// A static binding precedes a neighbouring native getter, including through a stored array.
// Capturing both positions preserves the getter's observation of the preceding binding.
let sign, other;
const source = {
  get other() {
    return typeof sign;
  }
};
const rows = [Math, source];
[{
  sign
}, {
  other
}] = rows;
const inspect = {
  get next() {
    return typeof of;
  }
};
const values = [Array, inspect];
const [{
  of
}, {
  next
}] = values;
use(sign, other, of, next);