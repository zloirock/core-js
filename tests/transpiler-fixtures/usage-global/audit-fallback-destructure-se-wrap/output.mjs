import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// SE-wrapped fallback receiver: `(0, cond ? Array : Iterator)`. fallback enumeration
// must peel safe-SE tail before reaching the conditional, otherwise the outer SE
// suppresses branch detection and only the consequent's polyfill loads. fix: SE peel
// added to `peelFallbackReceiver` (gates on side-effect-free preceding slots so observable
// effects in the prefix bail rather than silently elide)
const {
  from
} = (0, cond ? Array : Iterator);
from([1, 2]);