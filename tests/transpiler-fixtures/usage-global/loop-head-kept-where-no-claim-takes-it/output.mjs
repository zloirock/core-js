import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A loop head or catch pattern is moved into the body only for a claim the moved declaration then
// serves: an instance slot beside rest stays native, a method value carries no instance method,
// and a defaulted element keeps its slot, so those heads print as written. The last head serves.
for (const {
  at,
  ...rest
} of list) use(at, rest);
for (const {
  w: {
    keys
  }
} of [{
  w() {
    return 1;
  }
}]) use(keys);
for (const [{
  findLast = fallback
}] of list) use(findLast);
try {
  risky();
} catch ({
  includes,
  ...others
}) {
  use(includes, others);
}
for (const {
  w: {
    flatMap
  }
} of list) use(flatMap);