import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Catch relocation recognizes a computed method beneath a default.
// Getter and key effects remain single reads, and rest excludes the consumed key.
const leaf = [5, 6];
try {
  throw {
    get data() {
      log();
      return leaf;
    }
  };
} catch ({
  data: {
    [(key(), 'at')]: method = fallback(),
    ...rest
  }
}) {
  use(method.call(leaf, -1), rest);
}