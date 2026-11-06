import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
// A nested assignment captures its receiver before reading a computed method with a default.
// Sibling targets keep their order, and the assignment yields the original source object.
const leaf = [5, 6];
const source = {
  before: 1,
  get data() {
    log();
    return leaf;
  },
  after: 2
};
let before, method, rest, after;
const result = {
  before,
  data: {
    [(key(), 'at')]: method = fallback(),
    ...rest
  },
  after
} = source;
use(result, before, method.call(leaf, -1), rest, after);