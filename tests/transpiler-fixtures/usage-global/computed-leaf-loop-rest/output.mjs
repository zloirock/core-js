import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested computed method with a default needs capture in the loop body.
// Each iteration keeps its own method and rest, with one getter read per element.
const leaf = [5, 6];
for (const {
  data: {
    [(key(), 'at')]: method = fallback(),
    ...rest
  }
} of [{
  get data() {
    log();
    return leaf;
  }
}]) {
  use(method.call(leaf, -1), rest);
}