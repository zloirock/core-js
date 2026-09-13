import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
// A default under a computed method key still requires capture of its getter receiver.
// The source, key, default and rest stay in their original evaluation order.
const leaf = [5, 6];
leaf.extra = 7;
const source = {
  before: 1,
  get data() {
    log();
    return leaf;
  },
  after: 2
};
const {
  before,
  data: {
    [(key(), 'at')]: method = fallback(),
    ...rest
  },
  after
} = source;
use(before, method.call(leaf, -1), rest.extra, after);